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
                submittedById: 'system' // Should be current user ID in production
            };

            const res = await createMedicalLeave(data);
            if (res.success) {
                toast.success('Atestado registrado com sucesso.');
                setShowForm(false);
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
                loadLeaves();
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

    async function handleDelete(id: string) {
        if (!confirm('Deseja realmente excluir este registro?')) return;
        const res = await deleteMedicalLeave(id);
        if (res.success) {
            toast.success('Registro excluído.');
            loadLeaves();
        } else {
            toast.error(res.error);
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Gestão de Atestados e Licenças</h4>
                    <p className="text-xs text-slate-500">Registre e controle afastamentos médicos.</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" /> Novo Atestado
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Licença</Label>
                                <select
                                    name="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                                <Label>Início</Label>
                                <Input
                                    type="date"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Término</Label>
                                <Input
                                    type="date"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Dias de Afastamento</Label>
                                <Input
                                    type="number"
                                    name="daysCount"
                                    placeholder="Ex: 5"
                                    required
                                    value={formData.daysCount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, daysCount: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CRM do Médico</Label>
                                <Input
                                    name="crm"
                                    placeholder="Opcional"
                                    value={formData.crm}
                                    onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Código CID</Label>
                                <Input
                                    name="cid"
                                    placeholder="Opcional"
                                    value={formData.cid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Documento (PDF ou Imagem)</Label>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*,application/pdf" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Observações</Label>
                            <Input
                                name="notes"
                                placeholder="Detalhes adicionais..."
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                                {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Salvar Registro
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {leaves.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Nenhum atestado registrado para este colaborador.</p>
                    </div>
                ) : (
                    leaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${leave.type === 'ATESTADO' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{leave.type.replace('_', ' ')}</h5>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            leave.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {leave.status === 'APPROVED' ? 'Aprovado' : leave.status === 'PENDING' ? 'Pendente' : 'Recusado'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            {formatSafeDate(leave.startDate, 'dd/MM/yyyy')} - {formatSafeDate(leave.endDate, 'dd/MM/yyyy')}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 rounded">
                                            {leave.daysCount} dias
                                        </span>
                                        {leave.cid && (
                                            <span className="text-xs text-slate-400">CID: {leave.cid}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="outline" onClick={() => window.open(leave.documentUrl, '_blank')} className="h-8 w-8 p-0">
                                    <Download className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDelete(leave.id)} className="h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
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
