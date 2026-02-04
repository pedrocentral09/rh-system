'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Tabs } from '@/shared/components/ui/tabs';
import { useState, useEffect } from 'react';
import { EmployeeTransferModal } from './EmployeeTransferModal';
import { EmployeeEditModal } from './EmployeeEditModal';
import { getTransferHistory } from '../actions';
import { EmployeeTerminationModal } from './EmployeeTerminationModal';
import { EmployeeRehireModal } from './EmployeeRehireModal';
import { EmployeeTimeSheetTab } from '@/modules/time-tracking/components/EmployeeTimeSheetTab';

interface EmployeeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export function EmployeeDetailsModal({ isOpen, onClose, employee }: EmployeeDetailsModalProps) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
    const [isRehireModalOpen, setIsRehireModalOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && employee?.id) {
            getTransferHistory(employee.id).then(res => {
                if (res.success) setHistory(res.data || []);
            });
        }
    }, [isOpen, employee]);

    if (!employee) return null;

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const translateGender = (gender: string) => {
        const map: Record<string, string> = { 'MALE': 'Masculino', 'FEMALE': 'Feminino', 'OTHER': 'Outro' };
        return map[gender] || gender;
    };

    const tabs = [
        {
            id: 'details_personal',
            label: '👤 Pessoal',
            content: (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Dados Pessoais & Contato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">CPF</p>
                            <p className="text-sm font-medium">{employee.cpf}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">RG</p>
                            <p className="text-sm font-medium">{employee.rg || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Nascimento</p>
                            <p className="text-sm font-medium">{formatDate(employee.dateOfBirth)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Gênero</p>
                            <p className="text-sm font-medium">{translateGender(employee.gender)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Estado Civil</p>
                            <p className="text-sm font-medium">{employee.maritalStatus || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="text-sm font-medium">{employee.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Telefone</p>
                            <p className="text-sm font-medium">{employee.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Fixo</p>
                            <p className="text-sm font-medium">{employee.landline || '-'}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'details_emergency',
            label: '🚑 Emergência',
            content: (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Contato de Emergência</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500">Nome</p>
                            <p className="text-sm font-medium">{employee.emergencyContactName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Telefone</p>
                            <p className="text-sm font-medium">{employee.emergencyContactPhone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Parentesco</p>
                            <p className="text-sm font-medium">{employee.emergencyContactRelationship || '-'}</p>
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
                    {employee.address ? (
                        <>
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Endereço Residencial</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500">Logradouro</p>
                                    <p className="text-sm font-medium">{employee.address.street}, {employee.address.number} {employee.address.complement && `- ${employee.address.complement}`}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Bairro</p>
                                    <p className="text-sm font-medium">{employee.address.neighborhood}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Cidade/UF</p>
                                    <p className="text-sm font-medium">{employee.address.city} - {employee.address.state}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">CEP</p>
                                    <p className="text-sm font-medium">{employee.address.zipCode}</p>
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
                    {employee.bankData ? (
                        <>
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Dados Bancários</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                                <div>
                                    <p className="text-xs text-slate-500">Banco</p>
                                    <p className="text-sm font-medium">{employee.bankData.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Tipo de Conta</p>
                                    <p className="text-sm font-medium">{employee.bankData.accountType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Agência</p>
                                    <p className="text-sm font-medium">{employee.bankData.agency}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Conta</p>
                                    <p className="text-sm font-medium">{employee.bankData.accountNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500">Chave PIX</p>
                                    <p className="text-sm font-medium">{employee.bankData.pixKey || '-'}</p>
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
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Informações do Contrato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="text-xs text-slate-500">Cargo</p>
                            <p className="text-sm font-medium">{employee.jobTitle}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Departamento</p>
                            <p className="text-sm font-medium">{employee.department}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Admissão</p>
                            <p className="text-sm font-medium">{formatDate(employee.hireDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                            <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full 
                              ${employee.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'}`}>
                                {employee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
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
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Histórico de Transferências</h4>
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
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">Documentos Digitalizados</h4>
                    {employee.documents && employee.documents.length > 0 ? (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                            {employee.documents.map((doc: any) => (
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
            content: <EmployeeTimeSheetTab employeeId={employee.id} />
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Funcionário" width="2xl">
            <div className="space-y-6">

                {/* Header Profile - Compact */}
                <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-lg font-bold border border-indigo-200 dark:border-indigo-700 overflow-hidden">
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{employee.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{employee.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{employee.jobTitle}</p>
                    </div>
                </div>

                <div className="min-h-[300px]">
                    <Tabs tabs={tabs} />
                </div>

                <div className="pt-4 flex justify-between border-t border-slate-200">
                    <div className="flex space-x-2">
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
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setIsRehireModalOpen(true)}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                                ♻️ Recontratar
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={onClose} className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">Fechar</Button>
                </div>
            </div>

            <EmployeeTransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                employee={employee}
                onSuccess={() => {
                    setIsTransferModalOpen(false);
                    onClose();
                    window.location.reload();
                }}
            />

            <EmployeeEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={employee}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    onClose();
                    window.location.reload();
                }}
            />

            <EmployeeTerminationModal
                isOpen={isTerminationModalOpen}
                onClose={() => setIsTerminationModalOpen(false)}
                employee={employee}
                onSuccess={() => {
                    setIsTerminationModalOpen(false);
                    onClose();
                    window.location.reload();
                }}
            />

            <EmployeeRehireModal
                isOpen={isRehireModalOpen}
                onClose={() => setIsRehireModalOpen(false)}
                employee={employee}
                onSuccess={() => {
                    setIsRehireModalOpen(false);
                    onClose();
                    window.location.reload();
                }}
            />
        </Modal >
    );
}
