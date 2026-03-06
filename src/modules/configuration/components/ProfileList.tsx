'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getRoles, deleteRole } from '@/modules/core/actions/roles';
import { RoleModal } from './RoleModal';
import { toast } from 'sonner';

import { motion } from 'framer-motion';

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
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Perfis & <span className="text-brand-orange">Autoridade</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Matriz de Permissões e Hierarquia Funcional</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedRole(null);
                        setIsModalOpen(true);
                    }}
                    className="h-12 px-8 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg group-hover:rotate-180 transition-transform duration-500">🛡️</span>
                    Criar Novo Perfil
                </button>
            </div>

            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="space-y-4">
                    <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <div className="col-span-12 md:col-span-6 text-left">Título do Perfil / Tipo</div>
                        <div className="hidden md:block md:col-span-3 text-center">Abrangência</div>
                        <div className="hidden md:block md:col-span-3 text-right">Configuração</div>
                    </div>

                    <div className="space-y-3">
                        {roles.map((role, i) => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-12 items-center px-8 py-6 bg-[#0A0F1C] border border-white/5 rounded-[1.5rem] hover:border-indigo-500/30 hover:scale-[1.01] hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="col-span-12 md:col-span-6 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-indigo-500/30 transition-colors">
                                        🎭
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{role.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {role.isSystem ? (
                                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Definição do Sistema</span>
                                            ) : (
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">Modelo Customizado</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block md:col-span-3 text-center">
                                    <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <span className="text-sm font-black text-white">{role._count?.users || 0}</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contas Ativas</span>
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-3 flex justify-end gap-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setIsModalOpen(true);
                                        }}
                                        className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        ⚙️ Editar Regras
                                    </button>
                                    {!role.isSystem && (
                                        <button
                                            onClick={() => handleDelete(role.id, role.name)}
                                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500/50 hover:text-white"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {roles.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum perfil autoritativo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={selectedRole}
                onSuccess={loadRoles}
            />
        </div>
    );
}
