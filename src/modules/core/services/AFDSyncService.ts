import { prisma } from '@/lib/prisma';

interface SyncResult {
    filesProcessed: number;
    punchesImported: number;
    punchesSkipped: number;
    employeesFound: number;
    employeesNotFound: string[];
    errors: string[];
}

export class AFDSyncService {
    /**
     * Receives an array of punches from the remote collector via Webhook.
     * Expected punch format: { nsr: '123...', date: '15082023', time: '0830', pis: '12345678901' }
     */
    async syncWebhook(incomingPunches: any[], terminalName: string): Promise<SyncResult> {
        const result: SyncResult = {
            filesProcessed: 1,
            punchesImported: 0,
            punchesSkipped: 0,
            employeesFound: 0,
            employeesNotFound: [],
            errors: []
        };

        try {
            // 1. Get the highest NSR already in our DB
            const lastRecord = await prisma.timeRecord.findFirst({
                where: { nsr: { not: null } },
                orderBy: { nsr: 'desc' },
                select: { nsr: true }
            });
            const lastNSR = lastRecord?.nsr ? parseInt(lastRecord.nsr) : 0;

            // 2. Load all employees into memory for fast matching
            const employees = await prisma.employee.findMany({
                where: { status: { in: ['ACTIVE', 'TERMINATED'] } },
                select: { id: true, pis: true, cpf: true }
            });

            const pisMap = new Map<string, string>();
            const cpfMap = new Map<string, string>();

            const cleanIdString = (id: string | null | undefined) => {
                if (!id) return '';
                // Remove everything that is not a digit, and remove leading zeros
                return String(id).replace(/\D/g, '').replace(/^0+/, '');
            };

            employees.forEach(emp => {
                const cleanPis = cleanIdString(emp.pis);
                if (cleanPis) pisMap.set(cleanPis, emp.id);

                const cleanCpf = cleanIdString(emp.cpf);
                if (cleanCpf) cpfMap.set(cleanCpf, emp.id);
            });

            const recordsToCreate: any[] = [];

            // 3. Filter only new punches
            const newPunches = incomingPunches.filter(p => {
                const nsrVal = p.nsr ? parseInt(String(p.nsr)) : 0;
                return nsrVal > lastNSR;
            });

            if (newPunches.length === 0) {
                result.punchesSkipped += incomingPunches.length;
                return result;
            }

            // 4. Process each new punch
            for (const punch of newPunches) {
                if (!punch.date || !punch.time || !punch.pis) continue;

                // Handle Date (Usually DDMMAAAA from AFD format)
                let punchDate: Date;
                if (typeof punch.date === 'string' && punch.date.length === 8 && !punch.date.includes('-')) {
                    const day = parseInt(punch.date.substring(0, 2));
                    const month = parseInt(punch.date.substring(2, 4)) - 1;
                    const year = parseInt(punch.date.substring(4, 8));
                    punchDate = new Date(Date.UTC(year, month, day));
                } else {
                    punchDate = new Date(punch.date);
                }

                if (isNaN(punchDate.getTime())) continue; // Ignore invalid dates

                // Handle Time (Usually HHMM from AFD format)
                let punchTime = punch.time;
                if (typeof punchTime === 'string' && punchTime.length === 4 && !punchTime.includes(':')) {
                    punchTime = `${punchTime.substring(0, 2)}:${punchTime.substring(2, 4)}`;
                }

                // 4.1 VERY AGGRESSIVE MATCHING FOR PIS/CPF
                const rawId = cleanIdString(punch.pis);
                let empId = pisMap.get(rawId) || cpfMap.get(rawId);

                // Fallback matching (Some clocks send 11 digits instead of 12 or 14, stripping leading zeros above helps, but let's be safe)
                if (!empId && rawId.length >= 10) {
                    const shortId = rawId.slice(-10); // Check last 10 digits
                    empId = pisMap.get(shortId) || cpfMap.get(shortId);
                }


                if (empId) result.employeesFound++;
                else if (!result.employeesNotFound.includes(punch.pis)) {
                    result.employeesNotFound.push(punch.pis);
                }

                recordsToCreate.push({
                    pis: String(punch.pis),
                    employeeId: empId || null,
                    date: punchDate,
                    time: punchTime,
                    nsr: String(punch.nsr),
                    originalLine: null,
                    isManual: false
                });
            }

            // 5. Atomic Batch Insert
            if (recordsToCreate.length > 0) {
                await prisma.$transaction(async (tx) => {
                    await tx.timeRecord.createMany({
                        data: recordsToCreate,
                        skipDuplicates: true
                    });

                    await tx.timeClockFile.create({
                        data: {
                            fileName: `Webhook: ${terminalName}`,
                            fileHash: `wh_${terminalName}_${Date.now()}`,
                            status: 'DONE',
                            store: terminalName,
                            errorLog: `Importados ${recordsToCreate.length} pontos via Webhook.`
                        }
                    });
                });
                result.punchesImported += recordsToCreate.length;
            }

        } catch (error: any) {
            result.errors.push(`Prisma/Sync error: ${error.message}`);
        }

        return result;
    }
}
