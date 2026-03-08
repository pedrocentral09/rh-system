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

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStore, setFilterStore] = useState('');
    const [filterCompany, setFilterCompany] = useState('');

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
        if (user.role === 'ADMIN') return <span className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">Acesso Total</span>;
        if (user.role === 'HR_MANAGER') return <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">Gestão RH</span>;
        if (user.roleDef) return <span className="bg-surface-secondary text-text-muted px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-border">{user.roleDef.name}</span>;
        return <span className="bg-surface-secondary text-text-muted px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-border">Operacional</span>;
    };

    const companies = Array.from(new Set(
        users.flatMap(u => u.storeAccess?.map((sa: any) => sa.store.company?.name).filter(Boolean) || [])
    ));
    const stores = Array.from(new Set(
        users.flatMap(u => u.storeAccess?.map((sa: any) => sa.store.name).filter(Boolean) || [])
    ));

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const userCompanies = user.storeAccess?.map((sa: any) => sa.store.company?.name);
        const matchesCompany = filterCompany ? userCompanies?.includes(filterCompany) : true;

        const userStores = user.storeAccess?.map((sa: any) => sa.store.name);
        const matchesStore = filterStore ? userStores?.includes(filterStore) : true;

        return matchesSearch && matchesCompany && matchesStore;
    });

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
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Administração de <span className="text-brand-orange">Acessos</span></h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Controle de Usuários e Permissões do Sistema</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-12 px-8 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">👤</span>
                    Novo Operador
                </button>
            </div>

            <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 h-12 bg-surface-secondary border border-border rounded-xl px-4 text-sm text-text-primary placeholder-text-muted focus:border-brand-orange/50 transition-colors outline-none"
                    />
                    <select
                        value={filterCompany}
                        onChange={(e) => setFilterCompany(e.target.value)}
                        className="h-12 bg-surface-secondary border border-border rounded-xl px-4 text-sm text-text-secondary focus:border-brand-orange/50 transition-colors outline-none cursor-pointer appearance-none min-w-[200px] w-full md:w-auto"
                    >
                        <option value="" className="bg-surface">Todas as Empresas</option>
                        {companies.map((company: any) => (
                            <option key={company} value={company} className="bg-surface">{company}</option>
                        ))}
                    </select>
                    <select
                        value={filterStore}
                        onChange={(e) => setFilterStore(e.target.value)}
                        className="h-12 bg-surface-secondary border border-border rounded-xl px-4 text-sm text-text-secondary focus:border-brand-orange/50 transition-colors outline-none cursor-pointer appearance-none min-w-[200px] w-full md:w-auto"
                    >
                        <option value="" className="bg-surface">Todas as Lojas</option>
                        {stores.map((store: any) => (
                            <option key={store} value={store} className="bg-surface">{store}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                        <div className="col-span-12 md:col-span-5 text-left">Usuário / Identificação</div>
                        <div className="hidden md:block md:col-span-4 text-left">Perfil & Vinclulo</div>
                        <div className="hidden md:block md:col-span-3 text-right">Comandos</div>
                    </div>

                    <div className="space-y-3">
                        {filteredUsers.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-12 items-center px-8 py-5 bg-surface border border-border rounded-[1.5rem] hover:border-indigo-500/30 hover:scale-[1.01] hover:bg-surface-hover transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="col-span-12 md:col-span-5 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center text-xl shadow-inner group-hover:border-indigo-500/30 transition-colors overflow-hidden">
                                        {user.employee?.photoUrl ? (
                                            <img src={user.employee.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-text-muted font-black">{user.name?.charAt(0) || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{user.name || 'Usuário Sem Nome'}</h4>
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{user.email}</p>
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
                                                    <span key={sa.id} className="text-[8px] bg-surface-secondary text-text-muted px-1.5 py-0.5 rounded border border-border font-black uppercase tracking-tighter">
                                                        {sa.store.name}
                                                    </span>
                                                ))}
                                                {user.storeAccess.length > 2 && <span className="text-[8px] text-text-muted font-bold ml-1">+{user.storeAccess.length - 2} mais</span>}
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-black text-text-muted/50 uppercase tracking-widest italic">Acesso Universal</span>
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

                        {filteredUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum operador localizado com os filtros selecionados</p>
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
