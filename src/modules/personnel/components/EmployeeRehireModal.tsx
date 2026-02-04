'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { rehireEmployee } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';


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
        <Modal isOpen={isOpen} onClose={onClose} title={`Recontratação: ${employee.name}`} width="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
                    ℹ️ Esta ação iniciará um novo ciclo contratual. O histórico anterior será preservado.
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Novo Cargo</label>
                        <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Departamento</label>
                        <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Loja</label>
                        <Input value={store} onChange={(e) => setStore(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salário Base (R$)</label>
                        <Input type="number" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Data de Admissão</label>
                        <Input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa Registro</label>
                        <Input value={registrationCompany} onChange={(e) => setRegistrationCompany(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Contrato</label>
                        <select
                            className="w-full flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            value={contractType} onChange={(e) => setContractType(e.target.value)}
                        >
                            <option value="CLT">CLT</option>
                            <option value="PJ">PJ</option>
                            <option value="ESTAGIO">Estágio</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : '✨'} Recontratar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
