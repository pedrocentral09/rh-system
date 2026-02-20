import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import { AuditService } from '../../core/services/audit.service';
import { parseCurrency, parseDate } from '@/shared/utils/parsing-utils';
import { adminAuth } from '@/lib/firebase/admin';
import { sendMail } from '@/lib/mail';

export class EmployeeService extends BaseService {

    static async getAll(filters?: { status?: string }): Promise<ServiceResult<any[]>> {
        try {
            const whereClause: any = {};
            if (filters?.status) {
                whereClause.status = filters.status;
            }

            const employees = await prisma.employee.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    cpf: true,
                    status: true,
                    jobTitle: true,
                    jobRoleId: true,
                    jobRole: { select: { name: true } },
                    department: true,
                    hireDate: true,
                    photoUrl: true,
                    contract: {
                        select: {
                            company: { select: { name: true } },
                            store: { select: { name: true } },
                            sector: true,
                            sectorId: true,
                            sectorDef: { select: { name: true } },
                            baseSalary: true,
                            admissionDate: true
                        }
                    }
                }
            });

            const serialized = JSON.parse(JSON.stringify(employees));
            return this.success(serialized);
        } catch (error: any) {
            console.error('EmployeeService.getAll error:', error);
            return this.error(error, `Falha ao buscar lista de colaboradores: ${error.message || 'Erro desconhecido'}`);
        }
    }

    static async getById(id: string): Promise<ServiceResult<any>> {
        try {
            const employee = await prisma.employee.findUnique({
                where: { id },
                include: {
                    address: true,
                    bankData: true,
                    jobRole: true,
                    contract: {
                        include: {
                            company: true,
                            store: true,
                            sectorDef: true,
                            terminationReasonDef: true
                        }
                    },
                    healthData: true,
                    legalGuardian: true,
                    documents: true
                },
            });

            if (!employee) return this.error(null, 'Colaborador não encontrado');

            const serialized = JSON.parse(JSON.stringify(employee));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Erro ao buscar detalhes do colaborador');
        }
    }

    static async create(rawData: any): Promise<ServiceResult<any>> {
        try {
            // Basic Employee Data
            const data: any = {
                name: rawData.name,
                email: rawData.email,
                cpf: rawData.cpf,
                rg: rawData.rg,
                dateOfBirth: parseDate(rawData.dateOfBirth),
                gender: rawData.gender || '',
                maritalStatus: rawData.maritalStatus || '',
                status: 'ACTIVE',
            };

            // Optional Top-level fields
            if (rawData.jobTitle) data.jobTitle = rawData.jobTitle;
            if (rawData.jobRoleId) data.jobRoleId = rawData.jobRoleId;
            if (rawData.department) data.department = rawData.department;
            if (rawData.hireDate) data.hireDate = parseDate(rawData.hireDate);
            if (rawData.photoUrl) data.photoUrl = rawData.photoUrl;
            if (rawData.phone) data.phone = rawData.phone;
            if (rawData.landline) data.landline = rawData.landline;
            if (rawData.emergencyContactName) data.emergencyContactName = rawData.emergencyContactName;
            if (rawData.emergencyContactPhone) data.emergencyContactPhone = rawData.emergencyContactPhone;
            if (rawData.emergencyContactRelationship) data.emergencyContactRelationship = rawData.emergencyContactRelationship;
            if (rawData.pis) data.pis = rawData.pis;
            if (rawData.ctps) data.ctps = rawData.ctps;
            if (rawData.voterTitle) data.voterTitle = rawData.voterTitle;

            // Relations - Only create if relevant data is present
            if (rawData.street || rawData.zipCode) {
                data.address = {
                    create: {
                        street: rawData.street || '',
                        number: rawData.number || '',
                        neighborhood: rawData.neighborhood || '',
                        city: rawData.city || '',
                        state: rawData.state || '',
                        zipCode: rawData.zipCode || ''
                    }
                };
            }

            if (rawData.companyId || rawData.baseSalary) {
                data.contract = {
                    create: {
                        companyId: rawData.companyId,
                        storeId: rawData.storeId,
                        jobRoleId: rawData.jobRoleId || undefined,
                        sectorId: rawData.sectorId || undefined,
                        sector: rawData.sector || rawData.department || '',
                        baseSalary: parseCurrency(rawData.baseSalary) || 0,
                        contractType: rawData.contractType || 'CLT',
                        workShiftId: rawData.workShiftId || undefined,
                        admissionDate: parseDate(rawData.hireDate) || new Date(),
                        hasTransportVoucher: rawData.hasTransportVoucher === 'on' || rawData.hasTransportVoucher === 'true' || rawData.hasTransportVoucher === true,
                        transportVoucherValue: parseCurrency(rawData.transportVoucherValue),
                        mealVoucherValue: parseCurrency(rawData.mealVoucherValue),
                        foodVoucherValue: parseCurrency(rawData.foodVoucherValue),
                        hasFamilySalary: rawData.hasFamilySalary === 'on' || rawData.hasFamilySalary === 'true' || rawData.hasFamilySalary === true,
                        familySalaryDependents: rawData.familySalaryDependents ? parseInt(rawData.familySalaryDependents) : 0,
                        hasInsalubrity: rawData.hasInsalubrity === 'on' || rawData.hasInsalubrity === 'true' || rawData.hasInsalubrity === true,
                        hasDangerousness: rawData.hasDangerousness === 'on' || rawData.hasDangerousness === 'true' || rawData.hasDangerousness === true,
                        hasTrustPosition: rawData.hasTrustPosition === 'on' || rawData.hasTrustPosition === 'true' || rawData.hasTrustPosition === true,
                        hasCashHandling: rawData.hasCashHandling === 'on' || rawData.hasCashHandling === 'true' || rawData.hasCashHandling === true,
                    }
                };
            }

            const employee = await prisma.employee.create({
                data,
                include: { address: true, contract: true }
            });

            // Audit Log
            await AuditService.log({
                action: 'CREATE',
                module: 'PERSONNEL',
                resource: 'Employee',
                resourceId: employee.id,
                newData: employee
            });

            const serialized = JSON.parse(JSON.stringify(employee));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Erro ao criar registro do colaborador');
        }
    }

    static async update(id: string, rawData: any): Promise<ServiceResult<any>> {
        try {
            // Fetch old data for audit
            const oldEmployee = await prisma.employee.findUnique({
                where: { id },
                include: { address: true, contract: true, bankData: true, healthData: true, legalGuardian: true }
            });

            const data: any = {};

            // Map Root Fields
            if (rawData.name !== undefined) data.name = rawData.name;
            if (rawData.email !== undefined) data.email = rawData.email?.trim() || null;
            if (rawData.cpf !== undefined) data.cpf = rawData.cpf;
            if (rawData.rg !== undefined) data.rg = rawData.rg;
            if (rawData.dateOfBirth !== undefined) data.dateOfBirth = new Date(rawData.dateOfBirth);
            if (rawData.gender !== undefined) data.gender = rawData.gender;
            if (rawData.maritalStatus !== undefined) data.maritalStatus = rawData.maritalStatus;
            if (rawData.photoUrl !== undefined) data.photoUrl = rawData.photoUrl;
            if (rawData.photo !== undefined) data.photoUrl = rawData.photo; // Alias

            // Check for Access Creation
            if (rawData.accessEmail && rawData.accessPassword) {
                // This will be handled after the employee is updated to ensure we have an ID
                // or we can prepare the user creation data here if it's a new employee.
                // For now, let's keep it in the update/create flow.
            }

            if (rawData.jobTitle !== undefined) data.jobTitle = rawData.jobTitle;
            if (rawData.jobRoleId !== undefined) data.jobRoleId = rawData.jobRoleId;
            if (rawData.department !== undefined) data.department = rawData.department;
            if (rawData.hireDate !== undefined) data.hireDate = parseDate(rawData.hireDate);
            if (rawData.landline !== undefined) data.landline = rawData.landline;
            if (rawData.phone !== undefined) data.phone = rawData.phone;
            if (rawData.emergencyContactName !== undefined) data.emergencyContactName = rawData.emergencyContactName;
            if (rawData.emergencyContactPhone !== undefined) data.emergencyContactPhone = rawData.emergencyContactPhone;
            if (rawData.emergencyContactRelationship !== undefined) data.emergencyContactRelationship = rawData.emergencyContactRelationship;
            if (rawData.pis !== undefined) data.pis = rawData.pis;
            if (rawData.ctps !== undefined) data.ctps = rawData.ctps;
            if (rawData.voterTitle !== undefined) data.voterTitle = rawData.voterTitle;

            // Handle Address
            if (rawData.street || rawData.zipCode || rawData.city) {
                data.address = {
                    upsert: {
                        create: {
                            street: rawData.street || '',
                            number: rawData.number || '',
                            neighborhood: rawData.neighborhood || '',
                            city: rawData.city || '',
                            state: rawData.state || '',
                            zipCode: rawData.zipCode || ''
                        },
                        update: {
                            street: rawData.street,
                            number: rawData.number,
                            neighborhood: rawData.neighborhood,
                            city: rawData.city,
                            state: rawData.state,
                            zipCode: rawData.zipCode,
                            complement: rawData.complement
                        }
                    }
                };
            }

            // Handle Contract
            if (
                rawData.companyId || rawData.storeId || rawData.jobRoleId || rawData.sectorId ||
                rawData.baseSalary || rawData.hireDate || rawData.workShiftId ||
                rawData.hasTransportVoucher !== undefined || rawData.mealVoucherValue !== undefined || rawData.foodVoucherValue !== undefined ||
                rawData.hasFamilySalary !== undefined || rawData.hasInsalubrity !== undefined ||
                rawData.hasDangerousness !== undefined || rawData.hasTrustPosition !== undefined ||
                rawData.hasCashHandling !== undefined || rawData.monthlyBonus !== undefined
            ) {
                const contractData: any = {};
                if (rawData.companyId) contractData.companyId = rawData.companyId;
                if (rawData.storeId) contractData.storeId = rawData.storeId;
                if (rawData.jobRoleId) contractData.jobRoleId = rawData.jobRoleId;
                if (rawData.sectorId) contractData.sectorId = rawData.sectorId;
                if (rawData.sector) contractData.sector = rawData.sector;
                if (rawData.baseSalary) contractData.baseSalary = parseCurrency(rawData.baseSalary);
                if (rawData.contractType) contractData.contractType = rawData.contractType;

                // Shift Relation
                if (rawData.workShiftId) contractData.workShiftId = rawData.workShiftId;

                if (rawData.admissionDate) contractData.admissionDate = parseDate(rawData.admissionDate);
                else if (rawData.hireDate) contractData.admissionDate = parseDate(rawData.hireDate);

                if (rawData.isExperienceContract !== undefined) {
                    contractData.isExperienceContract = rawData.isExperienceContract === 'on' || rawData.isExperienceContract === 'true' || rawData.isExperienceContract === true;
                }
                if (rawData.experienceDays) contractData.experienceDays = parseInt(rawData.experienceDays);

                if (rawData.isExperienceExtended !== undefined) {
                    contractData.isExperienceExtended = rawData.isExperienceExtended === 'on' || rawData.isExperienceExtended === 'true' || rawData.isExperienceExtended === true;
                }
                if (rawData.experienceExtensionDays) contractData.experienceExtensionDays = parseInt(rawData.experienceExtensionDays);

                // Benefits
                if (rawData.hasTransportVoucher !== undefined) {
                    contractData.hasTransportVoucher = rawData.hasTransportVoucher === 'on' || rawData.hasTransportVoucher === 'true' || rawData.hasTransportVoucher === true;
                }
                if (rawData.transportVoucherValue) contractData.transportVoucherValue = parseCurrency(rawData.transportVoucherValue);
                if (rawData.mealVoucherValue) contractData.mealVoucherValue = parseCurrency(rawData.mealVoucherValue);
                if (rawData.foodVoucherValue) contractData.foodVoucherValue = parseCurrency(rawData.foodVoucherValue);

                if (rawData.hasFamilySalary !== undefined) {
                    contractData.hasFamilySalary = rawData.hasFamilySalary === 'on' || rawData.hasFamilySalary === 'true' || rawData.hasFamilySalary === true;
                }
                if (rawData.familySalaryDependents) contractData.familySalaryDependents = parseInt(rawData.familySalaryDependents);

                // Adicionais
                if (rawData.hasInsalubrity !== undefined) {
                    contractData.hasInsalubrity = rawData.hasInsalubrity === 'on' || rawData.hasInsalubrity === 'true' || rawData.hasInsalubrity === true;
                }
                if (rawData.insalubrityLevel) contractData.insalubrityLevel = parseInt(rawData.insalubrityLevel);
                if (rawData.insalubrityBase) contractData.insalubrityBase = parseCurrency(rawData.insalubrityBase);

                if (rawData.hasDangerousness !== undefined) {
                    contractData.hasDangerousness = rawData.hasDangerousness === 'on' || rawData.hasDangerousness === 'true' || rawData.hasDangerousness === true;
                }
                if (rawData.dangerousnessBase) contractData.dangerousnessBase = parseCurrency(rawData.dangerousnessBase);

                if (rawData.hasTrustPosition !== undefined) {
                    contractData.hasTrustPosition = rawData.hasTrustPosition === 'on' || rawData.hasTrustPosition === 'true' || rawData.hasTrustPosition === true;
                }
                if (rawData.trustPositionBase) contractData.trustPositionBase = parseCurrency(rawData.trustPositionBase);

                if (rawData.hasCashHandling !== undefined) {
                    contractData.hasCashHandling = rawData.hasCashHandling === 'on' || rawData.hasCashHandling === 'true' || rawData.hasCashHandling === true;
                }
                if (rawData.cashHandlingBase) contractData.cashHandlingBase = parseCurrency(rawData.cashHandlingBase);

                if (rawData.monthlyBonus) contractData.monthlyBonus = parseCurrency(rawData.monthlyBonus);
                if (rawData.otherBenefits) contractData.otherBenefits = rawData.otherBenefits;

                data.contract = {
                    upsert: {
                        create: {
                            ...contractData,
                            sector: contractData.sector || rawData.department || 'Geral',
                            baseSalary: contractData.baseSalary || 0,
                            contractType: contractData.contractType || 'CLT',
                            admissionDate: contractData.admissionDate || new Date()
                        },
                        update: contractData
                    }
                };
            }

            // Handle BankData
            if (rawData.bankName || rawData.accountNumber) {
                data.bankData = {
                    upsert: {
                        create: {
                            bankName: rawData.bankName || '',
                            agency: rawData.agency || '',
                            accountNumber: rawData.accountNumber || '',
                            accountType: rawData.accountType || 'Corrente',
                            pixKey: rawData.pixKey
                        },
                        update: {
                            bankName: rawData.bankName,
                            agency: rawData.agency,
                            accountNumber: rawData.accountNumber,
                            accountType: rawData.accountType,
                            pixKey: rawData.pixKey
                        }
                    }
                };
            }

            // Handle HealthData
            if (rawData.lastAsoDate || rawData.asoType) {
                data.healthData = {
                    upsert: {
                        create: {
                            asoType: rawData.asoType || 'Admissional',
                            lastAsoDate: parseDate(rawData.lastAsoDate) || new Date(),
                            periodicity: parseInt(rawData.asoPeriodicity || '12'),
                            observations: rawData.asoObservations
                        },
                        update: {
                            asoType: rawData.asoType,
                            lastAsoDate: rawData.lastAsoDate ? parseDate(rawData.lastAsoDate) : undefined,
                            periodicity: rawData.asoPeriodicity ? parseInt(rawData.asoPeriodicity) : undefined,
                            observations: rawData.asoObservations
                        }
                    }
                };
            }

            // Handle LegalGuardian
            if (rawData.guardianName || rawData.guardianCpf) {
                data.legalGuardian = {
                    upsert: {
                        create: {
                            name: rawData.guardianName || '',
                            cpf: rawData.guardianCpf || '',
                            rg: rawData.guardianRg || '',
                            phone: rawData.guardianPhone || '',
                            relationship: rawData.guardianRelationship || ''
                        },
                        update: {
                            name: rawData.guardianName,
                            cpf: rawData.guardianCpf,
                            rg: rawData.guardianRg,
                            phone: rawData.guardianPhone,
                            relationship: rawData.guardianRelationship
                        }
                    }
                };
            }

            // Handle Documents
            if (rawData.documents) {
                try {
                    const docs = typeof rawData.documents === 'string' ? JSON.parse(rawData.documents) : rawData.documents;
                    if (Array.isArray(docs)) {
                        // Delete existing to replace (fully sync)
                        await prisma.document.deleteMany({ where: { employeeId: id } });

                        // Use a separate createMany or similar if nested create is problematic with deleteMany in same update?
                        // Prisma allows nested create, but deleteMany must be done before.
                        // Since we are in an update, we can't deleteMany inside the 'data' object.
                        // We already did deleteMany above.
                        data.documents = {
                            create: docs.map((d: any) => ({
                                type: d.type || 'Geral',
                                fileName: d.fileName || 'document.pdf',
                                fileUrl: d.fileUrl || '',
                                uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date()
                            }))
                        };
                    }
                } catch (e) {
                    console.error("Error parsing documents JSON:", e);
                }
            }

            const employee = await prisma.employee.update({
                where: { id },
                data,
                include: { address: true, contract: true, bankData: true, healthData: true, legalGuardian: true, user: true }
            });

            // ... (Handle Access/User Creation logic)
            if (rawData.accessEmail && rawData.accessPassword) {
                try {
                    console.log('EmployeeService.update - Attempting to upsert user for email:', rawData.accessEmail);
                    await this.upsertEmployeeUser(employee.id, {
                        email: rawData.accessEmail,
                        password: rawData.accessPassword,
                        role: rawData.accessRole || 'EMPLOYEE'
                    });
                } catch (userErr) {
                    console.error("Failed to create/link user:", userErr);
                }
            }

            // Audit Log
            await AuditService.log({
                action: 'UPDATE',
                module: 'PERSONNEL',
                resource: 'Employee',
                resourceId: employee.id,
                oldData: oldEmployee,
                newData: employee
            });

            const serialized = JSON.parse(JSON.stringify(employee));
            return this.success(serialized);
        } catch (error: any) {
            console.error('EmployeeService.update - COMPLETE ERROR OBJECT:', error);
            if (error.code === 'P2002') {
                console.error('Unique constraint failed on fields:', error.meta?.target);
            }
            return this.error(error, 'Erro ao atualizar registro do colaborador');
        }
    }

    static async terminate(id: string, date: Date, reason: string, reasonId?: string): Promise<ServiceResult<void>> {
        try {
            await prisma.$transaction([
                prisma.employee.update({
                    where: { id },
                    data: {
                        status: 'TERMINATED',
                        contract: {
                            update: {
                                terminationDate: date,
                                terminationReason: reason,
                                terminationReasonId: reasonId || undefined
                            }
                        }
                    }
                }),
                prisma.transferHistory.create({
                    data: {
                        employeeId: id,
                        date,
                        previousStore: 'ATIVO',
                        newStore: 'DESLIGADO',
                        reason,
                        notes: 'Desligamento registrado via Service Layer.'
                    }
                })
            ]);

            // Audit Log
            await AuditService.log({
                action: 'TERMINATE',
                module: 'PERSONNEL',
                resource: 'Employee',
                resourceId: id,
                newData: { status: 'TERMINATED', terminationDate: date, reason }
            });

            return this.success(undefined);
        } catch (error) {
            return this.error(error, 'Erro ao processar desligamento do colaborador');
        }
    }

    static async rehire(id: string, rawData: any): Promise<ServiceResult<any>> {
        try {
            const employee = await prisma.employee.findUnique({
                where: { id },
                include: { contract: { include: { store: true } } }
            });

            if (!employee || !employee.contract) return this.error(null, "Colaborador ou Contrato não encontrado");

            const oldContract = employee.contract;

            await prisma.$transaction([
                prisma.employmentHistory.create({
                    data: {
                        employeeId: id,
                        role: employee.jobTitle || 'N/A',
                        department: employee.department || 'N/A',
                        store: oldContract.store?.name || 'N/A',
                        admissionDate: oldContract.admissionDate,
                        terminationDate: oldContract.terminationDate || new Date(),
                        reason: oldContract.terminationReason || "Desligamento anterior",
                        details: JSON.stringify(oldContract)
                    }
                }),
                prisma.employee.update({
                    where: { id },
                    data: {
                        status: 'ACTIVE',
                        jobTitle: rawData.jobTitle,
                        department: rawData.department,
                        hireDate: parseDate(rawData.admissionDate) || new Date(),
                        contract: {
                            update: {
                                companyId: rawData.companyId,
                                sector: rawData.department,
                                baseSalary: parseCurrency(rawData.baseSalary) || 0,
                                contractType: rawData.contractType,
                                workShift: rawData.workShift,
                                admissionDate: parseDate(rawData.admissionDate) || new Date(),
                                terminationDate: null,
                                hasFamilySalary: false,
                                hasInsalubrity: false,
                                hasDangerousness: false,
                                hasTrustPosition: false,
                                hasCashHandling: false
                            }
                        }
                    }
                })
            ]);

            const serialized = JSON.parse(JSON.stringify(employee));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Erro ao recontratar colaborador');
        }
    }

    private static async upsertEmployeeUser(employeeId: string, userData: any) {
        try {
            console.log(`[ACCESS] Processing user for ${employeeId} with email ${userData.email}`);

            let firebaseUid: string;

            try {
                // 1. Check if user already exists in Firebase
                const userRecord = await adminAuth.getUserByEmail(userData.email);
                firebaseUid = userRecord.uid;
                console.log(`[ACCESS] User found in Firebase: ${firebaseUid}`);

                // Optionally update password if provided
                if (userData.password) {
                    await adminAuth.updateUser(firebaseUid, {
                        password: userData.password
                    });
                }
            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    // 2. Create new user in Firebase Auth
                    const newUser = await adminAuth.createUser({
                        email: userData.email,
                        password: userData.password,
                        displayName: userData.name || userData.email.split('@')[0],
                    });
                    firebaseUid = newUser.uid;
                    console.log(`[ACCESS] New Firebase user created: ${firebaseUid}`);
                } else {
                    throw error;
                }
            }

            // 3. Link/Upsert in Prisma User table
            await prisma.user.upsert({
                where: { email: userData.email },
                create: {
                    email: userData.email,
                    firebaseUid: firebaseUid,
                    role: userData.role,
                    employee: { connect: { id: employeeId } }
                },
                update: {
                    role: userData.role,
                    firebaseUid: firebaseUid, // Ensure UID matches
                    employee: { connect: { id: employeeId } }
                }
            });

            // 4. Send Welcome Email if password was provided (new or updated)
            if (userData.password) {
                const html = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Bem-vindo ao Sistema RH</h1>
                        </div>
                        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
                            <p>Olá,</p>
                            <p>Suas credenciais de acesso ao Portal do Colaborador foram geradas com sucesso.</p>
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; margin: 24px 0;">
                                <p style="margin: 0 0 8px 0;"><strong>E-mail:</strong> ${userData.email}</p>
                                <p style="margin: 0;"><strong>Senha Inicial:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 4px;">${userData.password}</span></p>
                            </div>
                            <p>Recomendamos que você altere sua senha no primeiro acesso para sua segurança.</p>
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="${process.env.NEXTAUTH_URL || 'https://sistema.rh.com.br'}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar o Portal</a>
                            </div>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                            Este é um e-mail automático do Sistema de Gestão de RH. Por favor, não responda.
                        </div>
                    </div>
                `;

                await sendMail({
                    to: userData.email,
                    subject: '🎫 Suas credenciais de acesso - Sistema RH',
                    html
                });
                console.log(`[EMAIL] Welcome email sent to: ${userData.email}`);
            }
        } catch (error) {
            console.error("Critical failure in upsertEmployeeUser:", error);
            throw error; // Re-throw to be handled by the service caller
        }
    }

}
