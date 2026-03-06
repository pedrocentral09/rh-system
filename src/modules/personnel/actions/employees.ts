'use server';

import { revalidatePath } from 'next/cache';
import { EmployeeService } from '../services/employee.service';
import { getCurrentUser } from '@/modules/core/actions/auth';

export async function createEmployee(formData: FormData) {
    const user = await getCurrentUser();
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.create(rawData, user?.id);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}

export async function updateEmployee(id: string, formData: FormData) {
    const user = await getCurrentUser();
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.update(id, rawData, user?.id);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) {
        console.log('Skipping revalidatePath: No Next.js context');
    }
    return result;
}

export async function terminateEmployee(id: string, date: Date, reason: string, reasonId?: string) {
    const user = await getCurrentUser();
    const result = await EmployeeService.terminate(id, date, reason, reasonId, user?.id);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) {
        console.log('Skipping revalidatePath: No Next.js context');
    }
    return result;
}

export async function rehireEmployee(id: string, formData: FormData) {
    const user = await getCurrentUser();
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.rehire(id, rawData, user?.id);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) {
        console.log('Skipping revalidatePath: No Next.js context');
    }
    return result;
}

export async function getEmployees(filters?: { status?: string }) {
    return await EmployeeService.getAll(filters);
}

export async function getEmployee(id: string) {
    return await EmployeeService.getById(id);
}

export async function bulkImportEmployees(employeesList: any[]) {
    const result = await EmployeeService.bulkImport(employeesList);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) { }
    return result;
}

export async function initiateSelfOnboarding(cpf: string) {
    const user = await getCurrentUser();
    const result = await EmployeeService.initiateSelfOnboarding(cpf, user?.id);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}

export async function submitSelfOnboarding(id: string, data: any) {
    const result = await EmployeeService.submitSelfOnboarding(id, data);
    // Note: No revalidatePath here as it's a public route common to employees
    return result;
}

export async function approveSelfOnboarding(id: string) {
    const user = await getCurrentUser();
    const result = await EmployeeService.approveSelfOnboarding(id, user?.id);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}

export async function deleteEmployee(id: string) {
    const user = await getCurrentUser();
    const result = await EmployeeService.delete(id, user?.id);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}

export async function resetOnboarding(id: string) {
    const user = await getCurrentUser();
    const result = await EmployeeService.resetOnboarding(id, user?.id);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}
