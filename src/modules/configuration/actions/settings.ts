'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const COMPANY_PROFILE_KEY = 'COMPANY_PROFILE';

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
