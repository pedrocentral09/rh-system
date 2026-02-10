'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { createRole, updateRole } from '@/modules/core/actions/roles';
import { toast } from 'sonner';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: any;
    onSuccess: () => void;
}

const MODULES = [
    { id: 'personnel', label: 'Pessoal (Admission, Cadastro)' },
    { id: 'time', label: 'Ponto (Frequência, Escalas)' },
    { id: 'payroll', label: 'Folha (Holerites, Eventos)' },
    { id: 'vacations', label: 'Férias' },
    { id: 'disciplinary', label: 'Disciplinar' },
    { id: 'configuration', label: 'Configurações' },
];

const PERMISSIONS = [
    { id: 'read', label: 'Visualizar' },
    { id: 'write', label: 'Criar/Editar' },
    { id: 'delete', label: 'Excluir' },
];

export function RoleModal({ isOpen, onClose, role, onSuccess }: RoleModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description || '');
            try {
                setPermissions(typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions || {});
            } catch (e) {
                setPermissions({});
            }
        } else {
            setName('');
            setDescription('');
            setPermissions({});
        }
    }, [role, isOpen]);

    const togglePermission = (moduleId: string, permId: string) => {
        setPermissions(prev => {
            const modulePerms = prev[moduleId] || [];
            if (modulePerms.includes(permId)) {
                return { ...prev, [moduleId]: modulePerms.filter(p => p !== permId) };
            } else {
                return { ...prev, [moduleId]: [...modulePerms, permId] };
            }
        });
    };

    const selectAllPermissions = () => {
        const all: Record<string, string[]> = {};
        MODULES.forEach(m => {
            all[m.id] = PERMISSIONS.map(p => p.id);
        });
        setPermissions(all);
    };

    const handleSave = async () => {
        if (!name) {
            toast.error('O nome do perfil é obrigatório.');
            return;
        }

        setLoading(true);
        const data = { name, description, permissions };

        const result = role
            ? await updateRole(role.id, data)
            : await createRole(data);

        setLoading(false);

        if (result.success) {
            toast.success(role ? 'Perfil atualizado!' : 'Perfil criado!');
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Erro ao salvar perfil.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? `Editar Perfil: ${role.name}` : 'Novo Perfil de Acesso'} width="2xl">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Nome do Perfil *</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Gestor de Loja, Analista de RH..."
                            className="py-2.5"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Descrição (Opcional)</label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve resumo das responsabilidades"
                            className="py-2.5"
                        />
                    </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left text-slate-800 dark:text-slate-200">Módulo</th>
                                {PERMISSIONS.map(p => (
                                    <th key={p.id} className="px-4 py-3 text-center text-slate-800 dark:text-slate-200">{p.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {MODULES.map(module => (
                                <tr key={module.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{module.label}</td>
                                    {PERMISSIONS.map(perm => (
                                        <td key={perm.id} className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={(permissions[module.id] || []).includes(perm.id)}
                                                onChange={() => togglePermission(module.id, perm.id)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        size="sm"
                        onClick={selectAllPermissions}
                        className="bg-brand-blue hover:bg-blue-800 text-white text-[11px] font-bold uppercase tracking-tight shadow-sm"
                    >
                        ✨ Selecionar Tudo
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white hover:bg-blue-800">
                            {loading ? 'Salvando...' : 'Salvar Perfil'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
