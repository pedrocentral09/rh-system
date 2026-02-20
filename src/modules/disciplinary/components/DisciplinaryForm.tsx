'use client';

import { useRef, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { createDisciplinaryRecord, updateDisciplinaryRecord } from '../actions/records';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Upload, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/components/ui/command';
import { cn } from '@/lib/utils';

interface DisciplinaryFormProps {
    employees: any[];
    initialData?: any;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DisciplinaryForm({ employees, initialData, isOpen: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: DisciplinaryFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    const isEditing = !!initialData;
    const [openCombobox, setOpenCombobox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState(initialData?.type || 'VERBAL_WARNING');
    const [file, setFile] = useState<File | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialData?.employeeId || '');

    // State for pre-filled data from URL
    const [prefilledReason, setPrefilledReason] = useState(initialData?.reason || '');
    const [prefilledDesc, setPrefilledDesc] = useState(initialData?.description || '');
    const [prefilledDate, setPrefilledDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'create' && !isEditing) {
            const empId = searchParams.get('empId');
            const date = searchParams.get('date');
            const reason = searchParams.get('reason');
            const desc = searchParams.get('desc');

            if (empId) setSelectedEmployeeId(empId);
            if (date) setPrefilledDate(date);
            if (reason) setPrefilledReason(reason);
            if (desc) setPrefilledDesc(desc);

            setOpen(true);

            // Clean URL after capturing params to avoid re-opening on manual refresh if not intended
            // router.replace('/dashboard/disciplinary'); 
        }
    }, [searchParams, isEditing]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedEmployeeId) {
            toast.error('Selecione um colaborador.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            let documentsJson = '[]';

            if (file) {
                const storageRef = ref(storage, `disciplinary/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);

                documentsJson = JSON.stringify([{
                    name: file.name,
                    type: file.type,
                    url: url
                }]);
            }

            const data = {
                employeeId: selectedEmployeeId,
                type: formData.get('type') as string,
                severity: formData.get('severity') as string,
                date: new Date(formData.get('date') as string),
                reason: formData.get('reason') as string,
                description: formData.get('description') as string,
                daysSuspended: formData.get('daysSuspended') ? parseInt(formData.get('daysSuspended') as string) : 0,
                documents: documentsJson !== '[]' ? documentsJson : (isEditing ? initialData.documents : '[]')
            };

            const res = isEditing
                ? await updateDisciplinaryRecord(initialData.id, data)
                : await createDisciplinaryRecord(data);

            if (res.success) {
                toast.success(isEditing ? 'Ocorrência atualizada com sucesso.' : 'Ocorrência registrada com sucesso.');
                setOpen(false);
                if (!isEditing) {
                    setFile(null);
                    setSelectedEmployeeId('');
                    setType('VERBAL_WARNING');
                    setPrefilledReason('');
                    setPrefilledDesc('');
                }
                onSuccess?.();
            } else {
                toast.error(res.error || 'Erro ao processar solicitação.');
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error('Erro ao fazer upload do arquivo.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEditing && (
                <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                        + Nova Ocorrência
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Ocorrência Disciplinar' : 'Registrar Ocorrência Disciplinar'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Colaborador</Label>
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                                    >
                                        {selectedEmployeeId
                                            ? employees.find((employee) => employee.id === selectedEmployeeId)?.name
                                            : "Selecione..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 z-[200] shadow-xl">
                                    <Command className="bg-white dark:bg-slate-900">
                                        <CommandInput placeholder="Buscar colaborador..." className="bg-transparent" />
                                        <CommandList>
                                            <CommandEmpty className="py-2 text-center text-sm text-slate-500 dark:text-slate-400">Nenhum colaborador encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {employees.map((employee) => (
                                                    <CommandItem
                                                        key={employee.id}
                                                        value={employee.name}
                                                        onSelect={() => {
                                                            setSelectedEmployeeId(employee.id);
                                                            setOpenCombobox(false);
                                                        }}
                                                        className="aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 text-slate-900 dark:text-slate-100"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {employee.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="employeeId" value={selectedEmployeeId} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data do Ocorrido</Label>
                            <Input
                                name="date"
                                type="date"
                                required
                                value={prefilledDate}
                                onChange={(e) => setPrefilledDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-700 dark:text-slate-300">Tipo de Ocorrência</Label>
                            <select
                                name="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                <option value="FEEDBACK">Feedback Orientativo</option>
                                <option value="VERBAL_WARNING">Advertência Verbal</option>
                                <option value="WRITTEN_WARNING">Advertência Escrita</option>
                                <option value="SUSPENSION">Suspensão</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="severity" className="text-slate-700 dark:text-slate-300">Gravidade</Label>
                            <select
                                name="severity"
                                className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                required
                            >
                                <option value="LOW">Leve</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Grave</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                    </div>

                    {type === 'SUSPENSION' && (
                        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-100 dark:border-red-900 space-y-2">
                            <Label htmlFor="daysSuspended" className="text-red-700 dark:text-red-400">Dias de Suspensão (Desconto em Folha)</Label>
                            <Input name="daysSuspended" type="number" min="1" max="30" className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-slate-900 dark:text-slate-100" required defaultValue={initialData?.daysSuspended} />
                            <p className="text-xs text-red-500 dark:text-red-400">O colaborador ficará afastado e os dias serão descontados automaticamente.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo Resumido</Label>
                        <Input
                            name="reason"
                            placeholder="Ex: Atraso recorrente, Insubordinação..."
                            required
                            value={prefilledReason}
                            onChange={(e) => setPrefilledReason(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição Detalhada dos Fatos</Label>
                        <textarea
                            name="description"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descreva o que aconteceu, horário, local e testemunhas se houver."
                            required
                            value={prefilledDesc}
                            onChange={(e) => setPrefilledDesc(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Evidências (Foto/Vídeo)</Label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/50">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*,video/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                                <Upload className="h-8 w-8 text-slate-400" />
                                <span className="text-sm text-slate-600 font-medium">
                                    {file ? file.name : 'Clique para adicionar foto ou vídeo'}
                                </span>
                                <span className="text-xs text-slate-400">Suporta JPG, PNG, MP4</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading} className={type === 'SUSPENSION' || type === 'WRITTEN_WARNING' ? 'bg-red-600 hover:bg-red-700' : ''}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (isEditing ? 'Salvar Alterações' : 'Confirmar Ocorrência')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
