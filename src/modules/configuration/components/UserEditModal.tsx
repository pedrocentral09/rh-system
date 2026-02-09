'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { updateUserRole, updateUserStoreAccess } from '@/modules/core/actions/users';
import { getRoles } from '@/modules/core/actions/roles';
import { getStores } from '@/modules/configuration/actions/stores';
import { useEffect } from 'react';
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
    const [roleId, setRoleId] = useState(user?.roleId || '');
    const [userStores, setUserStores] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const [availableStores, setAvailableStores] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && user) {
            setRole(user.role || 'EMPLOYEE');
            setRoleId(user.roleId || '');
            setUserStores(user.storeAccess?.map((sa: any) => sa.storeId) || []);
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const [rolesRes, storesRes] = await Promise.all([
                    getRoles(),
                    getStores()
                ]);
                if (rolesRes.success) setAvailableRoles(rolesRes.data || []);
                if (storesRes.success) setAvailableStores(storesRes.data || []);
            };
            fetchData();
        }
    }, [isOpen]);

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update Role (Dynamic or Legacy)
            // The 'role' state already holds the correct value to be saved,
            // whether it's a predefined string ('EMPLOYEE', 'ADMIN') or a custom role ID.
            const roleRes = await updateUserRole(user.id, role);

            // 2. Update Store Access
            const storeRes = await updateUserStoreAccess(user.id, userStores);

            if (roleRes.success && storeRes.success) {
                toast.success('Permissões e acesso a lojas atualizados!');
                onSuccess();
                onClose();
            } else {
                toast.error('Erro ao atualizar algumas permissões.');
            }
        } catch (e) {
            toast.error('Ocorreu um erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    const toggleStore = (storeId: string) => {
        setUserStores(prev =>
            prev.includes(storeId)
                ? prev.filter(id => id !== storeId)
                : [...prev, storeId]
        );
    };

    const selectAllStores = () => {
        setUserStores(availableStores.map(s => s.id));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Permissões: ${user.name || user.email}`} width="sm">
            <div className="space-y-6">
                <div>
                    <label className="text-[13px] font-bold text-slate-800 dark:text-slate-200 block mb-2 uppercase tracking-wide">Nível de Acesso / Perfil</label>
                    <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        value={role.length > 20 ? 'CUSTOM' : role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="EMPLOYEE">Funcionário (Básico)</option>
                        <option value="HR_MANAGER">Gestor de RH (Acesso Total)</option>
                        <option value="ADMIN">Administrador (Sistema)</option>
                        <optgroup label="Perfis Personalizados">
                            {availableRoles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </optgroup>
                    </select>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium">
                        * Perfis personalizados oferecem controle granular por módulo.
                    </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[13px] font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wide">Acesso a Lojas</label>
                        <Button
                            type="button"
                            size="sm"
                            onClick={selectAllStores}
                            className="bg-brand-blue hover:bg-blue-800 text-white text-[10px] h-7 px-3 font-bold uppercase"
                        >
                            Selecionar Todas
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                        {availableStores.map(store => (
                            <label key={store.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={userStores.includes(store.id)}
                                    onChange={() => toggleStore(store.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white">{store.tradingName || store.name}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium">
                        * Se vazio, o usuário terá acesso total a todas as lojas.
                    </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white hover:bg-blue-800">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
