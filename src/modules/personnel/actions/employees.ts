'use server';

import { revalidatePath } from 'next/cache';
import { EmployeeService } from '../services/employee.service';

export async function createEmployee(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.create(rawData);
    if (result.success) revalidatePath('/dashboard/personnel');
    return result;
}

export async function updateEmployee(id: string, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.update(id, rawData);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) {
        console.log('Skipping revalidatePath: No Next.js context');
    }
    return result;
}

export async function terminateEmployee(id: string, date: Date, reason: string, reasonId?: string) {
    const result = await EmployeeService.terminate(id, date, reason, reasonId);
    try {
        revalidatePath('/dashboard/personnel');
    } catch (e) {
        console.log('Skipping revalidatePath: No Next.js context');
    }
    return result;
}

export async function rehireEmployee(id: string, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const result = await EmployeeService.rehire(id, rawData);
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
