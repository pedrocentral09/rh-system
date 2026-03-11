'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Plus,
    Trash2,
    FileSignature,
    Loader2,
    Search,
    BellRing
} from 'lucide-react';
import { toast } from 'sonner';
import { getJobRoles } from '../actions/auxiliary';
import {
    getMandatoryDocuments,
    createMandatoryDocument,
    deleteMandatoryDocument,
    checkAndNotifyCompliance
} from '../actions/compliance';

export function ComplianceManager() {
    const [roles, setRoles] = useState<any[]>([]);
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifying, setNotifying] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocCategory, setNewDocCategory] = useState('ADMISSION');

    const loadData = async () => {
        setLoading(true);
        const [rolesRes, docsRes] = await Promise.all([
            getJobRoles(),
            getMandatoryDocuments()
        ]);

        if (rolesRes.success) setRoles(rolesRes.data || []);
        if (docsRes.success) setDocs(docsRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = async () => {
        if (!selectedRoleId || !newDocTitle) {
            toast.error('Selecione um cargo e informe o título do documento.');
            return;
        }

        setLoading(true);
        const res = await createMandatoryDocument({
            title: newDocTitle,
            category: newDocCategory,
            jobRoleId: selectedRoleId
        });

        if (res.success) {
            toast.success('Regra de conformidade criada!');
            setNewDocTitle('');
            loadData();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta exigência?')) return;
        setLoading(true);
        const res = await deleteMandatoryDocument(id);
        if (res.success) {
            toast.success('Exigência removida.');
            loadData();
        }
        setLoading(false);
    };

    const handleNotify = async () => {
        setNotifying(true);
        const res = await checkAndNotifyCompliance();
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setNotifying(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Compliance de <span className="text-emerald-500">Documentos</span></h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Gestão de Exigências Legais por Função</p>
                    </div>
                </div>

                <button
                    onClick={handleNotify}
                    disabled={notifying}
                    className="px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all flex items-center gap-3 group"
                >
                    {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4 group-hover:animate-bounce" />}
                    Disparar Alertas de Pendência
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Rule Creator */}
                <div className="lg:col-span-4">
                    <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative space-y-6">
                            <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Nova Regra de Obrigatoriedade</h4>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Para o Cargo:</label>
                                    <select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                        className="w-full h-12 px-4 rounded-2xl bg-slate-950 border border-border text-xs font-bold text-text-primary outline-none focus:border-emerald-500/50 transition-all"
                                    >
                                        <option value="">Selecione um cargo...</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Documento Obrigatório:</label>
                                    <input
                                        type="text"
                                        value={newDocTitle}
                                        onChange={(e) => setNewDocTitle(e.target.value)}
                                        placeholder="Ex: Contrato de Trabalho"
                                        className="w-full h-12 px-4 rounded-2xl bg-slate-950 border border-border text-xs font-bold text-text-primary outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Categoria:</label>
                                    <select
                                        value={newDocCategory}
                                        onChange={(e) => setNewDocCategory(e.target.value)}
                                        className="w-full h-12 px-4 rounded-2xl bg-slate-950 border border-border text-xs font-bold text-text-primary outline-none focus:border-emerald-500/50 transition-all"
                                    >
                                        <option value="ADMISSION">Integração / Admissão</option>
                                        <option value="PERIODIC">Periódicos / Manutenção</option>
                                        <option value="TRAINING">Treinamentos / EPI</option>
                                        <option value="TERMINATION">Rescisão / Desligamento</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={loading}
                                    className="w-full h-14 mt-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Fixar Exigência
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requirements List */}
                <div className="lg:col-span-8">
                    <div className="bg-surface/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative min-h-[500px]">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Exigências Ativas no RH</h5>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 border border-white/5">
                                <Search className="h-3 w-3 text-text-muted" />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Filtros Avançados</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {docs.length === 0 && !loading && (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <FileSignature className="h-16 w-16 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">Nenhuma regra definida</p>
                                </div>
                            )}

                            {docs.map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-6 rounded-3xl bg-surface border border-border hover:border-emerald-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5">
                                            <FileSignature className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-text-primary uppercase tracking-tight">{doc.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                                <span className="text-emerald-500/80">{doc.jobRole.name}</span>
                                                <span className="opacity-30">•</span>
                                                <span>Cat: {doc.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-3 rounded-xl bg-text-primary/5 text-text-muted hover:bg-rose-500/20 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
