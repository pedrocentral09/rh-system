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

            // 1. Get all AFD files from external DB
            const { rows: afdFiles } = await client.query(
                'SELECT id, filename, content, created_at FROM afd_files ORDER BY id'
            );

            // 2. Get already-imported file hashes to avoid re-processing
            const importedFiles = await prisma.timeClockFile.findMany({
                select: { fileHash: true }
            });
            const importedHashes = new Set(importedFiles.map((f: { fileHash: string }) => f.fileHash));

            // 3. Process each file
            for (const afdFile of afdFiles) {
                const fileHash = crypto
                    .createHash('md5')
                    .update(afdFile.content)
                    .digest('hex');

                if (importedHashes.has(fileHash)) {
                    result.punchesSkipped++;
                    continue; // Already imported
                }

                try {
                    const parsed = AFDParser.parseFile(afdFile.content);

                    // Create file record
                    const clockFile = await prisma.timeClockFile.create({
                        data: {
                            fileName: afdFile.filename || `afd_external_${afdFile.id}`,
                            fileHash,
                            status: 'PROCESSING'
                        }
                    });

                    // 4. Resolve PIS/CPF -> EmployeeID
                    // Fetch all active/terminated employees for matching
                    const employees = await prisma.employee.findMany({
                        where: { status: { in: ['ACTIVE', 'TERMINATED'] } },
                        select: { id: true, pis: true, cpf: true }
                    });

                    const pisMap = new Map<string, string>();
                    const cpfMap = new Map<string, string>();

                    employees.forEach(emp => {
                        if (emp.pis) pisMap.set(emp.pis.replace(/\D/g, ''), emp.id);
                        if (emp.cpf) cpfMap.set(emp.cpf.replace(/\D/g, ''), emp.id);
                    });

                    // 5. Build Records Data
                    const recordsToCreate = [];
                    const uniquePunches = new Set<string>();

                    for (const punch of parsed.punches) {
                        const rawId = punch.pis.replace(/\D/g, '');
                        let empId = pisMap.get(rawId);

                        // Robust Matching Logic
                        if (!empId) {
                            const c1 = rawId.startsWith('0') ? rawId.substring(1) : rawId;
                            if (cpfMap.has(c1)) empId = cpfMap.get(c1);
                        }
                        if (!empId && rawId.length >= 11) {
                            const c2 = rawId.slice(-11);
                            if (cpfMap.has(c2)) empId = cpfMap.get(c2);
                        }
                        if (!empId) {
                            const asNum = rawId.replace(/^0+/, '');
                            if (cpfMap.has(asNum)) empId = cpfMap.get(asNum);
                        }

                        if (empId) {
                            result.employeesFound++;
                        } else if (!result.employeesNotFound.includes(punch.pis)) {
                            result.employeesNotFound.push(punch.pis);
                        }

                        // Check for duplicate in current build or DB
                        const punchKey = `${punch.pis}_${punch.date.toISOString().split('T')[0]}_${punch.time}`;
                        if (uniquePunches.has(punchKey)) continue;
                        uniquePunches.add(punchKey);

                        // Partial check against DB (slow but necessary for atomicity here)
                        const existing = await prisma.timeRecord.findFirst({
                            where: {
                                pis: punch.pis,
                                date: punch.date,
                                time: punch.time
                            },
                            select: { id: true }
                        });

                        if (existing) {
                            result.punchesSkipped++;
                            continue;
                        }

                        recordsToCreate.push({
                            fileId: clockFile.id,
                            pis: punch.pis,
                            employeeId: empId || null,
                            date: punch.date,
                            time: punch.time,
                            nsr: punch.nsr,
                            originalLine: null,
                            isManual: false
                        });
                    }

                    // 6. Batch Insert
                    if (recordsToCreate.length > 0) {
                        await prisma.timeRecord.createMany({
                            data: recordsToCreate
                        });
                        result.punchesImported += recordsToCreate.length;
                    }

                    // Update file status
                    await prisma.timeClockFile.update({
                        where: { id: clockFile.id },
                        data: { status: 'DONE' }
                    });

                    result.filesProcessed++;
                } catch (fileError: any) {
                    result.errors.push(
                        `File ${afdFile.filename}: ${fileError.message}`
                    );
                }
            }
        } catch (error: any) {
            result.errors.push(`Connection error: ${error.message}`);
        } finally {
            await client.end();
        }

        return result;
    }
}
