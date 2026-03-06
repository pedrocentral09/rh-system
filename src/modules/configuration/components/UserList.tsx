'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getUsers, deleteUser } from '@/modules/core/actions/users';
import { UserEditModal } from './UserEditModal';
import { toast } from 'sonner';
import { CreateUserModal } from './CreateUserModal';

import { motion, AnimatePresence } from 'framer-motion';

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
        if (user.role === 'ADMIN') return <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">Acesso Total</span>;
        if (user.role === 'HR_MANAGER') return <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">Gestão RH</span>;
        if (user.roleDef) return <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">{user.roleDef.name}</span>;
        return <span className="bg-white/5 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">Operacional</span>;
    };

    if (loading) return (
        <div className="space-y-6 mt-8">
            <div className="h-16 bg-white/5 rounded-3xl animate-pulse" />
            <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Administração de <span className="text-brand-orange">Acessos</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Controle de Usuários e Permissões do Sistema</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-12 px-8 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">👤</span>
                    Novo Operador
                </button>
            </div>

            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="space-y-4">
                    <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <div className="col-span-12 md:col-span-5 text-left">Usuário / Identificação</div>
                        <div className="hidden md:block md:col-span-4 text-left">Perfil & Vinclulo</div>
                        <div className="hidden md:block md:col-span-3 text-right">Comandos</div>
                    </div>

                    <div className="space-y-3">
                        {users.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-12 items-center px-8 py-5 bg-[#0A0F1C] border border-white/5 rounded-[1.5rem] hover:border-indigo-500/30 hover:scale-[1.01] hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="col-span-12 md:col-span-5 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-indigo-500/30 transition-colors overflow-hidden">
                                        {user.employee?.photoUrl ? (
                                            <img src={user.employee.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-500 font-black">{user.name?.charAt(0) || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{user.name || 'Usuário Sem Nome'}</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                <div className="hidden md:block md:col-span-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {getRoleBadge(user)}
                                        </div>
                                        {user.storeAccess && user.storeAccess.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {user.storeAccess.slice(0, 2).map((sa: any) => (
                                                    <span key={sa.id} className="text-[8px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase tracking-tighter">
                                                        {sa.store.name}
                                                    </span>
                                                ))}
                                                {user.storeAccess.length > 2 && <span className="text-[8px] text-slate-600 font-bold ml-1">+{user.storeAccess.length - 2} mais</span>}
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Acesso Universal</span>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-3 flex justify-end gap-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        ⚙️ Configurar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500/50 hover:text-white"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {users.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum operador localizado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                }}
            />
        </div>
    );
}
