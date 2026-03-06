'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Tabs } from '@/shared/components/ui/tabs';
import { useState, useEffect } from 'react';
import EmployeeTransferModal from './EmployeeTransferModal';
import { EmployeeEditModal } from './EmployeeEditModal';
import { getTransferHistory, getEmployee } from '../actions';
import { Loader2 } from 'lucide-react';
import { EmployeeTerminationModal } from './EmployeeTerminationModal';
import { EmployeeRehireModal } from './EmployeeRehireModal';
import { EmployeeTimeSheetTab } from '@/modules/time-tracking/components/EmployeeTimeSheetTab';
import { MedicalLeaveTab } from './MedicalLeaveTab';
import { resetEmployeePinAction } from '@/modules/core/actions/auth';
import { toast } from 'sonner';
import { ShieldAlert, KeyRound, Copy, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { approveSelfOnboarding } from '../actions/employees';

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
    const [history, setHistory] = useState<any[]>([]);
    const [fullEmployee, setFullEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        if (confirm(`Deseja aprovar o cadastro de ${displayEmployee.name}?`)) {
            const res = await approveSelfOnboarding(displayEmployee.id);
            if (res.success) {
                toast.success('Cadastro aprovado com sucesso!');
                onClose();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.message || 'Erro ao aprovar cadastro');
            }
        }
    };

    const tabs = [
        {
            id: 'details_personal',
            label: '👤 Pessoal',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Dados Pessoais & Contato</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-slate-300">
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">CPF</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.cpf}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">RG</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.rg || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Nascimento</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{formatDate(displayEmployee.dateOfBirth)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Gênero</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{translateGender(displayEmployee.gender)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Estado Civil</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.maritalStatus || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Email</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1 truncate max-w-full">{displayEmployee.email}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Telefone</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.phone || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Fixo</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.landline || '-'}</p>
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
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-6">Dados do Cônjuge</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Nome</p>
                                    <p className="text-sm font-bold text-white">{displayEmployee.spouse.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">CPF</p>
                                    <p className="text-sm font-bold text-white">{displayEmployee.spouse.cpf || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.legalGuardian && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-6">Responsável Legal</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Nome</p>
                                    <p className="text-sm font-bold text-white">{displayEmployee.legalGuardian.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Telefone / Relacionamento</p>
                                    <p className="text-sm font-bold text-white">{displayEmployee.legalGuardian.phone} / {displayEmployee.legalGuardian.relationship}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.dependents && displayEmployee.dependents.length > 0 ? (
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-6 text-center">Dependentes ({displayEmployee.dependents.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayEmployee.dependents.map((dep: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-brand-orange/20 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-orange transition-colors">{dep.name}</p>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{dep.relationship || 'Dependente'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <span>{dep.cpf || '-'}</span>
                                            <span>{formatDate(dep.birthDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (!displayEmployee.spouse && !displayEmployee.legalGuardian) && (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhum dado familiar cadastrado</p>
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
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Contato de Emergência</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-slate-300">
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Nome</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactName || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Telefone</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactPhone || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Parentesco</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.emergencyContactRelationship || '-'}</p>
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
                                <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Endereço Residencial</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-slate-300">
                                <div className="col-span-2 group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Logradouro</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.address.street}, {displayEmployee.address.number} {displayEmployee.address.complement && `- ${displayEmployee.address.complement}`}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Bairro</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.address.neighborhood}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Cidade/UF</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.address.city} - {displayEmployee.address.state}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">CEP</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.address.zipCode}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Endereço não cadastrado</p>
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
                                <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Dados Bancários</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-slate-300">
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Banco</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.bankData.bankName}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Tipo de Conta</p>
                                    <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.bankData.accountType}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Agência</p>
                                    <p className="text-sm font-bold text-white font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.agency}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Conta</p>
                                    <p className="text-sm font-bold text-white font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.accountNumber}</p>
                                </div>
                                <div className="col-span-2 group">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Chave PIX</p>
                                    <p className="text-sm font-bold text-white font-mono transition-all group-hover:translate-x-1">{displayEmployee.bankData.pixKey || '-'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Dados bancários não cadastrados</p>
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
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Informações do Contrato</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-slate-300">
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Cargo</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.jobRole?.name || displayEmployee.jobTitle || '-'}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Setor</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{displayEmployee.contract?.sectorDef?.name || displayEmployee.department}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-brand-orange/60 transition-colors">Admissão</p>
                            <p className="text-sm font-bold text-white transition-all group-hover:translate-x-1">{formatDate(displayEmployee.hireDate)}</p>
                        </div>
                        <div className="group">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 group-hover:text-brand-orange/60 transition-colors">Status</p>
                            <span className={`px-3 py-1 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full border transition-all group-hover:scale-105 
                              ${displayEmployee.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
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
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Histórico de Transferências</h4>
                    </div>
                    {history.length > 0 ? (
                        <div className="relative border-l border-white/5 ml-4 flex flex-col gap-10">
                            {history.map((item: any, index: number) => (
                                <div key={item.id} className="relative pl-10 group">
                                    <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[#0A0F1C] border-2 border-brand-orange group-hover:scale-125 group-hover:shadow-[0_0_10px_rgba(255,102,0,0.5)] transition-all duration-300"></div>
                                    <time className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">{formatDate(item.date)}</time>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all shadow-xl">
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                                            Transferido para <span className="text-brand-orange">{item.newStore}</span>
                                        </h3>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-4">
                                            Anterior: <span className="text-slate-300">{item.previousStore}</span>
                                        </div>
                                        <div className="bg-[#0A0F1C]/40 border border-white/5 p-4 rounded-xl relative">
                                            <span className="absolute -top-3 left-4 px-2 bg-[#0A0F1C] text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Motivo</span>
                                            <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{item.reason}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhum registro encontrado</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_documents',
            label: '📁 Documentos',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Gestão de Documentos</h4>
                    </div>
                    {displayEmployee.documents && displayEmployee.documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayEmployee.documents.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-orange/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#0A0F1C] text-brand-orange rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/5">
                                            📄
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[150px]">{doc.fileName}</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{doc.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-md"
                                    >
                                        ⬇️
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhum documento anexado</p>
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
            id: 'details_access',
            label: '🔐 Acesso',
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Segurança & Acesso ao Portal</h4>
                    </div>

                    <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

                        <div className="flex flex-col items-center text-center space-y-6 relative">
                            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <KeyRound className="h-10 w-10 text-indigo-400" />
                            </div>
                            <div>
                                <h5 className="text-lg font-black text-white uppercase tracking-tighter mb-2">PIN de Colaborador</h5>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                                    O colaborador acessa o portal usando o CPF e um PIN de 6 dígitos.
                                    Aqui você pode resetar o acesso em caso de perda ou bloqueio.
                                </p>
                            </div>

                            <button
                                className="h-12 px-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
                                onClick={async () => {
                                    if (confirm(`Deseja realmente resetar o PIN de ${displayEmployee.name}? O PIN atual deixará de funcionar imediatamente.`)) {
                                        const res = await resetEmployeePinAction(displayEmployee.id);
                                        if (res.success && res.plainPin) {
                                            toast.success(`PIN resetado com sucesso!`, {
                                                description: `O NOVO PIN É: ${res.plainPin}`,
                                                duration: 0,
                                                action: {
                                                    label: "Copiar PIN",
                                                    onClick: () => {
                                                        navigator.clipboard.writeText(res.plainPin!);
                                                        toast.success("PIN copiado!");
                                                    }
                                                }
                                            });
                                        } else {
                                            toast.error(res.error || "Erro ao resetar o PIN.");
                                        }
                                    }
                                }}
                            >
                                <ShieldAlert className="h-4 w-4" />
                                Resetar & Gerar Novo PIN
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs">ℹ️</div>
                            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                Após o reset, o colaborador será obrigado a trocar este PIN temporário no próximo login.
                                Comunique o novo número de forma segura e privada.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Funcionário" width="5xl">
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <>
                        {displayEmployee.status === 'PENDING_APPROVAL' && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-800 dark:text-orange-400">Aguardando Aprovação de Cadastro</h4>
                                        <p className="text-xs text-orange-700 dark:text-orange-500">Este colaborador preencheu os dados via link. Revise antes de aprovar.</p>
                                    </div>
                                </div>
                                <Button onClick={handleApprove} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg shadow-orange-200 dark:shadow-none font-bold">
                                    <CheckCircle className="h-4 w-4" />
                                    Aprovar Agora
                                </Button>
                            </div>
                        )}
                        {/* Header Profile - Premium */}
                        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5 relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-orange/10 blur-[50px] rounded-full pointer-events-none" />
                            <div className="w-24 h-24 bg-[#0A0F1C] rounded-[2rem] flex items-center justify-center text-brand-orange text-3xl font-black border border-white/10 shadow-2xl overflow-hidden flex-shrink-0 relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {displayEmployee.photoUrl ? (
                                    <img src={displayEmployee.photoUrl} alt={displayEmployee.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                ) : (
                                    <span>{displayEmployee.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">
                                        {displayEmployee.jobRole?.name || displayEmployee.jobTitle || 'Sem cargo'}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${displayEmployee.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-white/5 text-slate-500 border-white/10'
                                        }`}>
                                        {displayEmployee.status === 'ACTIVE' ? 'Status Ativo' : 'Status Inativo'}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">{displayEmployee.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                    <span className="text-brand-orange/60">ID #{displayEmployee.id.slice(-6).toUpperCase()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                    <span>{displayEmployee.contract?.store?.name || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="py-2">
                            <Tabs tabs={tabs} defaultValue={defaultTab} />
                        </div>
                    </>
                )}

                <div className="pt-8 flex flex-wrap justify-center gap-3 border-t border-white/5">
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                    >
                        🚚 Transferir
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                    >
                        ✏️ Editar
                    </button>

                    {displayEmployee.status === 'ACTIVE' ? (
                        <button
                            onClick={() => setIsTerminationModalOpen(true)}
                            className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                        >
                            🚫 Desligar
                        </button>
                    ) : displayEmployee.status === 'PENDING_APPROVAL' ? (
                        <button
                            onClick={handleApprove}
                            className="h-10 px-8 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Aprovar Cadastro
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsRehireModalOpen(true)}
                            className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                        >
                            ♻️ Recontratar
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="h-10 px-8 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all shadow-lg"
                    >
                        Fechar
                    </button>
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
        </Modal >
    );
}
