'use client';

import { motion } from 'framer-motion';
import { 
    UserPlus, 
    FileCheck, 
    CheckCircle2, 
    Rocket, 
    CalendarCheck, 
    GraduationCap, 
    ShieldCheck,
    LogOut,
    Clock,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import { updateEmployeeJourneyStatus } from '../actions/employees';
import { toast } from 'sonner';
import { useState } from 'react';

interface EmployeeJourneyProps {
    employee: any;
    onUpdate?: () => void;
}

const PHASES = [
    {
        id: 'ADMISSION',
        label: 'Admissão',
        icon: UserPlus,
        description: 'Coleta de documentos e cadastro inicial.',
        color: 'orange',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-500'
    },
    {
        id: 'INTEGRATION',
        label: 'Integração',
        icon: FileCheck,
        description: 'Treinamentos, exames (ASO) e assinaturas.',
        color: 'blue',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-500'
    },
    {
        id: 'ACTIVE',
        label: 'Experiência (90d)',
        icon: Rocket,
        description: 'Período probatório e adaptação cultural.',
        color: 'emerald',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-500'
    },
    {
        id: 'STABILIZED',
        label: 'Efetivado',
        icon: ShieldCheck,
        description: 'Membro consolidado do time.',
        color: 'purple',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-500'
    },
    {
        id: 'OFFBOARDING',
        label: 'Desligamento',
        icon: LogOut,
        description: 'Processo de saída e devolução de materiais.',
        color: 'rose',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-500'
    }
];

export function EmployeeJourney({ employee, onUpdate }: EmployeeJourneyProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const currentStatus = employee.journeyStatus || 'ACTIVE';

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(newStatus);
        try {
            const res = await updateEmployeeJourneyStatus(employee.id, newStatus);
            if (res.success) {
                toast.success('Fase da jornada atualizada!');
                if (onUpdate) onUpdate();
            } else {
                toast.error(res.message || 'Erro ao atualizar fase.');
            }
        } catch (error) {
            toast.error('Erro de conexão ao atualizar jornada.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="py-6 space-y-12">
            {/* Header / Info */}
            <div className="text-center space-y-2">
                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] border-b border-border pb-2 inline-block">Linha do Tempo Profissional</h4>
                <p className="text-sm font-bold text-text-primary">Gerencie a evolução de {employee.name.split(' ')[0]} dentro da empresa.</p>
            </div>

            {/* Journey Progress Bar */}
            <div className="relative pt-8">
                {/* Horizontal Line Background */}
                <div className="absolute top-[4.5rem] left-0 right-0 h-1 bg-surface-secondary border-b border-white/5 rounded-full" />
                
                {/* Active Progress Line */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(PHASES.findIndex(p => p.id === currentStatus) / (PHASES.length - 1)) * 100}%` }}
                    className="absolute top-[4.5rem] left-0 h-1 bg-gradient-to-r from-brand-orange to-brand-blue rounded-full z-10 shadow-[0_0_15px_rgba(255,120,0,0.3)]"
                />

                <div className="flex justify-between items-start relative z-20 px-2 sm:px-6">
                    {PHASES.map((phase, idx) => {
                        const Icon = phase.icon;
                        const isPast = PHASES.findIndex(p => p.id === currentStatus) >= idx;
                        const isCurrent = currentStatus === phase.id;

                        return (
                            <div key={phase.id} className="flex flex-col items-center group max-w-[120px]">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusUpdate(phase.id)}
                                    disabled={loading !== null}
                                    className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2
                                        ${isCurrent ? `${phase.bg} ${phase.border} ${phase.text} shadow-xl scale-110` : ''}
                                        ${isPast && !isCurrent ? 'bg-text-primary text-surface border-text-primary' : ''}
                                        ${!isPast ? 'bg-surface border-border text-text-muted hover:border-brand-orange/30' : ''}
                                    `}
                                >
                                    {loading === phase.id ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                            <Clock className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        <Icon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} />
                                    )}
                                </motion.button>
                                
                                <div className="mt-4 text-center">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-brand-orange' : 'text-text-secondary'}`}>
                                        {phase.label}
                                    </p>
                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter mt-1 opacity-60 leading-tight hidden sm:block">
                                        {phase.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Multi-Phase Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="bg-surface-secondary/40 border border-border rounded-[2rem] p-8 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <UserCheck className="w-16 h-16" />
                    </div>
                    <h5 className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Próximos Passos Recomendados</h5>
                    <ul className="space-y-4">
                        <li className="flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <p className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-tight">Verificar assinatura do contrato de trabalho (Módulo Compliance).</p>
                        </li>
                        <li className="flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <p className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-tight">Agendar treinamento de integração com o gestor direto.</p>
                        </li>
                    </ul>
                </div>

                <div className="bg-surface-secondary/40 border border-border rounded-[2rem] p-8 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <AlertCircle className="w-16 h-16" />
                    </div>
                    <h5 className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Compromissos do RH</h5>
                    <ul className="space-y-4">
                        <li className="flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-brand-orange flex items-center justify-center shrink-0">
                                <CalendarCheck className="w-3 h-3" />
                            </div>
                            <p className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-tight">Avaliação de 45 dias (Primeiro ciclo de experiência).</p>
                        </li>
                        <li className="flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-brand-orange flex items-center justify-center shrink-0">
                                <GraduationCap className="w-3 h-3" />
                            </div>
                            <p className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-tight">Conferir entrega de EPIs e Uniformes se aplicável.</p>
                        </li>
                    </ul>
                </div>
            </div>
            
            {/* Detailed Timeline Placeholder */}
            <div className="pt-8 border-t border-border">
               <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Registro Histórico da Jornada</h4>
                    <span className="text-[8px] font-black text-brand-orange uppercase bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">Auditável</span>
               </div>
               
               <div className="space-y-6">
                    <div className="flex gap-6 items-center p-4 bg-surface rounded-2xl border border-border/50">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest w-24">Hoje</span>
                        <p className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Cadastro ativo e monitorado pelo sistema Antigravity.</p>
                    </div>
                    <div className="flex gap-6 items-center p-4 bg-surface/50 rounded-2xl border border-border/30 opacity-60">
                        <div className="h-2 w-2 rounded-full bg-brand-orange" />
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest w-24">{new Date(employee.createdAt).toLocaleDateString('pt-BR')}</span>
                        <p className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Inicio da jornada: Candidato convertido em colaborador.</p>
                    </div>
               </div>
            </div>
        </div>
    );
}
