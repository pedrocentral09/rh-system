'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Tabs } from '@/shared/components/ui/tabs';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeTransferModal from './EmployeeTransferModal';
import { EmployeeEditModal } from './EmployeeEditModal';
import { getTransferHistory, getEmployee } from '../actions';
import { Loader2, ShieldAlert, KeyRound, Copy, CheckCircle, CheckCircle2, AlertCircle, Heart, HeartPulse, MapPin, User, CreditCard, Sparkles, ChevronRight, Search, FileText, Camera, BadgeCheck, Pencil, PencilLine, UserPlus, Phone, Mail, Calendar, Building2, UserCircle, Briefcase, Plus, Send } from 'lucide-react';
import { getTemplatesAction } from '@/modules/documents/actions/templates';
import { generateDocumentFromTemplateAction } from '@/modules/documents/actions/generate';
import { EmployeeTerminationModal } from './EmployeeTerminationModal';
import { EmployeeRehireModal } from './EmployeeRehireModal';
import { VacationModal } from './VacationModal';
import { EmployeeTimeTrackingModal } from './EmployeeTimeTrackingModal';
import { EmployeeTimeSheetTab } from '@/modules/time-tracking/components/EmployeeTimeSheetTab';
import { MedicalLeaveTab } from './MedicalLeaveTab';
import { resetEmployeePinAction } from '@/modules/core/actions/auth';
import { toast } from 'sonner';
import { approveSelfOnboarding } from '../actions/employees';
import { SignatureCapture } from './SignatureCapture';
import { signDocument } from '../actions/signatures';
import { formatSafeDate } from '@/shared/utils/date-utils';
import { TerminationSimulator } from './TerminationSimulator';
import { CostProvision } from './CostProvision';

interface EmployeeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    employee: any;
    defaultTab?: string;
}

export function EmployeeDetailsModal({ isOpen, onClose, onSuccess, employee, defaultTab }: EmployeeDetailsModalProps) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
    const [isRehireModalOpen, setIsRehireModalOpen] = useState(false);
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [isTimeTrackingModalOpen, setIsTimeTrackingModalOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [fullEmployee, setFullEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signingDocument, setSigningDocument] = useState<any>(null);
    const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false);

    useEffect(() => {
        if (isOpen && employee?.id) {
            setLoading(true);
            Promise.all([
                getEmployee(employee.id),
                getTransferHistory(employee.id)
            ]).then(([empRes, histRes]) => {
                if (empRes.success) setFullEmployee(empRes.data);
                if (histRes.success) setHistory(histRes.data || []);
            }).finally(() => setLoading(false));
        } else {
            setFullEmployee(null);
        }
    }, [isOpen, employee]);

    if (!isOpen) return null;

    const displayEmployee = fullEmployee || employee;

    const formatDate = (date: string | Date) => {
        if (!date) return '-';
        const d = new Date(date);
        return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
    };

    const translateGender = (gender: string) => {
        const map: Record<string, string> = { 'MALE': 'Masculino', 'FEMALE': 'Feminino', 'OTHER': 'Outro' };
        return map[gender] || gender || '-';
    };

    const handleApprove = async () => {
        toast('✨ Protocolo de Aprovação', {
            description: `Deseja realmente autenticar e aprovar o cadastro de ${displayEmployee.name}?`,
            action: {
                label: 'Aprovar Agora',
                onClick: async () => {
                    const res = await approveSelfOnboarding(displayEmployee.id);
                    if (res.success) {
                        toast.success('Cadastro aprovado com sucesso!');
                        onClose();
                        if (onSuccess) onSuccess();
                    } else {
                        toast.error(res.message || 'Erro ao aprovar cadastro');
                    }
                }
            }
        });
    };

    const tabs = [
        {
            id: 'details_personal',
            label: '👤 Pessoal',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Dados Pessoais & Contato</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-text-secondary">
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">CPF</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.cpf}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">RG</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.rg || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Nascimento</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{formatDate(displayEmployee.dateOfBirth)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Gênero</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{translateGender(displayEmployee.gender)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Estado Civil</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.maritalStatus || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Email</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1 truncate max-w-full">{displayEmployee.email}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Telefone</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.phone || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Fixo</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.landline || '-'}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_family',
            label: '💍 Família',
            content: (
                <div className="space-y-8 py-4">
                    {displayEmployee.spouse && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] border-b border-border pb-2 mb-6">Dados do Cônjuge</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1">Nome</p>
                                    <p className="text-sm font-bold text-text-primary">{displayEmployee.spouse.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1">CPF</p>
                                    <p className="text-sm font-bold text-text-primary">{displayEmployee.spouse.cpf || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.legalGuardian && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] border-b border-border pb-2 mb-6">Responsável Legal</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1">Nome</p>
                                    <p className="text-sm font-bold text-text-primary">{displayEmployee.legalGuardian.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-text-secondary/70 uppercase tracking-widest mb-1">Telefone / Relacionamento</p>
                                    <p className="text-sm font-bold text-text-primary">{displayEmployee.legalGuardian.phone} / {displayEmployee.legalGuardian.relationship}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.dependents && displayEmployee.dependents.length > 0 ? (
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] border-b border-border pb-2 mb-6 text-center">Dependentes ({displayEmployee.dependents.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayEmployee.dependents.map((dep: any, idx: number) => (
                                    <div key={idx} className="bg-surface-secondary border border-border p-4 rounded-2xl group hover:border-brand-orange/20 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors">{dep.name}</p>
                                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{dep.relationship || 'Dependente'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
                                            <span>{dep.cpf || '-'}</span>
                                            <span>{formatDate(dep.birthDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (!displayEmployee.spouse && !displayEmployee.legalGuardian) && (
                        <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Nenhum dado familiar cadastrado</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_emergency',
            label: '🚑 Emergência',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Contato de Emergência</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-text-secondary">
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Nome</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactName || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Telefone</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactPhone || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Parentesco</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactRelationship || '-'}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_address',
            label: '📍 Endereço',
            content: (
                <div className="space-y-8 py-4">
                    {displayEmployee.address ? (
                        <>
                            <div className="text-center">
                                <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Endereço Residencial</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-text-secondary">
                                <div className="col-span-2 group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Logradouro</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.address.street}, {displayEmployee.address.number} {displayEmployee.address.complement && `- ${displayEmployee.address.complement}`}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Bairro</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.address.neighborhood}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Cidade/UF</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.address.city} - {displayEmployee.address.state}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">CEP</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.address.zipCode}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Endereço não cadastrado</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_bank',
            label: '💰 Bancário',
            content: (
                <div className="space-y-8 py-4">
                    {displayEmployee.bankData ? (
                        <>
                            <div className="text-center">
                                <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Dados Bancários</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-text-secondary">
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Banco</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.bankData.bankName}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Tipo de Conta</p>
                                    <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.bankData.accountType}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Agência</p>
                                    <p className="text-sm font-bold text-text-primary font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.agency}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Conta</p>
                                    <p className="text-sm font-bold text-text-primary font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.accountNumber}</p>
                                </div>
                                <div className="col-span-2 group">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Chave PIX</p>
                                    <p className="text-sm font-bold text-text-primary font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.pixKey || '-'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Dados bancários não cadastrados</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_job',
            label: '💼 Contratual',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Informações do Contrato</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-text-secondary">
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Cargo</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.jobRole?.name || displayEmployee.jobTitle || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Setor</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{displayEmployee.contract?.sectorDef?.name || displayEmployee.department}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Admissão</p>
                            <p className="text-sm font-bold text-text-primary transition-all group-hover:translate-x-1">{formatDate(displayEmployee.hireDate)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 group-hover:text-brand-orange/60 transition-colors">Status</p>
                            <span className={`px-3 py-1 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full border transition-all group-hover:scale-105 
                               ${displayEmployee.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' : 'bg-surface-secondary text-text-muted border-border'}`}>
                                {displayEmployee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_history',
            label: '🕒 Histórico',
            content: (
                <div className="space-y-12 py-4">
                    {/* Career History */}
                    <div>
                        <div className="text-center">
                            <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Histórico de Cargos</h4>
                        </div>
                        {displayEmployee.careerHistory?.length > 0 ? (
                            <div className="relative border-l border-border ml-4 flex flex-col gap-10">
                                {displayEmployee.careerHistory.map((item: any) => (
                                    <div key={item.id} className="relative pl-10 group">
                                        <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-surface border-2 border-emerald-500 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 z-10"></div>
                                        <time className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-3 opacity-60">{formatDate(item.changeDate)}</time>
                                        <div className="bg-surface-secondary/40 border border-border/60 rounded-3xl p-6 hover:border-emerald-500/30 transition-all shadow-sm group-hover:shadow-md relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <User className="h-12 w-12 text-emerald-500" />
                                            </div>
                                            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight mb-2 flex items-center gap-2">
                                                Novo Cargo: <span className="text-emerald-500">{item.newRole?.name}</span>
                                            </h3>
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">
                                                Anterior: <span className="text-text-primary/70">{item.previousRole?.name || 'Início de Carreira'}</span>
                                            </div>
                                            <div className="bg-surface/50 border border-border/40 p-4 rounded-2xl relative mt-4">
                                                <span className="absolute -top-2.5 left-4 px-3 bg-surface-secondary rounded-full text-[8px] font-black text-text-muted uppercase tracking-widest">Protocolo de Alteração</span>
                                                <p className="text-xs text-text-muted italic font-medium leading-relaxed">"{item.reason}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                                <p className="text-text-muted text-xs font-black uppercase tracking-widest">Nenhuma alteração de cargo registrada</p>
                            </div>
                        )}
                    </div>

                    {/* Store Transfers */}
                    <div>
                        <div className="text-center">
                            <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Histórico de Unidades</h4>
                        </div>
                        {history.length > 0 ? (
                            <div className="relative border-l border-border ml-4 flex flex-col gap-10">
                                {history.map((item: any, index: number) => (
                                    <div key={item.id} className="relative pl-10 group">
                                        <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-surface border-2 border-brand-orange group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(255,120,0,0.4)] transition-all duration-300 z-10"></div>
                                        <time className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-3 opacity-60">{formatDate(item.date)}</time>
                                        <div className="bg-surface-secondary/40 border border-border/60 rounded-3xl p-6 hover:border-brand-orange/30 transition-all shadow-sm group-hover:shadow-md relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <MapPin className="h-12 w-12 text-brand-orange" />
                                            </div>
                                            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight mb-2 flex items-center gap-2">
                                                Transferido para <span className="text-brand-orange">{item.newStore}</span>
                                            </h3>
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">
                                                Anterior: <span className="text-text-primary/70">{item.previousStore}</span>
                                            </div>
                                            <div className="bg-surface/50 border border-border/40 p-4 rounded-2xl relative mt-4">
                                                <span className="absolute -top-2.5 left-4 px-3 bg-surface-secondary rounded-full text-[8px] font-black text-text-muted uppercase tracking-widest">Justificativa Logística</span>
                                                <p className="text-xs text-text-muted italic font-medium leading-relaxed">"{item.reason}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                                <p className="text-text-muted text-xs font-black uppercase tracking-widest">Nenhuma transferência registrada</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 'details_documents',
            label: '📁 Documentos',
            content: (
                <div className="space-y-8 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Gestão de Prontuário Digital</h4>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60 italic">Arquivos oficiais e conformidade legal</p>
                        </div>
                        <button
                            onClick={async () => {
                                setIsGeneratingDoc(true);
                                const res = await getTemplatesAction();
                                if (res.success) {
                                    setTemplates(res.data as any);
                                    setIsTemplateSelectOpen(true);
                                } else {
                                    toast.error(res.error);
                                }
                                setIsGeneratingDoc(false);
                            }}
                            disabled={isGeneratingDoc}
                            className="h-12 px-8 rounded-2xl bg-brand-orange text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-brand-orange/20 flex items-center gap-3 border-b-4 border-black/20 group"
                        >
                            {isGeneratingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />}
                            Emitir Novo Documento
                        </button>
                    </div>

                    {isTemplateSelectOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-surface-secondary border border-brand-orange/20 p-8 rounded-[2.5rem] mb-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full" />
                            <div className="flex items-center justify-between mb-6">
                                <h5 className="text-xs font-black text-text-primary uppercase tracking-widest italic">Selecione uma Matriz para Geração</h5>
                                <button onClick={() => setIsTemplateSelectOpen(false)} className="text-text-muted hover:text-text-primary uppercase text-[8px] font-black tracking-widest">✕ Cancelar Operação</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={async () => {
                                            toast.loading('Sintetizando documento...', { id: 'doc-gen' });
                                            setIsTemplateSelectOpen(false);
                                            setIsGeneratingDoc(true);
                                            const res = await generateDocumentFromTemplateAction(template.id, displayEmployee.id);
                                            if (res.success) {
                                                toast.success('Documento gerado com sucesso!', { id: 'doc-gen' });
                                                // Reload data
                                                const empRes = await getEmployee(displayEmployee.id);
                                                if (empRes.success) setFullEmployee(empRes.data);
                                            } else {
                                                toast.error(res.error, { id: 'doc-gen' });
                                            }
                                            setIsGeneratingDoc(false);
                                        }}
                                        className="p-6 bg-surface border border-border rounded-2xl text-left hover:border-brand-orange/30 hover:bg-brand-orange/5 transition-all group relative"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-text-primary uppercase tracking-tighter mb-1 line-clamp-1 group-hover:text-brand-orange">{template.title}</p>
                                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest line-clamp-1">{template.category} • {template.variables.length} variáveis</p>
                                            </div>
                                            <Send className="h-4 w-4 text-brand-orange opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {displayEmployee.documents && displayEmployee.documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {displayEmployee.documents.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-6 bg-surface-secondary/40 border border-border rounded-[2rem] hover:border-brand-orange/30 transition-all group shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={`h-14 w-14 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner border relative ${doc.status === 'SIGNED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface text-brand-orange border-border'}`}>
                                            <FileText className="h-6 w-6" />
                                            {doc.status !== 'SIGNED' && (
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-brand-orange rounded-full border-2 border-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-text-primary uppercase tracking-tight truncate max-w-[150px] group-hover:text-brand-orange transition-colors">{doc.fileName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">{doc.type}</p>
                                                {doc.status === 'SIGNED' && (
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">Autenticado</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        {doc.status === 'PENDING' && (
                                            <button
                                                onClick={() => setSigningDocument(doc)}
                                                className="h-12 px-6 rounded-2xl bg-brand-orange text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Assinar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => window.open(doc.fileUrl, '_blank')}
                                            className="h-12 w-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95"
                                            title="Baixar Documento"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {doc.status === 'SIGNED' && (
                                        <div className="absolute top-2 right-14 opacity-5 pointer-events-none">
                                            <BadgeCheck className="h-20 w-20 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-surface-secondary rounded-3xl border border-border border-dashed">
                            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Nenhum documento anexado</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_timesheet',
            label: '⏰ Ponto',
            content: <EmployeeTimeSheetTab employeeId={displayEmployee.id} />
        },
        {
            id: 'details_medical',
            label: '🩺 Atestados',
            content: <MedicalLeaveTab employeeId={displayEmployee.id} />
        },
        {
            id: 'details_health',
            label: '🏥 Saúde (ASO)',
            content: (
                <div className="space-y-4 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Histórico de Exames Ocupacionais</h4>
                    </div>

                    {displayEmployee.healthRecords && displayEmployee.healthRecords.length > 0 ? (
                        <div className="overflow-x-auto rounded-3xl border border-border bg-surface/50 shadow-inner">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-text-primary/5">
                                        <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Tipo de Exame</th>
                                        <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Data Realização</th>
                                        <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Validade</th>
                                        <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Atributos</th>
                                        <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Doc.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayEmployee.healthRecords.map((record: any) => (
                                        <tr key={record.id} className="border-b border-border hover:bg-surface-secondary transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex flex-shrink-0 items-center justify-center text-lg shadow-inner ring-1 ring-teal-500/30">
                                                        {record.asoType === 'Admissional' ? '🆕' : record.asoType === 'MudancaFuncao' ? '🔄' : record.asoType === 'Demissional' ? '🚫' : '📅'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-1">{record.asoType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{formatSafeDate(record.lastAsoDate)}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest py-1 px-3 bg-teal-500/10 rounded-full border border-teal-500/20">{record.periodicity} MESES</span>
                                            </td>
                                            <td className="p-5 text-center max-w-[200px]">
                                                {record.observations ? (
                                                    <p className="text-[9px] text-text-muted font-medium truncate" title={record.observations}>{record.observations}</p>
                                                ) : <span className="text-text-muted/40">—</span>}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center">
                                                    {record.fileUrl ? (
                                                        <button
                                                            onClick={() => window.open(record.fileUrl, '_blank')}
                                                            className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-lg border border-teal-500/20 scale-95 hover:scale-105"
                                                            title="Visualizar Anexo"
                                                        >
                                                            📄
                                                        </button>
                                                    ) : (
                                                        <span className="text-text-muted/40 text-[9px] uppercase font-bold tracking-widest opacity-50">S/ ANEXO</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-surface-secondary rounded-[3rem] border border-border border-dashed">
                            <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                                <HeartPulse className="w-10 h-10" />
                            </div>
                            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">Nenhum registro de saúde localizado</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_access',
            label: '🔐 Acesso',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Segurança & Acesso ao Portal</h4>
                    </div>

                    <div className="bg-surface-secondary/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 relative overflow-hidden group shadow-inner">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-blue/10 transition-colors duration-700" />

                        <div className="flex flex-col items-center text-center space-y-6 relative">
                            <div className="w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <KeyRound className="h-10 w-10 text-brand-blue" />
                            </div>
                            <div>
                                <h5 className="text-lg font-black text-text-primary uppercase tracking-tighter mb-2">PIN de Operações do Colaborador</h5>
                                <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-sm mx-auto opacity-60">
                                    O colaborador autentica no totem usando seu CPF e o código PIN de 6 dígitos configurado.
                                </p>
                            </div>

                            <button
                                className="h-14 px-10 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-orange/20 border-b-4 border-black/20 flex items-center gap-3"
                                onClick={async () => {
                                    toast('⚠️ Redefinição de Acesso', {
                                        description: `Deseja realmente invalidar o PIN atual de ${displayEmployee.name} e gerar uma nova credencial temporária?`,
                                        action: {
                                            label: 'Resetar Agora',
                                            onClick: async () => {
                                                const res = await resetEmployeePinAction(displayEmployee.id);
                                                if (res.success && res.plainPin) {
                                                    toast.success(`PIN gerado com sucesso!`, {
                                                        description: `NOVA CREDENCIAL: ${res.plainPin}`,
                                                        duration: 0,
                                                        action: {
                                                            label: "Copiar PIN",
                                                            onClick: () => {
                                                                navigator.clipboard.writeText(res.plainPin!);
                                                                toast.success("Copiado!");
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    toast.error(res.error || "Falha técnica no reset.");
                                                }
                                            }
                                        }
                                    });
                                }}
                            >
                                <ShieldAlert className="h-5 w-5" />
                                Resetar Acesso & Gerar PIN
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-3xl italic">
                        <div className="flex gap-6">
                            <AlertCircle className="h-8 w-8 text-brand-blue shrink-0 opacity-40" />
                            <p className="text-brand-blue text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-80">
                                Por questões de segurança, após o reset manual, o colaborador terá acesso temporário e será notificado para realizar a troca imediata no console de auto-atendimento.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_termination',
            label: '📉 Rescisão',
            content: <TerminationSimulator employee={displayEmployee} />
        },
        {
            id: 'details_costs',
            label: '💎 Custo Real',
            content: <CostProvision employee={displayEmployee} />
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideHeader width="6xl">
            <div className="flex-1 flex flex-col relative min-h-[85vh]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/5 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none" />

                <div className="p-10 flex flex-col flex-1 relative z-10">
                    {/* Premium Header */}
                    <div className="flex items-center justify-between pb-8 border-b border-border">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent animate-pulse" />
                                <Sparkles className="h-8 w-8 text-brand-orange relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Dossiê de Colaborador</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Protocolo de Consulta RH-360</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-8 no-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-6">
                                <div className="relative">
                                    <Loader2 className="h-16 w-16 animate-spin text-brand-orange opacity-20" />
                                    <Loader2 className="h-16 w-16 animate-spin text-brand-orange absolute inset-0 [animation-delay:-0.5s]" />
                                </div>
                                <span className="text-[11px] text-brand-orange font-black uppercase tracking-[0.4em] animate-pulse italic">Sincronizando Metadados...</span>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {displayEmployee.status === 'PENDING_APPROVAL' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-brand-orange/10 border border-brand-orange/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(255,120,0,0.1)] relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="h-20 w-20 bg-brand-orange/20 rounded-[2rem] flex items-center justify-center text-brand-orange shadow-inner border border-brand-orange/20">
                                                <ShieldAlert className="h-10 w-10 animate-vertical-bounce" />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-lg font-black text-brand-orange uppercase tracking-tight italic">Protocolo de Auto-Cadastro</p>
                                                <p className="text-[11px] text-text-primary font-bold uppercase tracking-widest mt-2 opacity-80 max-w-md">Pendência de validação operacional. Verifique a veracidade das informações antes da ativação.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleApprove}
                                            className="h-16 px-12 rounded-[1.25rem] bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-orange/20 flex items-center gap-4 border-b-4 border-black/20"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            EFETIVAR ADMISSÃO 🚀
                                        </button>
                                    </motion.div>
                                )}

                                {displayEmployee.status === 'WAITING_ONBOARDING' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-brand-blue/10 border border-brand-blue/20 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 shadow-[0_20px_50px_rgba(59,130,246,0.1)] relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full">
                                            <div className="h-20 w-20 bg-brand-blue/20 rounded-[2rem] flex items-center justify-center text-brand-blue shadow-inner border border-brand-blue/20">
                                                <UserPlus className="h-10 w-10 animate-pulse" />
                                            </div>
                                            <div className="text-center md:text-left flex-1">
                                                <p className="text-lg font-black text-brand-blue uppercase tracking-tight italic">Protocolo de Vínculo Digital Ativo</p>
                                                <p className="text-[11px] text-text-primary font-bold uppercase tracking-widest mt-2 opacity-80">O colaborador ainda não preencheu seus dados. Transmita o link de acesso seguro abaixo.</p>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center gap-4 bg-surface/50 border border-border rounded-2xl p-6 relative z-10 group/link">
                                            <span className="text-xs text-text-primary font-mono truncate flex-1 block overflow-hidden font-black tracking-tight self-center">
                                                {typeof window !== 'undefined' ? `${window.location.origin}/onboarding/${displayEmployee.id}` : ''}
                                            </span>
                                            <button
                                                className="h-12 px-8 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                                onClick={() => {
                                                    const link = `${window.location.origin}/onboarding/${displayEmployee.id}`;
                                                    navigator.clipboard.writeText(link);
                                                    toast.success('Link de autocadastro copiado!');
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                                COPIAR LINK
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Profile Hero Section */}
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-10 pb-12 border-b border-border relative">
                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-brand-orange/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-40 h-40 md:w-48 md:h-48 bg-surface rounded-[3rem] flex items-center justify-center text-brand-orange text-5xl font-black border-2 border-border shadow-2xl overflow-hidden relative z-10">
                                            {displayEmployee.photoUrl ? (
                                                <img src={displayEmployee.photoUrl} alt={displayEmployee.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                                            ) : (
                                                <span>{displayEmployee.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 h-14 w-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white border-4 border-surface shadow-2xl z-20 group-hover:scale-110 transition-transform">
                                            <BadgeCheck className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                            <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] bg-brand-orange/10 px-4 py-1.5 rounded-full border border-brand-orange/20 italic">
                                                {displayEmployee.jobRole?.name || displayEmployee.jobTitle || 'Sem cargo'}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm ${displayEmployee.status === 'ACTIVE'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-surface-secondary text-text-secondary border-border'
                                                }`}>
                                                {displayEmployee.status === 'ACTIVE' ? 'STATUS: ATIVO' : 'STATUS: INATIVO'}
                                            </span>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black text-text-primary uppercase tracking-tighter leading-none italic">{displayEmployee.name}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-2 bg-surface-secondary px-4 py-2 rounded-xl border border-border group/id">
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest group-hover/id:text-brand-orange transition-colors">ID: {displayEmployee.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-brand-blue/5 px-4 py-2 rounded-xl border border-brand-blue/10">
                                                <MapPin className="h-3 w-3 text-brand-blue" />
                                                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{displayEmployee.contract?.store?.name || 'CENTRO DE CUSTO OMITIDO'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <Tabs tabs={tabs} defaultValue={defaultTab} />
                                </div>

                                {/* Digital Signature Interface Overlay */}
                                <AnimatePresence>
                                    {signingDocument && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                        >
                                            <motion.div
                                                initial={{ scale: 0.9, y: 20 }}
                                                animate={{ scale: 1, y: 0 }}
                                                exit={{ scale: 0.9, y: 20 }}
                                                className="bg-surface border border-border rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
                                            >
                                                <div className="p-8 border-b border-border flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                                                            <Pencil className="h-6 w-6 text-brand-orange" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black text-text-primary uppercase tracking-tight italic">Assinatura Eletrônica</h4>
                                                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{signingDocument.fileName}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSigningDocument(null)}
                                                        className="h-10 w-10 rounded-xl hover:bg-surface-secondary text-text-muted flex items-center justify-center transition-all"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="p-8">
                                                    <SignatureCapture
                                                        documentName={signingDocument.fileName}
                                                        onSign={async (img, metadata) => {
                                                            const res = await signDocument(signingDocument.id, img, metadata);
                                                            if (res.success) {
                                                                setSigningDocument(null);
                                                                if (onSuccess) onSuccess();
                                                                // Reload employee data
                                                                getEmployee(displayEmployee.id).then(empRes => {
                                                                    if (empRes.success) setFullEmployee(empRes.data);
                                                                });
                                                            } else {
                                                                toast.error(res.error || 'Erro na assinatura');
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Footer Actions */}
                    {!loading && (
                        <div className="pt-10 flex flex-wrap justify-center md:justify-between items-center gap-6 border-t border-border mt-auto">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                >
                                    <span className="text-lg group-hover:scale-125 transition-transform">🚚</span>
                                    Logística Interna
                                </button>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-text-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                >
                                    <span className="text-lg group-hover:scale-125 transition-transform">✏️</span>
                                    Atualizar Matrícula
                                </button>

                                {displayEmployee.status === 'ACTIVE' && (
                                    <button
                                        onClick={() => setIsVacationModalOpen(true)}
                                        className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                    >
                                        <span className="text-lg group-hover:scale-125 transition-transform">🌴</span>
                                        Gestão de Férias
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsTimeTrackingModalOpen(true)}
                                    className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-text-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                >
                                    <span className="text-lg group-hover:scale-125 transition-transform">⏰</span>
                                    Cartão de Ponto
                                </button>

                                {displayEmployee.status === 'ACTIVE' ? (
                                    <button
                                        onClick={() => setIsTerminationModalOpen(true)}
                                        className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                    >
                                        <span className="text-lg group-hover:scale-125 transition-transform">🚫</span>
                                        Desligamento
                                    </button>
                                ) : displayEmployee.status === 'PENDING_APPROVAL' ? (
                                    <button
                                        onClick={handleApprove}
                                        className="h-14 px-10 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20 hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/20"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Homologar Cadastro
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsRehireModalOpen(true)}
                                        className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 border-b-4 border-black/10 group"
                                    >
                                        <span className="text-lg group-hover:scale-125 transition-transform">♻️</span>
                                        Protocolo Recontratação
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="h-14 px-10 rounded-2xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all"
                            >
                                Fechar Dossiê
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <EmployeeTransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                employee={displayEmployee}
                onSuccess={() => {
                    setIsTransferModalOpen(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }}
            />

            <EmployeeEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={displayEmployee}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }}
            />

            <EmployeeTerminationModal
                isOpen={isTerminationModalOpen}
                onClose={() => setIsTerminationModalOpen(false)}
                employee={displayEmployee}
                onSuccess={() => {
                    setIsTerminationModalOpen(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }}
            />

            <EmployeeRehireModal
                isOpen={isRehireModalOpen}
                onClose={() => setIsRehireModalOpen(false)}
                employee={displayEmployee}
                onSuccess={() => {
                    setIsRehireModalOpen(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }}
            />

            {isVacationModalOpen && (
                <VacationModal
                    isOpen={isVacationModalOpen}
                    onClose={() => setIsVacationModalOpen(false)}
                    employeeId={displayEmployee.id}
                    employeeName={displayEmployee.name}
                />
            )}

            {isTimeTrackingModalOpen && (
                <EmployeeTimeTrackingModal
                    isOpen={isTimeTrackingModalOpen}
                    onClose={() => setIsTimeTrackingModalOpen(false)}
                    employee={displayEmployee}
                />
            )}
        </Modal>
    );
}
