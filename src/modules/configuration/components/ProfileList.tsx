'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getRoles, deleteRole } from '@/modules/core/actions/roles';
import { RoleModal } from './RoleModal';
import { toast } from 'sonner';

export function ProfileList() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);

    const loadRoles = async () => {
        setLoading(true);
        const result = await getRoles();
        if (result.success) {
            setRoles(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Deseja excluir o perfil "${name}"?`)) return;
        const res = await deleteRole(id);
        if (res.success) {
            toast.success('Perfil excluído com sucesso.');
            loadRoles();
        } else {
            toast.error(res.error || 'Erro ao excluir perfil.');
        }
    }

    if (loading) return <div className="p-4 bg-slate-50 rounded h-24 animate-pulse"></div>;

    return (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Perfis de Acesso</CardTitle>
                    <CardDescription>Defina grupos de permissões para os usuários.</CardDescription>
                </div>
                <Button
                    onClick={() => {
                        setSelectedRole(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-brand-blue hover:bg-blue-800 text-white font-bold"
                >
                    + Novo Perfil
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-100/80 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Nome do Perfil</th>
                            <th className="px-6 py-3">Usuários</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{role.name}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-200/50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold border border-slate-300 dark:border-slate-600">
                                        {role._count?.users || 0} usuários
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {role.isSystem ? (
                                        <span className="text-amber-600 text-xs font-bold border border-amber-200 px-2 py-0.5 rounded bg-amber-50">SISTEMA</span>
                                    ) : (
                                        <span className="text-slate-500 text-xs">Personalizado</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-indigo-600 hover:text-indigo-800"
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    {!role.isSystem && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(role.id, role.name)}
                                        >
                                            Excluir
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {roles.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-slate-400">Nenhum perfil encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={selectedRole}
                onSuccess={loadRoles}
            />
        </Card>
    );
}
