'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const COMPANY_PROFILE_KEY = 'COMPANY_PROFILE';
const SYSTEM_PARAMETERS_KEY = 'SYSTEM_PARAMETERS';

export type CompanyProfile = {
    companyName: string; // Razão Social
    tradingName?: string; // Nome Fantasia
    cnpj: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    email: string;
    phone: string;
    responsible?: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    logoUrl?: string; // Future implementation
    closingDay: number;
}

export type SystemParameters = {
    rates: {
        inssPatronal: number;
        rat: number;
        fgts: number;
        fgtsPenalty: number;
        noticePeriod: number;
    };
    costs: {
        accountingPerHead: number;
        medicalExamsMonthly: number;
        trainingMonthly: number;
        uniformsEPIMonthly: number;
    };
}

const DEFAULT_PARAMETERS: SystemParameters = {
    rates: {
        inssPatronal: 20.0,
        rat: 2.0,
        fgts: 8.0,
        fgtsPenalty: 40.0,
        noticePeriod: 1.0,
    },
    costs: {
        accountingPerHead: 120.0,
        medicalExamsMonthly: 15.0,
        trainingMonthly: 20.0,
        uniformsEPIMonthly: 45.0,
    }
};

export async function getCompanyProfile() {
    try {
        const setting = await prisma.companySettings.findUnique({
            where: { key: COMPANY_PROFILE_KEY }
        });

        if (!setting) return { success: true, data: null };

        const data = JSON.parse(setting.value) as CompanyProfile;
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching company profile:", error);
        return { success: false, error: "Failed to fetch company profile" };
    }
}

export async function updateCompanyProfile(data: CompanyProfile) {
    try {
        await prisma.companySettings.upsert({
            where: { key: COMPANY_PROFILE_KEY },
            update: { value: JSON.stringify(data) },
            create: {
                key: COMPANY_PROFILE_KEY,
                value: JSON.stringify(data)
            }
        });

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error("Error updating company profile:", error);
        return { success: false, error: "Failed to update company profile" };
    }
}

export async function getSystemParameters() {
    try {
        const setting = await prisma.companySettings.findUnique({
            where: { key: SYSTEM_PARAMETERS_KEY }
        });

        if (!setting) return { success: true, data: DEFAULT_PARAMETERS };

        const data = JSON.parse(setting.value) as SystemParameters;
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching system parameters:", error);
        return { success: false, error: "Failed to fetch parameters" };
    }
}

export async function updateSystemParameters(data: SystemParameters) {
    try {
        await prisma.companySettings.upsert({
            where: { key: SYSTEM_PARAMETERS_KEY },
            update: { value: JSON.stringify(data) },
            create: {
                key: SYSTEM_PARAMETERS_KEY,
                value: JSON.stringify(data)
            }
        });

        revalidatePath('/dashboard/configuration');
        revalidatePath('/dashboard/personnel');
        return { success: true };
    } catch (error) {
        console.error("Error updating system parameters:", error);
        return { success: false, error: "Failed to update parameters" };
    }
}
