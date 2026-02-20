import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./client";

export async function uploadFile(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

// Helper to sanitize name for filesystem/url
const sanitizeName = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '_')     // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_');           // Remove multi underscores
};

export async function uploadEmployeeDocument(
    file: File,
    employeeId: string,
    employeeName: string,
    category: string
): Promise<{ fileName: string, fileUrl: string, type: string, uploadedAt: string }> {
    const sanitizedCategory = category.toLowerCase().replace(/\s+/g, '_');
    const namePart = sanitizeName(employeeName);

    // Folder structure: employees/{id}_{name}/documents/{category}/{filename}
    const path = `employees/${employeeId}_${namePart}/documents/${sanitizedCategory}/${file.name}`;
    const url = await uploadFile(file, path);

    return {
        fileName: file.name,
        fileUrl: url,
        type: category,
        uploadedAt: new Date().toISOString()
    };
}

export async function uploadEmployeePhoto(file: File, employeeId: string, employeeName: string): Promise<string> {
    const namePart = sanitizeName(employeeName);
    // Fixed path for profile photo to ensure substitution instead of duplication
    const path = `employees/${employeeId}_${namePart}/photo/profile.jpg`;
    return uploadFile(file, path);
}

export async function uploadCandidateResume(file: File, candidateName: string): Promise<string> {
    const namePart = sanitizeName(candidateName);
    const timestamp = Date.now();
    // Folder structure: candidates/{name}_{timestamp}/resume.pdf
    const path = `candidates/${namePart}_${timestamp}/${file.name}`;
    return uploadFile(file, path);
}
