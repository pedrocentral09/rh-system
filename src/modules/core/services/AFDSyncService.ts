import { Client } from 'pg';
import { prisma } from '@/lib/prisma';
import { AFDParser } from './AFDParser';
import crypto from 'crypto';

interface SyncResult {
    filesProcessed: number;
    punchesImported: number;
    punchesSkipped: number;
    employeesFound: number;
    employeesNotFound: string[];
    errors: string[];
}

export class AFDSyncService {
    private externalDbUrl: string;

    constructor(externalDbUrl: string) {
        this.externalDbUrl = externalDbUrl;
    }

    async sync(): Promise<SyncResult> {
        const result: SyncResult = {
            filesProcessed: 0,
            punchesImported: 0,
            punchesSkipped: 0,
            employeesFound: 0,
            employeesNotFound: [],
            errors: []
        };

        const client = new Client(this.externalDbUrl);

        try {
            await client.connect();

            // 1. Get the highest NSR already in our DB to avoid duplicates and speed up
            const lastRecord = await prisma.timeRecord.findFirst({
                where: { nsr: { not: null } },
                orderBy: { nsr: 'desc' },
                select: { nsr: true }
            });
            const lastNSR = lastRecord?.nsr ? parseInt(lastRecord.nsr) : 0;

            // 2. Load all employees into memory for fast matching
            const employees = await prisma.employee.findMany({
                where: { status: { in: ['ACTIVE', 'TERMINATED'] } },
                select: { id: true, pis: true, cpf: true, name: true }
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

            // 3. Get all AFD files from external DB (Only recent ones to avoid massive memory usage)
            // We order by ID desc to get the latest first, but we need to process in order if possible.
            // Actually, if we filter by content length or just take the top X, it might be safer.
            const { rows: afdFiles } = await client.query(
                'SELECT id, filename, content FROM afd_files ORDER BY id DESC LIMIT 20'
            );

            // 4. Process each file
            for (const afdFile of afdFiles) {
                try {
                    const parsed = AFDParser.parseFile(afdFile.content);
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
                        // Basic Validation
                        if (!punch.date || !punch.time || !punch.pis) {
                            result.errors.push(`File ${afdFile.filename}: Incomplete punch data skipped (NSR: ${punch.nsr})`);
                            continue;
                        }

                        const rawId = punch.pis.replace(/\D/g, '').replace(/^0+/, '');
                        let empId = pisMap.get(rawId) || cpfMap.get(rawId);

                        // Fallback matching
                        if (!empId && rawId.length > 11) {
                            const shortId = rawId.slice(-11).replace(/^0+/, '');
                            empId = pisMap.get(shortId) || cpfMap.get(shortId);
                        }

                        if (empId) {
                            result.employeesFound++;
                        } else {
                            if (!result.employeesNotFound.includes(punch.pis)) {
                                result.employeesNotFound.push(punch.pis);
                                console.warn(`[SYNC] Employee not found for ID: ${punch.pis} (Parsed: ${rawId}) in file ${afdFile.filename}`);
                            }
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

                    // 5. Atomic Batch Insert and Log for this file
                    if (recordsToCreate.length > 0) {
                        await prisma.$transaction(async (tx) => {
                            await tx.timeRecord.createMany({
                                data: recordsToCreate,
                                skipDuplicates: true
                            });

                            // Create an individual file record for traceability
                            await tx.timeClockFile.create({
                                data: {
                                    fileName: afdFile.filename,
                                    fileHash: `sync_${afdFile.id}_${Date.now()}`,
                                    status: 'DONE',
                                    store: 'Sincronização Externa',
                                    errorLog: `Importados ${recordsToCreate.length} pontos (NSRs: ${newPunches[0]?.nsr} a ${newPunches[newPunches.length - 1]?.nsr})`
                                }
                            });
                        });
                        result.punchesImported += recordsToCreate.length;
                    }

                    result.filesProcessed++;
                } catch (fileError: any) {
                    result.errors.push(`File ${afdFile.filename}: ${fileError.message}`);
                }
            }

            // 6. Log the overall sync summary if anything was imported
            if (result.punchesImported > 0 || result.errors.length > 0) {
                await prisma.timeClockFile.create({
                    data: {
                        fileName: `Sync Automático: ${new Date().toLocaleDateString('pt-BR')}`,
                        fileHash: `sync_${Date.now()}_${result.punchesImported}`,
                        status: result.errors.length > 0 ? 'PARTIAL' : 'DONE',
                        errorLog: result.errors.length > 0 ? result.errors.join('\n') : `Importados ${result.punchesImported} novos pontos.`,
                        store: 'Sistema'
                    }
                });
            }

        } catch (error: any) {
            result.errors.push(`Connection error: ${error.message}`);
        } finally {
            await client.end();
        }

        return result;
    }
}
