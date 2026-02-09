import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import { AuditService } from '../../core/services/audit.service';

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
                            baseSalary: true
                        }
                    }
                }
            });

            const serialized = JSON.parse(JSON.stringify(employees));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Falha ao buscar lista de colaboradores');
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
                dateOfBirth: rawData.dateOfBirth ? new Date(rawData.dateOfBirth) : null,
                gender: rawData.gender || '',
                maritalStatus: rawData.maritalStatus || '',
                status: 'ACTIVE',
            };

            // Optional Top-level fields
            if (rawData.jobTitle) data.jobTitle = rawData.jobTitle;
            if (rawData.jobRoleId) data.jobRoleId = rawData.jobRoleId;
            if (rawData.department) data.department = rawData.department;
            if (rawData.hireDate) data.hireDate = new Date(rawData.hireDate);
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
                        baseSalary: rawData.baseSalary || 0,
                        contractType: rawData.contractType || 'CLT',
                        workShiftId: rawData.workShiftId || undefined,
                        admissionDate: rawData.hireDate ? new Date(rawData.hireDate) : new Date(),
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
            if (rawData.email !== undefined) data.email = rawData.email;
            if (rawData.cpf !== undefined) data.cpf = rawData.cpf;
            if (rawData.rg !== undefined) data.rg = rawData.rg;
            if (rawData.dateOfBirth !== undefined) data.dateOfBirth = new Date(rawData.dateOfBirth);
            if (rawData.gender !== undefined) data.gender = rawData.gender;
            if (rawData.maritalStatus !== undefined) data.maritalStatus = rawData.maritalStatus;
            if (rawData.jobTitle !== undefined) data.jobTitle = rawData.jobTitle;
            if (rawData.jobRoleId !== undefined) data.jobRoleId = rawData.jobRoleId;
            if (rawData.department !== undefined) data.department = rawData.department;
            if (rawData.hireDate !== undefined) data.hireDate = new Date(rawData.hireDate);
            if (rawData.photoUrl !== undefined) data.photoUrl = rawData.photoUrl;
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
            if (rawData.companyId || rawData.baseSalary || rawData.hireDate || rawData.workShiftId) {
                const contractData: any = {};
                if (rawData.companyId) contractData.companyId = rawData.companyId;
                if (rawData.storeId) contractData.storeId = rawData.storeId;
                if (rawData.jobRoleId) contractData.jobRoleId = rawData.jobRoleId;
                if (rawData.sectorId) contractData.sectorId = rawData.sectorId;
                if (rawData.sector) contractData.sector = rawData.sector;
                if (rawData.baseSalary) contractData.baseSalary = parseFloat(rawData.baseSalary);
                if (rawData.contractType) contractData.contractType = rawData.contractType;

                // Shift Relation
                if (rawData.workShiftId) contractData.workShiftId = rawData.workShiftId;

                if (rawData.admissionDate) contractData.admissionDate = new Date(rawData.admissionDate);
                else if (rawData.hireDate) contractData.admissionDate = new Date(rawData.hireDate);

                if (rawData.isExperienceContract !== undefined) {
                    contractData.isExperienceContract = rawData.isExperienceContract === 'on' || rawData.isExperienceContract === 'true' || rawData.isExperienceContract === true;
                }
                if (rawData.experienceDays) contractData.experienceDays = parseInt(rawData.experienceDays);

                if (rawData.isExperienceExtended !== undefined) {
                    contractData.isExperienceExtended = rawData.isExperienceExtended === 'on' || rawData.isExperienceExtended === 'true' || rawData.isExperienceExtended === true;
                }
                if (rawData.experienceExtensionDays) contractData.experienceExtensionDays = parseInt(rawData.experienceExtensionDays);

                // Benefits
                if (rawData.transportVoucherValue) contractData.transportVoucherValue = parseFloat(rawData.transportVoucherValue);
                if (rawData.mealVoucherValue) contractData.mealVoucherValue = parseFloat(rawData.mealVoucherValue);
                if (rawData.foodVoucherValue) contractData.foodVoucherValue = parseFloat(rawData.foodVoucherValue);

                if (rawData.hasFamilySalary !== undefined) {
                    contractData.hasFamilySalary = rawData.hasFamilySalary === 'on' || rawData.hasFamilySalary === 'true' || rawData.hasFamilySalary === true;
                }
                if (rawData.familySalaryDependents) contractData.familySalaryDependents = parseInt(rawData.familySalaryDependents);

                // Adicionais
                if (rawData.hasInsalubrity !== undefined) {
                    contractData.hasInsalubrity = rawData.hasInsalubrity === 'on' || rawData.hasInsalubrity === 'true' || rawData.hasInsalubrity === true;
                }
                if (rawData.insalubrityLevel) contractData.insalubrityLevel = parseInt(rawData.insalubrityLevel);
                if (rawData.insalubrityBase) contractData.insalubrityBase = parseFloat(rawData.insalubrityBase);

                if (rawData.hasDangerousness !== undefined) {
                    contractData.hasDangerousness = rawData.hasDangerousness === 'on' || rawData.hasDangerousness === 'true' || rawData.hasDangerousness === true;
                }
                if (rawData.dangerousnessBase) contractData.dangerousnessBase = parseFloat(rawData.dangerousnessBase);

                if (rawData.hasTrustPosition !== undefined) {
                    contractData.hasTrustPosition = rawData.hasTrustPosition === 'on' || rawData.hasTrustPosition === 'true' || rawData.hasTrustPosition === true;
                }
                if (rawData.trustPositionBase) contractData.trustPositionBase = parseFloat(rawData.trustPositionBase);

                if (rawData.hasCashHandling !== undefined) {
                    contractData.hasCashHandling = rawData.hasCashHandling === 'on' || rawData.hasCashHandling === 'true' || rawData.hasCashHandling === true;
                }
                if (rawData.cashHandlingBase) contractData.cashHandlingBase = parseFloat(rawData.cashHandlingBase);

                if (rawData.monthlyBonus) contractData.monthlyBonus = parseFloat(rawData.monthlyBonus);
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
                            lastAsoDate: rawData.lastAsoDate ? new Date(rawData.lastAsoDate) : new Date(),
                            periodicity: parseInt(rawData.asoPeriodicity || '12'),
                            observations: rawData.asoObservations
                        },
                        update: {
                            asoType: rawData.asoType,
                            lastAsoDate: rawData.lastAsoDate ? new Date(rawData.lastAsoDate) : undefined,
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

            const employee = await prisma.employee.update({
                where: { id },
                data,
                include: { address: true, contract: true, bankData: true, healthData: true, legalGuardian: true }
            });

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
        } catch (error) {
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
                        hireDate: new Date(rawData.admissionDate),
                        contract: {
                            update: {
                                companyId: rawData.companyId,
                                sector: rawData.department,
                                baseSalary: rawData.baseSalary,
                                contractType: rawData.contractType,
                                workShift: rawData.workShift,
                                admissionDate: new Date(rawData.admissionDate),
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
}
