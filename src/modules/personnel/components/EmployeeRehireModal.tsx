'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { rehireEmployee } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';


import { motion } from 'framer-motion';
import { UserPlus, Briefcase, Building, Wallet, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

interface EmployeeRehireModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
    onSuccess: () => void;
}

export function EmployeeRehireModal({ isOpen, onClose, employee, onSuccess }: EmployeeRehireModalProps) {
    const [loading, setLoading] = useState(false);

    // Form States (Focus on Contractual Data)
    const [jobTitle, setJobTitle] = useState(employee?.jobTitle || '');
    const [department, setDepartment] = useState(employee?.department || '');
    const [store, setStore] = useState(employee?.contract?.store || '');
    const [baseSalary, setBaseSalary] = useState(employee?.contract?.baseSalary || '');
    const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [registrationCompany, setRegistrationCompany] = useState(employee?.contract?.registrationCompany || 'Empresa Padrão');
    const [contractType, setContractType] = useState('CLT');
    const [workShift, setWorkShift] = useState('FULL_TIME');

    if (!employee) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!confirm(`Confirma a RECONTRATAÇÃO de ${employee.name}? O contrato anterior será arquivado no histórico.`)) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('jobTitle', jobTitle);
        formData.append('department', department);
        formData.append('store', store);
        formData.append('baseSalary', baseSalary);
        formData.append('admissionDate', admissionDate);
        formData.append('registrationCompany', registrationCompany);
        formData.append('contractType', contractType);
        formData.append('workShift', workShift);

        const result = await rehireEmployee(employee.id, formData);
        setLoading(false);

        if (result.success) {
            toast.success('Colaborador recontratado com sucesso!');
            onSuccess();
        } else {
            toast.error('Erro ao recontratar: ' + (result.error || 'Erro desconhecido'));
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideHeader width="3xl">
            <div className="bg-surface/95 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden relative border border-border">
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10 p-10 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shadow-2xl">
                            <UserPlus className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Protocolo de Recontratação</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Restauração de Vínculo e Novo Ciclo</p>
                        </div>
                    </div>

                    <div className="bg-brand-blue/10 border border-brand-blue/20 p-6 rounded-2xl flex items-start gap-4 shadow-inner group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <ShieldCheck className="h-5 w-5 text-brand-blue flex-shrink-0" />
                        <p className="text-[11px] font-bold text-brand-blue/80 leading-relaxed uppercase tracking-wider">
                            Nota: Esta ação iniciará um novo ciclo contratual para <span className="text-brand-blue font-black">{employee.name}</span>. O histórico anterior será preservado para auditoria.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 italic">Novo Cargo Estratégico</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 italic">Departamento / Setor</label>
                            <div className="relative group">
                                <Building className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 italic">Saldamento Base (R$)</label>
                            <div className="relative group">
                                <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={baseSalary}
                                    onChange={(e) => setBaseSalary(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 italic">Data de Reingresso</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    type="date"
                                    value={admissionDate}
                                    onChange={(e) => setAdmissionDate(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 italic">Natureza Jurídica do Contrato</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['CLT', 'PJ', 'ESTAGIO'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setContractType(type)}
                                        className={`h-16 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${contractType === type
                                            ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]'
                                            : 'bg-surface-secondary border-border text-text-muted hover:border-brand-blue/30'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-8 pt-10 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
                        >
                            Abortar Operação
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-12 rounded-[1.25rem] bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-3 border-b-4 border-black/20"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            RESTAURAR VÍNCULO ♻️
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
