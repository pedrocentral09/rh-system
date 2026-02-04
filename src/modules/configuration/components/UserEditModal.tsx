'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { updateUserRole } from '@/modules/core/actions/users';
import { toast } from 'sonner';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export function UserEditModal({ isOpen, onClose, user, onSuccess }: UserEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(user?.role || 'EMPLOYEE');

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        const result = await updateUserRole(user.id, role);
        setLoading(false);

        if (result.success) {
            toast.success('Permissões atualizadas com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error('Erro ao atualizar permissão.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Permissões: ${user.name || user.email}`} width="sm">
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Nível de Acesso</label>
                    <select
                        className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="EMPLOYEE">Funcionário (Básico)</option>
                        <option value="HR_MANAGER">Gestor de RH (Acesso Total)</option>
                        <option value="ADMIN">Administrador (Sistema)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                        * <b>Administradores</b> podem gerenciar usuários e configurações.
                        <br />
                        * <b>Gestores de RH</b> têm acesso completo a pessoal e ponto.
                    </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
