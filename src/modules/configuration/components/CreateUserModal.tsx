'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { createSystemUser } from '@/modules/core/actions/admin-users';
import { toast } from 'sonner';

import { getRoles } from '@/modules/core/actions/roles';
import { getStores } from '@/modules/configuration/actions/stores';
import { useEffect } from 'react';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        storeIds: [] as string[]
    });
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const [availableStores, setAvailableStores] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                getRoles(),
                getStores()
            ]).then(([rolesRes, storesRes]) => {
                if (rolesRes.success) setAvailableRoles(rolesRes.data || []);
                if (storesRes.success) setAvailableStores(storesRes.data || []);
            });
        }
    }, [isOpen]);

    const toggleStore = (storeId: string) => {
        setFormData(prev => ({
            ...prev,
            storeIds: prev.storeIds.includes(storeId)
                ? prev.storeIds.filter(id => id !== storeId)
                : [...prev.storeIds, storeId]
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createSystemUser(formData);

        setLoading(false);

        if (result.success) {
            toast.success('Usuário criado com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Erro ao criar usuário.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Usuário" width="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5 uppercase tracking-wide">Nome Completo</label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Maria Silva"
                        className="py-2.5"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5 uppercase tracking-wide">Email de Acesso</label>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="maria@empresa.com"
                        className="py-2.5"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Senha Provisória</label>
                    <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">O usuário poderá alterar depois.</p>
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5 uppercase tracking-wide">Perfil de Acesso</label>
                    <select
                        name="role"
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="EMPLOYEE">Funcionário (Básico)</option>
                        <option value="HR_MANAGER">Gestor de RH</option>
                        <option value="ADMIN">Administrador do Sistema</option>
                        <optgroup label="Perfis Personalizados">
                            {availableRoles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wide">Acesso a Lojas</label>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, storeIds: availableStores.map(s => s.id) }))}
                            className="bg-brand-blue hover:bg-blue-800 text-white text-[10px] h-7 px-3 font-bold uppercase"
                        >
                            Selecionar Todas
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                        {availableStores.map(store => (
                            <label key={store.id} className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={formData.storeIds.includes(store.id)}
                                    onChange={() => toggleStore(store.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white">{store.tradingName || store.name}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium">
                        * Opcional. Se vazio, o usuário terá acesso a todas as lojas.
                    </p>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-50">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Usuário'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
