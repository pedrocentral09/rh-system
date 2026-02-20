'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Plus, Search, User, Calendar as CalendarIcon, Activity, AlertCircle } from 'lucide-react';
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
        <Modal isOpen={isOpen} onClose={onClose} title="Incluir Afastamento Médico" width="3xl">
            <div className="p-1 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {!selectedEmployee ? (
                    <div className="space-y-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar colaborador por nome ou CPF..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {loadingEmployees ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
                            ) : filteredEmployees.length === 0 ? (
                                <p className="text-center py-8 text-slate-500 text-sm italic">Nenhum colaborador ativo encontrado.</p>
                            ) : (
                                filteredEmployees.map(emp => (
                                    <button
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
                                            {emp.photoUrl ? (
                                                <img src={emp.photoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                                                    {emp.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-medium">{emp.contract?.jobRole?.name || emp.jobTitle || 'Sem cargo'} • {emp.cpf}</p>
                                        </div>
                                        <Plus className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Selected Employee Info */}
                        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 overflow-hidden shadow-sm border border-indigo-200 dark:border-indigo-800">
                                    {selectedEmployee.photoUrl ? (
                                        <img src={selectedEmployee.photoUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                                            {selectedEmployee.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedEmployee.name}</p>
                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter">Colaborador Selecionado</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedEmployee(null)} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">
                                Alternar 🔄
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Tipo de Licença</Label>
                                <select
                                    name="type"
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="ATESTADO">Atestado Médico</option>
                                    <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                                    <option value="LICENCA_PATERNIDADE">Licença Paternidade</option>
                                    <option value="ACIDENTE_TRABALHO">Acidente de Trabalho</option>
                                    <option value="OUTROS">Outros Afastamentos</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Início</Label>
                                <Input
                                    type="date"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Término</Label>
                                <Input
                                    type="date"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Dias</Label>
                                <Input
                                    type="number"
                                    name="daysCount"
                                    placeholder="Ex: 5"
                                    required
                                    value={formData.daysCount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, daysCount: e.target.value }))}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Atendimento (Médico)</Label>
                                <Input
                                    name="doctorName"
                                    placeholder="Nome do Médico"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Código CID</Label>
                                <Input
                                    name="cid"
                                    placeholder="Ex: Z10"
                                    value={formData.cid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value.toUpperCase() }))}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Documento (PDF ou Imagem) *</Label>
                            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-950/20">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept="image/*,application/pdf"
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-1">
                                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {file ? file.name : "Clique para selecionar o documento"}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter italic">Suporta PDF, JPG e PNG</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Observações (Interno)</Label>
                            <Input
                                name="notes"
                                placeholder="Notas extras sobre este afastamento..."
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting} className="font-bold text-slate-500">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 shadow-lg shadow-indigo-500/20 uppercase tracking-tight">
                                {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Registrar Afastamento
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
