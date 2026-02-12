export function checkAdminAccess(user: any): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || (!!user.roleDef && user.roleDef.name.toLowerCase() === 'administrador');
}

export function checkHRAccess(user: any): boolean {
    if (!user) return false;
    if (checkAdminAccess(user)) return true;

    // Check for standard HR_MANAGER role
    if (user.role === 'HR_MANAGER') return true;

    // Check for custom permissions or role names that imply HR/Manager access
    if (user.roleDef) {
        const name = user.roleDef.name.toLowerCase();
        return name.includes('gestor') || name.includes('rh') || name.includes('manager') || name.includes('recursos humanos');
    }

    return false;
}
