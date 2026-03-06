'use client';

import { useState, useEffect } from 'react';
import { createEvaluationCycle, generateReviewsForCycle, getEligibleParticipants } from '../actions/cycles';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Participant {
    id: string;
    name: string;
    department: string | null;
    status: 'DUE' | 'SCHEDULED' | 'PENDING';
    jobRole: { name: string } | null;
    contract?: {
        store?: { name: string } | null;
        sectorDef?: { name: string } | null;
    } | null;
}

export function CycleWizard({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Config
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('360');

    // Step 2: Participants
    const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');

    useEffect(() => {
        if (step === 2 && allParticipants.length === 0) {
            loadParticipants();
        }
    }, [step]);

    const loadParticipants = async () => {
        setLoading(true);
        const result = await getEligibleParticipants();
        if (result.success && result.data) {
            setAllParticipants(result.data as any);
            // Auto-select those who are DUE
            const dueIds = (result.data as Participant[]).filter(p => p.status === 'DUE').map(p => p.id);
            setSelectedIds(dueIds);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            // 1. Create Cycle
            const cycleResult = await createEvaluationCycle({
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                type
            });

            if (!cycleResult.success || !cycleResult.data) {
                throw new Error(cycleResult.error || 'Erro ao criar ciclo');
            }

            const cycleId = (cycleResult.data as any).id;

            // 2. Generate Reviews
            // For MVP: if 360, we might need more logic, but for now we follow TOP_DOWN logic if not specified.
            // Let's assume the user selects evaluators later or we auto-assign managers.
            // For now, let's just create a simplified review structure where evaluated = selected, evaluator = current user (admin).
            const participants = selectedIds.map(id => ({
                evaluatedId: id,
                evaluatorId: '' // This will be handled by the server action using the manager or current user if empty
            }));

            const reviewResult = await generateReviewsForCycle(cycleId, participants);

            if (reviewResult.success) {
                toast.success(`Ciclo criado com ${reviewResult.count} avaliações!`);
                onComplete();
            } else {
                toast.error('Ciclo criado, mas houve erro ao gerar avaliações.');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    const toggleParticipant = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredParticipants = allParticipants.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.department?.toLowerCase().includes(search.toLowerCase());
        const matchesStore = !storeFilter || p.contract?.store?.name === storeFilter;
        const matchesSector = !sectorFilter || p.contract?.sectorDef?.name === sectorFilter;

        return matchesSearch && matchesStore && matchesSector;
    });

    const stores = Array.from(new Set(allParticipants.map(p => p.contract?.store?.name).filter(Boolean))) as string[];
    const sectors = Array.from(new Set(allParticipants.map(p => p.contract?.sectorDef?.name).filter(Boolean))) as string[];

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredParticipants.map(p => p.id);
        const allFilteredSelected = filteredIds.every(id => selectedIds.includes(id));

        if (allFilteredSelected) {
            setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Novo Ciclo de Avaliação</h2>
                    <p className="text-xs text-slate-500">Passo {step} de 3</p>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-8 h-1.5 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                </div>
            </div>

            <div className="p-6">
                {/* Step 1: Configuration */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Nome do Ciclo</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Ciclo Trimestral - Março 2026"
                                    className="h-12 text-lg"
                                />
                                <p className="text-xs text-slate-400 mt-2">Dê um nome claro para identificar este período de avaliações.</p>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Data de Início</label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Data de Encerramento</label>
                                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Metodologia</label>
                                <select
                                    className="w-full h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl px-4"
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                >
                                    <option value="360">Avaliação 360º (Gestor, Pares e Auto)</option>
                                    <option value="TOP_DOWN">Top Down (Apenas Gestor avalia)</option>
                                    <option value="SELF">Autoavaliação (Apenas Colaborador)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Participants */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <div>
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-400">Seleção de Colaboradores</h3>
                                <p className="text-xs text-indigo-700 dark:text-indigo-500">Filtre e selecione quem participará deste ciclo.</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <span className="text-2xl font-black text-indigo-600">{selectedIds.length}</span>
                                    <p className="text-[10px] text-indigo-500 font-bold uppercase">Selecionados</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleSelectAllFiltered} className="h-8 text-[10px] font-bold uppercase">
                                    {filteredParticipants.every(p => selectedIds.includes(p.id)) ? 'Desmarcar Filtro' : 'Selecionar Filtro'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                                placeholder="Filtrar por nome..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-10"
                            />
                            <select
                                className="h-10 border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg px-3 text-xs"
                                value={storeFilter}
                                onChange={e => setStoreFilter(e.target.value)}
                            >
                                <option value="">Todas as Lojas</option>
                                {stores.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                className="h-10 border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg px-3 text-xs"
                                value={sectorFilter}
                                onChange={e => setSectorFilter(e.target.value)}
                            >
                                <option value="">Todos os Setores</option>
                                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="max-h-[250px] overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredParticipants.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">Nenhum colaborador encontrado com esses filtros.</div>
                            ) : filteredParticipants.map(p => (
                                <div
                                    key={p.id}
                                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${selectedIds.includes(p.id) ? 'bg-indigo-50/30' : ''}`}
                                    onClick={() => toggleParticipant(p.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border ${selectedIds.includes(p.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center text-white text-[10px]`}>
                                            {selectedIds.includes(p.id) && '✓'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                                            <div className="flex gap-2 items-center mt-0.5">
                                                <span className="text-[9px] text-slate-400 uppercase font-medium">{p.jobRole?.name || 'Geral'}</span>
                                                <span className="text-[9px] text-slate-300">•</span>
                                                <span className="text-[9px] text-indigo-500 font-bold uppercase">{p.contract?.store?.name || 'Matriz'}</span>
                                                <span className="text-[9px] text-slate-300">•</span>
                                                <span className="text-[9px] text-emerald-500 font-bold uppercase">{p.contract?.sectorDef?.name || p.department || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {p.status === 'DUE' && (
                                            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Prazo Vencido</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Summary */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Tudo pronto para começar!</h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-500 max-w-md mx-auto mt-2">
                                Ao confirmar, o ciclo será criado e as avaliações serão enviadas para os gestores e pares responsáveis.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ciclo</label>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{name}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Metodologia</label>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{type}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Participantes</label>
                                <p className="text-2xl font-black text-indigo-600">{selectedIds.length}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Período</label>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                    {startDate ? format(new Date(startDate), 'dd/MM/yyyy') : '-'} até {endDate ? format(new Date(endDate), 'dd/MM/yyyy') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>Voltar</Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={(step === 1 && !name) || (step === 2 && selectedIds.length === 0)}>Próximo</Button>
                    ) : (
                        <Button onClick={handleCreate} disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar Ciclo 🚀'}</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
