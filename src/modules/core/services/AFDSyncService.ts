import { adminStorage } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { AFDParser } from './AFDParser';

interface SyncResult {
    filesProcessed: number;
    punchesImported: number;
    punchesSkipped: number;
    employeesFound: number;
    employeesNotFound: string[];
    errors: string[];
}

export class AFDSyncService {
    async sync(): Promise<SyncResult> {
        const result: SyncResult = {
            filesProcessed: 0,
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

            employees.forEach(emp => {
                if (emp.pis) {
                    const cleanPis = emp.pis.replace(/\D/g, '').replace(/^0+/, '');
                    if (cleanPis) pisMap.set(cleanPis, emp.id);
                }
                if (emp.cpf) {
                    const cleanCpf = emp.cpf.replace(/\D/g, '').replace(/^0+/, '');
                    if (cleanCpf) cpfMap.set(cleanCpf, emp.id);
                }
            });

            // 3. List all terminal folders in Firebase Storage
            const [files] = await adminStorage.getFiles({ prefix: 'afd_terminals/' });

            // Filter only files named 'latest.txt'
            const latestFiles = files.filter(f => f.name.endsWith('/latest.txt'));

            if (latestFiles.length === 0) {
                console.log('[SYNC] No terminal files found in Firebase Storage.');
                return result;
            }

            // 4. Process each terminal file
            for (const file of latestFiles) {
                const terminalName = file.name.split('/')[1];
                try {
                    const [contentBuffer] = await file.download();
                    const content = contentBuffer.toString('utf8');

                    const parsed = AFDParser.parseFile(content);
                    const recordsToCreate: any[] = [];

                    // Filter only new punches (NSR > lastNSR)
                    const newPunches = parsed.punches.filter(p => {
                        const nsrVal = p.nsr ? parseInt(p.nsr) : 0;
                        return nsrVal > lastNSR;
                    });

                    if (newPunches.length === 0) {
                        result.punchesSkipped += parsed.punches.length;
                        continue;
                    }

                    for (const punch of newPunches) {
                        if (!punch.date || !punch.time || !punch.pis) continue;

                        const rawId = punch.pis.replace(/\D/g, '').replace(/^0+/, '');
                        let empId = pisMap.get(rawId) || cpfMap.get(rawId);

                        // Fallback matching
                        if (!empId && rawId.length > 11) {
                            const shortId = rawId.slice(-11).replace(/^0+/, '');
                            empId = pisMap.get(shortId) || cpfMap.get(shortId);
                        }

                        if (empId) result.employeesFound++;
                        else if (!result.employeesNotFound.includes(punch.pis)) {
                            result.employeesNotFound.push(punch.pis);
                        }

                        recordsToCreate.push({
                            pis: punch.pis,
                            employeeId: empId || null,
                            date: punch.date,
                            time: punch.time,
                            nsr: punch.nsr,
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
                                    fileName: `Firebase: ${terminalName}`,
                                    fileHash: `fb_${terminalName}_${Date.now()}`,
                                    status: 'DONE',
                                    store: terminalName,
                                    errorLog: `Importados ${recordsToCreate.length} pontos.`
                                }
                            });
                        });
                        result.punchesImported += recordsToCreate.length;
                    }

                    result.filesProcessed++;
                } catch (fileError: any) {
                    result.errors.push(`Terminal ${terminalName}: ${fileError.message}`);
                }
            }

            // 6. Log completion if anything happened
            if (result.punchesImported > 0) {
                await prisma.timeClockFile.create({
                    data: {
                        fileName: `Sync Firebase: ${new Date().toLocaleDateString('pt-BR')}`,
                        fileHash: `sync_fb_${Date.now()}`,
                        status: result.errors.length > 0 ? 'PARTIAL' : 'DONE',
                        errorLog: `Sincronização concluída para ${result.filesProcessed} terminais.`,
                        store: 'Sistema'
                    }
                });
            }

        } catch (error: any) {
            result.errors.push(`Firebase/Prisma error: ${error.message}`);
        }

        return result;
    }
}
