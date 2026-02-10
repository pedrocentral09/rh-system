'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getUsers, deleteUser } from '@/modules/core/actions/users';
import { UserEditModal } from './UserEditModal';
import { toast } from 'sonner';
import { CreateUserModal } from './CreateUserModal';

export function UserList() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        const result = await getUsers();
        if (result.success) {
            setUsers(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário? Ele perderá o acesso ao sistema imediatamente.')) return;

        const result = await deleteUser(userId);
        if (result.success) {
            toast.success('Usuário removido com sucesso.');
            loadUsers();
        } else {
            toast.error('Erro ao excluir usuário.');
        }
    };

    const getRoleBadge = (user: any) => {
        if (user.role === 'ADMIN') return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">Admin</span>;
        if (user.roleDef) return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{user.roleDef.name}</span>;
        if (user.role === 'HR_MANAGER') return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">Gerente RH</span>;
        return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">Funcionário</span>;
    };

    if (loading) return <div className="p-4 bg-slate-50 rounded animate-pulse h-32"></div>;

    return (
        <>
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm mt-8 bg-white dark:bg-slate-800">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white">Usuários do Sistema</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Gerencie quem tem acesso à plataforma.</CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-blue hover:bg-blue-800 text-white">
                            + Novo Usuário
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                        <thead className="text-[11px] text-slate-700 dark:text-slate-300 uppercase bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Nome / Email</th>
                                <th className="px-6 py-3">Perfil de Acesso</th>
                                <th className="px-6 py-3">Vinculado a</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white leading-tight">{user.name || 'Sem Nome'}</div>
                                        <div className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user)}
                                        {user.storeAccess && user.storeAccess.length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {user.storeAccess.map((sa: any) => (
                                                    <span key={sa.id} className="text-[10px] bg-slate-200/50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-bold uppercase tracking-tight">
                                                        {sa.store.tradingName || sa.store.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {user.employee ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                                    {user.employee.photoUrl ? <img src={user.employee.photoUrl} /> : null}
                                                </div>
                                                <span>{user.employee.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Externo / Sistema</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-indigo-600 hover:bg-indigo-50"
                                            onClick={() => setEditingUser(user)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <UserEditModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onSuccess={() => {
                    setEditingUser(null);
                    loadUsers();
                }}
            />

            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => {
                    loadUsers();
                    // Optional: Show success toast
                }}
            />
        </>
    );
}
