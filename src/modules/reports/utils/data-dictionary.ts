export interface DataField {
    id: string;
    label: string;
    category: 'PERSONAL' | 'CONTRACT' | 'FINANCIAL' | 'LEAVE' | 'LOCATION';
    path: string; // Prisma path like 'contract.baseSalary'
    type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
}

export const REPORT_DATA_DICTIONARY: DataField[] = [
    // --- PERSONAL ---
    { id: 'name', label: 'Nome Completo', category: 'PERSONAL', path: 'name', type: 'string' },
    { id: 'cpf', label: 'CPF', category: 'PERSONAL', path: 'cpf', type: 'string' },
    { id: 'rg', label: 'RG', category: 'PERSONAL', path: 'rg', type: 'string' },
    { id: 'email', label: 'E-mail', category: 'PERSONAL', path: 'email', type: 'string' },
    { id: 'phone', label: 'Telefone', category: 'PERSONAL', path: 'phone', type: 'string' },
    { id: 'pis', label: 'PIS', category: 'PERSONAL', path: 'pis', type: 'string' },
    { id: 'ctps', label: 'CTPS', category: 'PERSONAL', path: 'ctps', type: 'string' },
    { id: 'maritalStatus', label: 'Estado Civil', category: 'PERSONAL', path: 'maritalStatus', type: 'string' },
    { id: 'status', label: 'Status Registro', category: 'PERSONAL', path: 'status', type: 'string' },
    { id: 'hireDate', label: 'Data Registro', category: 'PERSONAL', path: 'hireDate', type: 'date' },

    // --- CONTRACT ---
    { id: 'jobRole', label: 'Cargo', category: 'CONTRACT', path: 'contract.jobRole.name', type: 'string' },
    { id: 'sector', label: 'Setor', category: 'CONTRACT', path: 'contract.sectorDef.name', type: 'string' },
    { id: 'contractType', label: 'Tipo Contrato', category: 'CONTRACT', path: 'contract.contractType', type: 'string' },
    { id: 'admissionDate', label: 'Data de Admissão', category: 'CONTRACT', path: 'contract.admissionDate', type: 'date' },

    // --- LOCATION ---
    { id: 'store', label: 'Unidade/Loja', category: 'LOCATION', path: 'contract.store.name', type: 'string' },
    { id: 'company', label: 'Empresa (Razão Social)', category: 'LOCATION', path: 'contract.company.name', type: 'string' },

    // --- FINANCIAL ---
    { id: 'salary', label: 'Salário Base', category: 'FINANCIAL', path: 'contract.baseSalary', type: 'currency' },
    { id: 'insalubrity', label: 'Insalubridade (%)', category: 'FINANCIAL', path: 'contract.insalubrityLevel', type: 'number' },
    { id: 'hasTransportVoucher', label: 'Vale Transporte', category: 'FINANCIAL', path: 'contract.hasTransportVoucher', type: 'boolean' },
    { id: 'mealVoucher', label: 'Vale Refeição', category: 'FINANCIAL', path: 'contract.mealVoucherValue', type: 'currency' },

    // --- LEAVE / HEALTH ---
    { id: 'medicalLeavesCount', label: 'Qtd. de Atestados', category: 'LEAVE', path: '_count.medicalLeaves', type: 'number' },

    // --- COMPLIANCE ---
    { id: 'complianceScore', label: 'Status Conformidade (%)', category: 'LEAVE', path: 'complianceScore', type: 'number' },

    // --- COST PROVISIONS ---
    { id: 'cost_inss', label: 'INSS Patronal', category: 'FINANCIAL', path: 'cost_inss', type: 'currency' },
    { id: 'cost_rat', label: 'RAT', category: 'FINANCIAL', path: 'cost_rat', type: 'currency' },
    { id: 'cost_fgts', label: 'FGTS Mensal', category: 'FINANCIAL', path: 'cost_fgts', type: 'currency' },
    { id: 'cost_fgts_penalty', label: 'Multa FGTS Rescisório', category: 'FINANCIAL', path: 'cost_fgts_penalty', type: 'currency' },
    { id: 'cost_13th', label: 'Provisão 13º', category: 'FINANCIAL', path: 'cost_13th', type: 'currency' },
    { id: 'cost_vacation', label: 'Provisão Férias + 1/3', category: 'FINANCIAL', path: 'cost_vacation', type: 'currency' },
    { id: 'cost_operational', label: 'Custos Adicionais (Contab/EPI/ASO)', category: 'FINANCIAL', path: 'cost_operational', type: 'currency' },
    { id: 'cost_total', label: 'Custo Total Estimado', category: 'FINANCIAL', path: 'cost_total', type: 'currency' },
];
