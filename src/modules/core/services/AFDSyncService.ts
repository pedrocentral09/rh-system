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

                    // Build PIS -> Employee map
                    const allPis = parsed.punches.map(p => p.pis);
                    const uniquePis = [...new Set(allPis)];

                    const employees = await prisma.employee.findMany({
                        where: { pis: { in: uniquePis } },
                        select: { id: true, pis: true }
                    });

                    const pisToEmployee = new Map(
                        employees.map((e: { id: string; pis: string }) => [e.pis, e.id])
                    );

                    result.employeesFound += employees.length;

                    // Track unmatched PIS
                    for (const pis of uniquePis) {
                        if (!pisToEmployee.has(pis) && !result.employeesNotFound.includes(pis)) {
                            result.employeesNotFound.push(pis);
                        }
                    }

                    // Import punches
                    let imported = 0;
                    for (const punch of parsed.punches) {
                        const employeeId = pisToEmployee.get(punch.pis) || null;

                        // Check for duplicate (same PIS + Date + Time)
                        const existing = await prisma.timeRecord.findFirst({
                            where: {
                                pis: punch.pis,
                                date: punch.date,
                                time: punch.time
                            }
                        });

                        if (existing) {
                            result.punchesSkipped++;
                            continue;
                        }

                        await prisma.timeRecord.create({
                            data: {
                                fileId: clockFile.id,
                                pis: punch.pis,
                                employeeId,
                                date: punch.date,
                                time: punch.time,
                                nsr: punch.nsr,
                                originalLine: null,
                                isManual: false
                            }
                        });
                        imported++;
                    }

                    result.punchesImported += imported;

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
