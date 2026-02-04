'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { createSystemUser } from '@/modules/core/actions/admin-users';
import { toast } from 'sonner';

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
        role: 'EMPLOYEE'
    });

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
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nome Completo</label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Maria Silva"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Email de Acesso</label>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="maria@empresa.com"
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
                    <label className="text-sm font-medium text-slate-700 block mb-1">Perfil de Acesso</label>
                    <select
                        name="role"
                        className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="EMPLOYEE">Funcionário (Básico)</option>
                        <option value="HR_MANAGER">Gestor de RH</option>
                        <option value="ADMIN">Administrador do Sistema</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
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
