'use server';

import { prisma } from '@/lib/prisma';
import { parseAFD } from './utils/afd-parser';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function uploadAFD(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const storeName = formData.get('store') as string || 'Unknown';

        if (!file) {
            return { success: false, error: 'Nenhum arquivo enviado.' };
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder('utf-8').decode(buffer); // AFD usually UTF-8 or ANSI? Usually ANSI but UTF-8 decoding usually works for numbers/basic text.

        // 1. Hash Check
        const hash = crypto.createHash('md5').update(content).digest('hex');
        const existingFile = await prisma.timeClockFile.findUnique({
            where: { fileHash: hash }
        });

        if (existingFile) {
            return { success: false, error: 'Este arquivo já foi importado anteriormente.' };
        }

        // 2. Parse
        const markings = parseAFD(content);

        if (markings.length === 0) {
            return { success: false, error: 'Nenhuma marcação de ponto encontrada no arquivo.' };
        }

        // 3. Create File Record
        const timeFile = await prisma.timeClockFile.create({
            data: {
                fileName: file.name,
                fileHash: hash,
                store: storeName,
                status: 'PROCESSING'
            }
        });

        // 4. Resolve PIS/CPF -> EmployeeID
        // Improve performance: Fetch all active employees with PIS and CPF
        const employees = await prisma.employee.findMany({
            where: {
                status: { in: ['ACTIVE', 'TERMINATED'] }
            },
            select: { id: true, pis: true, cpf: true }
        });

        const pisMap = new Map<string, string>();
        const cpfMap = new Map<string, string>();

        employees.forEach(emp => {
            if (emp.pis) pisMap.set(emp.pis.replace(/\D/g, ''), emp.id); // Normalize DB PIS
            if (emp.cpf) cpfMap.set(emp.cpf.replace(/\D/g, ''), emp.id); // Normalize DB CPF
        });

        // 5. Build Records
        const recordsData = markings.map(m => {
            const rawId = m.pis.replace(/\D/g, ''); // The 12-digit string from file

            // Try Match 1: Distinct PIS
            let empId = pisMap.get(rawId);

            // Try Match 2: CPF (The file might contain CPF left-padded with 0 to fit 12 chars)
            // Example: File "012345678901" -> CPF "12345678901"
            if (!empId) {
                // If standard CPF is 11 chars, and file has 12, strip leading zero
                const possibleCpf = rawId.startsWith('0') ? rawId.substring(1) : rawId;
                empId = cpfMap.get(possibleCpf);
            }

            // Try Match 3: Direct CPF match (if file identifier is exactly 11 chars inside the field somehow)
            if (!empId) {
                empId = cpfMap.get(rawId);
            }

            return {
                fileId: timeFile.id,
                pis: m.pis, // Can be CPF actually, we keep raw
                employeeId: empId || null,
                date: m.date,
                time: m.time,
                nsr: m.nsr,
                originalLine: m.originalLine.substring(0, 50)
            };
        });

        // 6. Batch Insert
        // Prisma createMany is efficient
        await prisma.timeRecord.createMany({
            data: recordsData
        });

        await prisma.timeClockFile.update({
            where: { id: timeFile.id },
            data: { status: 'DONE' }
        });

        revalidatePath('/dashboard/time-tracking');
        return { success: true, count: recordsData.length };

    } catch (error: any) {
        console.error('Error uploading AFD:', error);
        return { success: false, error: `Erro ao processar arquivo: ${error.message}` };
    }
}

export async function getTimeFiles() {
    try {
        const files = await prisma.timeClockFile.findMany({
            orderBy: { uploadDate: 'desc' },
            take: 10
        });
        return { success: true, data: files };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
