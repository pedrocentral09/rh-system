'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Search, User, Calendar as CalendarIcon, Activity, AlertCircle, ChevronRight, Stethoscope } from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { getEmployees } from '../actions';
import { createMedicalLeave } from '../actions/medical-leave';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { parseSafeDate } from '@/shared/utils/date-utils';

interface MedicalLeaveCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function MedicalLeaveCreateModal({ isOpen, onClose, onSuccess }: MedicalLeaveCreateModalProps) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

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
        if (isOpen) {
            loadEmployees();
        } else {
            resetForm();
        }
    }, [isOpen]);

    // Automatic Date Calculation (reusing logic from MedicalLeaveTab)
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

    async function loadEmployees() {
        setLoadingEmployees(true);
        const res = await getEmployees({ status: 'ACTIVE' });
        if (res.success) setEmployees(res.data || []);
        setLoadingEmployees(false);
    }

    function resetForm() {
        setSelectedEmployee(null);
        setSearchTerm('');
        setFile(null);
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
    }

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cpf.includes(searchTerm)
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedEmployee) {
            toast.error('Selecione um colaborador.');
            return;
        }
        if (!file) {
            toast.error('O documento do atestado é obrigatório.');
            return;
        }

        setSubmitting(true);
        try {
            // Upload file to Firebase
            const storageRef = ref(storage, `medical-leaves/${selectedEmployee.id}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            const data = {
                ...formData,
                employeeId: selectedEmployee.id,
                documentUrl: downloadUrl,
                status: 'APPROVED',
                submittedByType: 'HR',
                submittedById: 'system'
            };

            const res = await createMedicalLeave(data);
            if (res.success) {
                toast.success('Atestado registrado com sucesso.');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erro ao processar o arquivo.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideHeader width="4xl">
            <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden relative border border-border shadow-2xl">
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <div className="p-10 space-y-10 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shadow-2xl">
                            <Stethoscope className="h-8 w-8 text-brand-orange" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Protocolo Médicos & Afastamentos</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-80">Gestão de Saúde Ocupacional e Bem-Estar</p>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 no-scrollbar">
                        {!selectedEmployee ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-4 italic">Selecione o Colaborador para o Registro</label>
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-brand-orange transition-all" />
                                        <input
                                            placeholder="PROCURAR POR NOME OU CPF..."
                                            className="w-full pl-16 h-18 bg-surface-secondary border border-border text-text-primary rounded-3xl text-sm font-black uppercase tracking-widest focus:border-brand-orange/50 focus:bg-surface transition-all shadow-inner outline-none placeholder:text-text-muted/10 h-16"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {loadingEmployees ? (
                                            <div className="col-span-2 flex justify-center p-20">
                                                <Loader2 className="animate-spin h-10 w-10 text-brand-orange" />
                                            </div>
                                        ) : filteredEmployees.length === 0 ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 text-center py-20 bg-surface-secondary/50 rounded-[2rem] border border-dashed border-border">
                                                <p className="text-text-secondary text-[11px] font-black uppercase tracking-[0.4em] italic opacity-80">Nenhum registro ativo localizado na base.</p>
                                            </motion.div>
                                        ) : (
                                            filteredEmployees.slice(0, 8).map((emp, idx) => (
                                                <motion.button
                                                    key={emp.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    onClick={() => setSelectedEmployee(emp)}
                                                    className="flex items-center gap-5 p-5 rounded-[1.5rem] border border-border bg-surface-secondary hover:border-brand-blue/40 hover:bg-surface hover:shadow-xl transition-all text-left group relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-y-0 left-0 w-1 bg-brand-blue scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                                                    <div className="h-14 w-14 rounded-2xl bg-surface border border-border overflow-hidden flex-shrink-0 shadow-sm transition-all group-hover:scale-95">
                                                        {emp.photoUrl ? (
                                                            <img src={emp.photoUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-brand-blue/10 text-brand-blue font-black text-sm uppercase">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-text-primary uppercase tracking-tight truncate group-hover:text-brand-blue transition-colors italic">{emp.name}</p>
                                                        <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mt-1 opacity-80 truncate">{emp.contract?.jobRole?.name || emp.jobTitle || 'Sem cargo'}</p>
                                                    </div>
                                                    <Plus className="h-5 w-5 text-text-secondary opacity-20 group-hover:opacity-100 group-hover:text-brand-blue transition-all" />
                                                </motion.button>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Selected Employee Info */}
                                <div className="flex items-center justify-between bg-brand-blue/5 p-6 rounded-[2rem] border border-brand-blue/10 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full -mr-16 -mt-16" />
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-surface border border-brand-blue/20 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                            {selectedEmployee.photoUrl ? (
                                                <img src={selectedEmployee.photoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-brand-blue font-black text-base uppercase">
                                                    {selectedEmployee.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-text-primary uppercase tracking-tight leading-none italic">{selectedEmployee.name}</p>
                                            <p className="text-[10px] text-brand-blue font-black uppercase tracking-[0.3em] mt-2">Colaborador em Atendimento Médico</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setSelectedEmployee(null)} className="relative z-10 h-10 px-6 rounded-xl bg-surface border border-border text-[9px] font-black text-brand-blue hover:text-white hover:bg-brand-blue hover:border-brand-blue transition-all active:scale-95 uppercase tracking-widest">
                                        Trocar Fluxo 🔄
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Tipificação Médica</label>
                                        <select
                                            name="type"
                                            className="w-full h-16 rounded-2xl border border-border bg-surface-secondary px-6 py-2 text-[11px] font-black uppercase tracking-widest text-text-primary focus:border-brand-blue/50 focus:bg-surface outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                            required
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            <option value="ATESTADO" className="bg-surface">Atestado Médico</option>
                                            <option value="LICENCA_MATERNIDADE" className="bg-surface">Licença Maternidade</option>
                                            <option value="LICENCA_PATERNIDADE" className="bg-surface">Licença Paternidade</option>
                                            <option value="ACIDENTE_TRABALHO" className="bg-surface">Acidente de Trabalho</option>
                                            <option value="OUTROS" className="bg-surface">Outros Afastamentos</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Início do Evento</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue opacity-40 pointer-events-none" />
                                            <input
                                                type="date"
                                                name="startDate"
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full h-16 bg-surface-secondary border border-border text-[11px] font-black uppercase tracking-widest text-text-primary rounded-2xl pl-14 pr-6 shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Término Previsto</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue opacity-40 pointer-events-none" />
                                            <input
                                                type="date"
                                                name="endDate"
                                                required
                                                value={formData.endDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full h-16 bg-surface-secondary border border-border text-[11px] font-black uppercase tracking-widest text-text-primary rounded-2xl pl-14 pr-6 shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Duração Cronológica</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                name="daysCount"
                                                placeholder="DIAS"
                                                required
                                                value={formData.daysCount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, daysCount: e.target.value }))}
                                                className="w-full h-16 bg-surface-secondary border border-border text-[11px] font-black uppercase tracking-widest text-text-primary rounded-2xl shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all text-center text-xl font-mono outline-none"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-muted/40 uppercase tracking-widest">DIAS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Médico Responsável</label>
                                        <input
                                            name="doctorName"
                                            placeholder="NOME DO PROFISSIONAL"
                                            value={formData.doctorName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value.toUpperCase() }))}
                                            className="w-full h-16 bg-surface-secondary border border-border text-[11px] font-black uppercase tracking-widest text-text-primary rounded-2xl px-8 shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all outline-none italic placeholder:text-text-muted/10"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Classificação CID-10</label>
                                        <input
                                            name="cid"
                                            placeholder="CÓDIGO CID"
                                            value={formData.cid}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value.toUpperCase() }))}
                                            className="w-full h-16 bg-surface-secondary border border-border text-xl font-black uppercase tracking-widest text-brand-orange rounded-2xl shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all text-center font-mono outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Digitalização de Auditoria *</label>
                                    <div className="relative border-2 border-dashed border-border rounded-[2rem] p-16 text-center hover:border-brand-blue hover:bg-brand-blue/5 transition-all bg-surface-secondary group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            accept="image/*,application/pdf"
                                            required
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div className="space-y-4 relative z-10">
                                            <div className="h-16 w-16 bg-white/5 text-text-secondary group-hover:text-brand-blue group-hover:bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all shadow-sm scale-110 group-hover:rotate-6">
                                                <Activity className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm font-black text-text-primary uppercase tracking-widest italic group-hover:text-brand-blue transition-colors">
                                                {file ? file.name : "ANEXAR PROTOCOLO COMPROBATÓRIO"}
                                            </p>
                                            <p className="text-[9px] text-text-secondary font-black uppercase tracking-[0.3em] opacity-80">FORMATOS SUPORTADOS: PDF, JPG OU PNG</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] ml-4 italic">Registro de Observações Gerais</label>
                                    <textarea
                                        name="notes"
                                        placeholder="DESCRIÇÃO PARA O PRONTUÁRIO DIGITAL..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value.toUpperCase() }))}
                                        className="w-full h-32 bg-surface-secondary border border-border text-[11px] font-black uppercase tracking-widest text-text-primary rounded-[2rem] p-8 shadow-inner focus:border-brand-blue/50 focus:bg-surface transition-all outline-none resize-none placeholder:text-text-muted/10"
                                    />
                                </div>

                                <div className="flex justify-end items-center gap-8 pt-10 border-t border-border">
                                    <button type="button" onClick={onClose} disabled={submitting} className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:text-text-primary transition-colors">
                                        Abortar Procedimento
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-16 px-12 rounded-[1.25rem] bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-4 border-b-4 border-black/20 disabled:bg-surface-secondary disabled:text-text-muted"
                                    >
                                        {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                        EFETIVAR REGISTRO DIGITAL 💾
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
