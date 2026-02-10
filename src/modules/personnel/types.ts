import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    rg: z.string().min(2, "RG é obrigatório"),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Data de nascimento inválida",
    }),
    gender: z.string().optional(), // Now string due to SQLite
    maritalStatus: z.string().optional(),

    // Documents (Common)
    pis: z.string().optional(),
    ctps: z.string().optional(),
    voterTitle: z.string().optional(),

    hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Data de admissão inválida",
    }),

    // Contact
    phone: z.string().optional(),
    landline: z.string().optional(),
    photoUrl: z.string().optional(),

    // Emergency Contact
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),

    // Address
    street: z.string().min(2, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    city: z.string().min(2, "Cidade é obrigatória"),
    state: z.string().length(2, "UF deve ter 2 letras"),
    zipCode: z.string().min(8, "CEP inválido"),
    complement: z.string().optional(),

    // Bank Data
    bankName: z.string().min(2, "Banco é obrigatório"),
    agency: z.string().min(1, "Agência é obrigatória"),
    accountNumber: z.string().min(1, "Conta é obrigatória"),
    accountType: z.string().min(2, "Tipo de conta é obrigatório"),
    pixKey: z.string().optional(),

    // Legal Guardian (Optional - validated manually if needed or via conditional logic)
    guardianName: z.string().optional(),
    guardianCpf: z.string().optional(),
    guardianRg: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianRelationship: z.string().optional(),

    // Health Data (ASO)
    asoType: z.string().optional(),
    lastAsoDate: z.string().optional(),
    asoPeriodicity: z.coerce.number().optional(),
    asoObservations: z.string().optional(),

    // Professional / Contract
    registrationCompany: z.string().min(2, "Empresa de registro é obrigatória"),
    sector: z.string().min(2, "Setor é obrigatório"),
    store: z.string().min(2, "Loja é obrigatória"),
    jobTitle: z.string().min(2, "Cargo é obrigatório"),
    department: z.string().min(2, "Departamento é obrigatório"), // Keeping for legacy/display, or sync with Sector? Let's keep both for now.

    baseSalary: z.coerce.number().min(0, "Salário inválido"),
    contractType: z.string(),
    workShift: z.string(),

    // Experience
    isExperienceContract: z.coerce.boolean().optional(),
    experienceDays: z.coerce.number().optional(),
    isExperienceExtended: z.coerce.boolean().optional(),
    experienceExtensionDays: z.coerce.number().optional(),

    // Benefits Values
    hasTransportVoucher: z.coerce.boolean().optional(),
    transportVoucherValue: z.coerce.number().optional(),
    mealVoucherValue: z.coerce.number().optional(), // VA
    foodVoucherValue: z.coerce.number().optional(), // VR

    hasFamilySalary: z.coerce.boolean().optional(),
    familySalaryDependents: z.coerce.number().optional(),

    // Adicionais Checks & Values
    hasInsalubrity: z.coerce.boolean().optional(),
    insalubrityLevel: z.coerce.number().optional(),
    insalubrityBase: z.coerce.number().optional(),

    hasDangerousness: z.coerce.boolean().optional(),
    dangerousnessBase: z.coerce.number().optional(),

    hasTrustPosition: z.coerce.boolean().optional(),
    trustPositionBase: z.coerce.number().optional(),

    hasCashHandling: z.coerce.boolean().optional(),
    cashHandlingBase: z.coerce.number().optional(),

    monthlyBonus: z.coerce.number().optional(),
    otherBenefits: z.string().optional(),

    // Documents (Files)
    documents: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        type: z.string()
    })).optional(),

    // System Access (Optional fields for logic)
    accessEmail: z.string().email().optional().or(z.literal('')),
    accessPassword: z.string().min(6).optional().or(z.literal('')),
    accessRole: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
