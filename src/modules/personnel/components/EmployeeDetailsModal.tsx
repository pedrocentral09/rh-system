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
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Dados Pessoais & Contato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">CPF</p>
                            <p className="text-sm font-medium">{displayEmployee.cpf}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">RG</p>
                            <p className="text-sm font-medium">{displayEmployee.rg || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Nascimento</p>
                            <p className="text-sm font-medium">{formatDate(displayEmployee.dateOfBirth)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Gênero</p>
                            <p className="text-sm font-medium">{translateGender(displayEmployee.gender)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Estado Civil</p>
                            <p className="text-sm font-medium">{displayEmployee.maritalStatus || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="text-sm font-medium">{displayEmployee.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Telefone</p>
                            <p className="text-sm font-medium">{displayEmployee.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Fixo</p>
                            <p className="text-sm font-medium">{displayEmployee.landline || '-'}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_family',
            label: '💍 Família',
            content: (
                <div className="space-y-6">
                    {displayEmployee.spouse && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Dados do Cônjuge</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Nome</p>
                                    <p className="text-sm font-medium">{displayEmployee.spouse.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">CPF</p>
                                    <p className="text-sm font-medium">{displayEmployee.spouse.cpf || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.legalGuardian && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Responsável Legal</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Nome</p>
                                    <p className="text-sm font-medium">{displayEmployee.legalGuardian.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Telefone / Relacionamento</p>
                                    <p className="text-sm font-medium">{displayEmployee.legalGuardian.phone} / {displayEmployee.legalGuardian.relationship}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayEmployee.dependents && displayEmployee.dependents.length > 0 ? (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Dependentes ({displayEmployee.dependents.length})</h4>
                            <div className="space-y-3">
                                {displayEmployee.dependents.map((dep: any, idx: number) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{dep.name}</p>
                                            <p className="text-xs text-slate-500 text-right">{dep.relationship || 'Dependente'}</p>
                                            <p className="text-xs text-slate-500">{dep.cpf || '-'}</p>
                                            <p className="text-xs text-slate-500 text-right">{formatDate(dep.birthDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (!displayEmployee.spouse && !displayEmployee.legalGuardian) && (
                        <p className="text-slate-500 italic text-center py-8">Nenhum dado familiar cadastrado.</p>
                    )}
                </div>
            )
        },
        {
            id: 'details_emergency',
            label: '🚑 Emergência',
            content: (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Contato de Emergência</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500">Nome</p>
                            <p className="text-sm font-medium">{displayEmployee.emergencyContactName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Telefone</p>
                            <p className="text-sm font-medium">{displayEmployee.emergencyContactPhone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Parentesco</p>
                            <p className="text-sm font-medium">{displayEmployee.emergencyContactRelationship || '-'}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_address',
            label: '📍 Endereço',
            content: (
                <div className="space-y-4">
                    {displayEmployee.address ? (
                        <>
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Endereço Residencial</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500">Logradouro</p>
                                    <p className="text-sm font-medium">{displayEmployee.address.street}, {displayEmployee.address.number} {displayEmployee.address.complement && `- ${displayEmployee.address.complement}`}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Bairro</p>
                                    <p className="text-sm font-medium">{displayEmployee.address.neighborhood}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Cidade/UF</p>
                                    <p className="text-sm font-medium">{displayEmployee.address.city} - {displayEmployee.address.state}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">CEP</p>
                                    <p className="text-sm font-medium">{displayEmployee.address.zipCode}</p>
                                </div>
                            </div>
                        </>
                    ) : <p className="text-slate-500 italic">Endereço não cadastrado.</p>}
                </div>
            )
        },
        {
            id: 'details_bank',
            label: '💰 Bancário',
            content: (
                <div className="space-y-4">
                    {displayEmployee.bankData ? (
                        <>
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Dados Bancários</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                                <div>
                                    <p className="text-xs text-slate-500">Banco</p>
                                    <p className="text-sm font-medium">{displayEmployee.bankData.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Tipo de Conta</p>
                                    <p className="text-sm font-medium">{displayEmployee.bankData.accountType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Agência</p>
                                    <p className="text-sm font-medium">{displayEmployee.bankData.agency}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Conta</p>
                                    <p className="text-sm font-medium">{displayEmployee.bankData.accountNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500">Chave PIX</p>
                                    <p className="text-sm font-medium">{displayEmployee.bankData.pixKey || '-'}</p>
                                </div>
                            </div>
                        </>
                    ) : <p className="text-slate-500 italic">Dados bancários não cadastrados.</p>}
                </div>
            )
        },
        {
            id: 'details_job',
            label: '💼 Contratual',
            content: (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Informações do Contrato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500">Cargo</p>
                            <p className="text-sm font-medium">{displayEmployee.jobRole?.name || displayEmployee.jobTitle || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Setor</p>
                            <p className="text-sm font-medium">{displayEmployee.contract?.sectorDef?.name || displayEmployee.department}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Admissão</p>
                            <p className="text-sm font-medium">{formatDate(displayEmployee.hireDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                            <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full 
                              ${displayEmployee.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'}`}>
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
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Histórico de Transferências</h4>
                    {history.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6 pb-2">
                            {history.map((item, index) => (
                                <div key={item.id} className="mb-8 ml-6">
                                    <span className="absolute -left-[9px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white">
                                        <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                                    </span>
                                    <time className="mb-1 text-sm font-normal leading-none text-slate-400">
                                        {formatDate(item.date)}
                                    </time>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                        Transferido para {item.newStore}
                                    </h3>
                                    <div className="mb-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                        Anterior: <span className="font-medium text-slate-700 dark:text-slate-300">{item.previousStore}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 italic">
                                        "{item.reason}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <p>Nenhum registro de transferência encontrado.</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details_documents',
            label: '📁 Documentos',
            content: (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Documentos Digitalizados</h4>
                    {displayEmployee.documents && displayEmployee.documents.length > 0 ? (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                            {displayEmployee.documents.map((doc: any) => (
                                <li key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded flex items-center justify-center">
                                            📄
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{doc.fileName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{doc.type}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400" onClick={() => window.open(doc.fileUrl, '_blank')}>
                                        ⬇️ Baixar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-300 dark:border-slate-700">
                            <p>Nenhum documento anexado.</p>
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
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 text-center">Segurança & Acesso ao Portal</h4>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
                                <KeyRound className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-800 dark:text-slate-200">Senha (PIN) do Colaborador</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                                    O colaborador acessa o portal usando o CPF e um PIN de 6 dígitos.
                                    Se ele esqueceu o PIN ou a conta foi bloqueada, você pode resetar aqui.
                                </p>
                            </div>

                            <div className="pt-4 w-full flex justify-center">
                                <Button
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 flex items-center gap-2"
                                    onClick={async () => {
                                        if (confirm(`Deseja realmente resetar o PIN de ${displayEmployee.name}? O PIN atual deixará de funcionar imediatamente.`)) {
                                            const res = await resetEmployeePinAction(displayEmployee.id);
                                            if (res.success && res.plainPin) {
                                                toast.success(`PIN resetado com sucesso!`, {
                                                    description: `O NOVO PIN É: ${res.plainPin}`,
                                                    duration: 0, // Stay open
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
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                        <p className="text-blue-800 dark:text-blue-400 text-xs leading-relaxed">
                            <strong>Nota:</strong> Após o reset, o colaborador será obrigado a trocar este PIN temporário no próximo login.
                            Certifique-se de comunicar o novo número a ele de forma segura.
                        </p>
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
                        {/* Header Profile - Compact */}
                        <div className="flex flex-col items-center justify-center space-y-3 pb-8 border-b border-slate-200 dark:border-slate-700 text-center">
                            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-3xl font-bold border-2 border-indigo-200 dark:border-indigo-700 shadow-sm overflow-hidden">
                                {displayEmployee.photoUrl ? (
                                    <img src={displayEmployee.photoUrl} alt={displayEmployee.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{displayEmployee.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{displayEmployee.name}</h3>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                    {displayEmployee.jobRole?.name || displayEmployee.jobTitle || 'Sem cargo'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{displayEmployee.contract?.store?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="min-h-[300px]">
                            <Tabs tabs={tabs} defaultValue={defaultTab} />
                        </div>
                    </>
                )}

                <div className="pt-6 flex justify-center space-x-3 border-t border-slate-200 dark:border-slate-800">
                    <Button
                        variant="outline"
                        onClick={() => setIsTransferModalOpen(true)}
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                        🚚 Transferir
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        ✏️ Editar
                    </Button>

                    {employee.status === 'ACTIVE' ? (
                        <Button
                            variant="outline"
                            onClick={() => setIsTerminationModalOpen(true)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            🚫 Desligar
                        </Button>
                    ) : employee.status === 'PENDING_APPROVAL' ? (
                        <Button
                            onClick={handleApprove}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Aprovar Cadastro
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsRehireModalOpen(true)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                            ♻️ Recontratar
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">Fechar</Button>
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
