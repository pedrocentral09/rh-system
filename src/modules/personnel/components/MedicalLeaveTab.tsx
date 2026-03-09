'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Plus, FileText, Download, Trash2, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getMedicalLeaves, createMedicalLeave, deleteMedicalLeave } from '../actions/medical-leave';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatSafeDate, parseSafeDate } from '@/shared/utils/date-utils';

interface MedicalLeaveTabProps {
    employeeId: string;
}

import { motion, AnimatePresence } from 'framer-motion';

export function MedicalLeaveTab({ employeeId }: MedicalLeaveTabProps) {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        type: 'ATESTADO',
        startDate: '',
        endDate: '',
        daysCount: '',
        crm: '',
        doctorName: '',
        cid: '',
        notes: ''
    });

    useEffect(() => {
        loadLeaves();
    }, [employeeId]);

    // Automatic Date Calculation
    useEffect(() => {
        if (formData.startDate && formData.daysCount) {
            const start = parseSafeDate(formData.startDate);
            if (!start) return;
            const days = parseInt(formData.daysCount);
            if (!isNaN(days) && days > 0) {
                const end = new Date(start);
                end.setDate(start.getDate() + (days - 1));
                const endStr = end.toISOString().split('T')[0];
                if (formData.endDate !== endStr) {
                    setFormData(prev => ({ ...prev, endDate: endStr }));
                }
            }
        }
    }, [formData.startDate, formData.daysCount]);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = parseSafeDate(formData.startDate);
            const end = parseSafeDate(formData.endDate);
            if (start && end && end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                if (formData.daysCount !== diffDays.toString()) {
                    setFormData(prev => ({ ...prev, daysCount: diffDays.toString() }));
                }
            }
        }
    }, [formData.endDate]);

    async function loadLeaves() {
        setLoading(true);
        const res = await getMedicalLeaves(employeeId);
        if (res.success) setLeaves(res.data || []);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!file) {
            toast.error('O documento do atestado é obrigatório.');
            return;
        }

        setSubmitting(true);
        try {
            // Upload file to Firebase
            const storageRef = ref(storage, `medical-leaves/${employeeId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            const data = {
                ...formData,
                employeeId,
                documentUrl: downloadUrl,
                status: 'APPROVED', // HR submitted is auto-approved
                submittedByType: 'HR',
                submittedById: 'system',
                daysCount: Number(formData.daysCount)
            };

            const res = await createMedicalLeave(data);
            if (res.success) {
                toast.success('Registro médico incluído com sucesso!');
                setShowForm(false);
                setFormData({
                    type: 'ATESTADO',
                    startDate: '',
                    endDate: '',
                    daysCount: '',
                    crm: '',
                    doctorName: '',
                    cid: '',
                    notes: ''
                });
                setFile(null);
                loadLeaves();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao processar arquivo');
        }
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Excluir este registro médico permanentemente?')) return;
        const res = await deleteMedicalLeave(id);
        if (res.success) {
            toast.success('Removido com sucesso');
            loadLeaves();
        } else {
            toast.error(res.error);
        }
    }

    const totalDays = leaves.reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-brand-orange" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Stat Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-red-500/10 border border-red-500/20 px-8 py-6 rounded-[2.5rem] backdrop-blur-xl group shadow-inner">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 block opacity-60">Dias Acumulados</span>
                        <div className="text-4xl font-black text-red-500 tracking-tighter group-hover:scale-110 transition-transform italic">
                            {totalDays} <span className="text-[10px] uppercase text-text-muted opacity-60">dias</span>
                        </div>
                    </div>
                    <div className="bg-surface-secondary border border-border px-8 py-6 rounded-[2.5rem] backdrop-blur-xl shadow-inner">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 block opacity-60">Ocorrências</span>
                        <div className="text-4xl font-black text-text-primary tracking-tighter italic">
                            {leaves.length} <span className="text-[10px] uppercase text-text-muted opacity-60">registros</span>
                        </div>
                    </div>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="h-16 px-10 rounded-[1.25rem] bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-[0_0_40px_rgba(239,68,68,0.25)] flex items-center justify-center gap-3 group active:scale-[0.98] border-b-4 border-black/20"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        ADICIONAR PROTOCOLO 🏥
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Modalidade de Registro</Label>
                                        <select
                                            className="w-full h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="ATESTADO" className="bg-surface">Atestado Médico Médio</option>
                                            <option value="LICENCA_MATERNIDADE" className="bg-surface">Licença Maternidade</option>
                                            <option value="LICENCA_PATERNIDADE" className="bg-surface">Licença Paternidade</option>
                                            <option value="ACIDENTE_TRABALHO" className="bg-surface">Acidente de Trabalho</option>
                                            <option value="OUTROS" className="bg-surface">Outras Ausências</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Início</Label>
                                        <Input
                                            type="date"
                                            className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary focus:border-brand-orange/30 transition-all font-black uppercase tracking-widest"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Prazo (Dias)</Label>
                                        <Input
                                            type="number"
                                            className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary focus:border-brand-orange/30 transition-all font-black placeholder:text-text-muted/40"
                                            placeholder="Ex: 5"
                                            value={formData.daysCount}
                                            onChange={(e) => setFormData({ ...formData, daysCount: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Final Previsto</Label>
                                        <Input
                                            type="date"
                                            className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary/50 bg-text-primary/2 transition-all font-black uppercase tracking-widest"
                                            value={formData.endDate}
                                            readOnly
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">CID</Label>
                                        <Input
                                            className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary focus:border-brand-orange/30 transition-all font-black placeholder:text-text-muted/40 uppercase"
                                            placeholder="EX: Z00"
                                            value={formData.cid}
                                            onChange={(e) => setFormData({ ...formData, cid: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Profissional / CRM</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary focus:border-brand-orange/30"
                                                placeholder="CRM"
                                                value={formData.crm}
                                                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                                            />
                                            <Input
                                                className="h-14 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] text-text-primary focus:border-brand-orange/30"
                                                placeholder="Nome do Médico"
                                                value={formData.doctorName}
                                                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Arquivo de Evidência (.PDF, .JPG)</Label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="h-14 bg-text-primary/5 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-[10px] font-black text-text-muted uppercase tracking-widest transition-all group-hover:border-red-500/30 group-hover:bg-text-primary/[0.02]">
                                                {file ? <span className="text-emerald-400 italic flex items-center gap-2">✅ {file.name}</span> : 'Clique para anexar documento'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center gap-6 pt-6 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        disabled={submitting}
                                        className="h-14 px-12 rounded-2xl bg-text-primary text-background text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center gap-2 disabled:bg-text-primary/20 disabled:text-text-muted shadow-2xl active:scale-[0.98]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Finalizar Registro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Activity Feed */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em]">Histórico de Saúde Operacional</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4">
                    {leaves.map((leave, i) => (
                        <motion.div
                            key={leave.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-surface-secondary/40 backdrop-blur-sm border border-border/60 rounded-[2.5rem] p-10 hover:bg-surface hover:border-brand-orange/30 transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-brand-orange/[0.01] to-brand-orange/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:border-red-500/30 transition-colors">
                                        🩺
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight italic">{leave.type.replace('_', ' ')}</h4>
                                            {leave.cid && <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black">CID {leave.cid}</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-text-secondary uppercase tracking-widest mt-3 opacity-80">
                                            <span className="flex items-center gap-2">
                                                <CalendarIcon className="h-3 w-3" />
                                                {formatSafeDate(leave.startDate, 'dd.MM')} - {formatSafeDate(leave.endDate, 'dd.MM.yy')}
                                            </span>
                                            <span className="flex items-center gap-2 text-red-500">
                                                <Clock className="h-3 w-3" />
                                                {leave.daysCount} Dias de Ausência
                                            </span>
                                            {leave.crm && <span className="">Médico: {leave.doctorName || 'N/A'} (CRM {leave.crm})</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.open(leave.documentUrl, '_blank')}
                                        className="h-12 px-8 rounded-xl bg-surface border border-border text-[9px] font-black uppercase tracking-widest text-text-primary hover:bg-surface-secondary hover:border-brand-orange/30 transition-all flex items-center gap-3 shadow-sm"
                                    >
                                        <Download className="h-4 w-4" />
                                        Laudo Médico
                                    </button>
                                    <button
                                        onClick={() => handleDelete(leave.id)}
                                        className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all shadow-sm group-hover:bg-red-500/5"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {leave.notes && (
                                <div className="mt-6 pt-6 border-t border-border italic text-[11px] text-text-secondary font-medium">
                                    " {leave.notes} "
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {leaves.length === 0 && (
                        <div className="py-24 text-center bg-text-primary/2 rounded-[2.5rem] border border-border border-dashed">
                            <FileText className="h-12 w-12 text-text-secondary/40 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em]">Prontuário Digital Vazio</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
