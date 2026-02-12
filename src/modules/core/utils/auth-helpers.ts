export function checkAdminAccess(user: any): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || (!!user.roleDef && user.roleDef.name.toLowerCase() === 'administrador');
}
