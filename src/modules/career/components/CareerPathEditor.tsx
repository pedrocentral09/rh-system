'use client';

import { useState } from 'react';
import {
    createCareerPath,
    addCareerLevel,
    addCareerRequirement,
    deleteCareerPath,
    deleteCareerLevel,
    deleteCareerRequirement,
    updateCareerLevel,
} from '@/modules/career/actions/career-paths';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

interface JobRole {
    id: string;
    name: string;
}

interface Requirement {
    id: string;
    type: string;
    description: string;
    value: string | null;
}

interface Level {
    id: string;
    order: number;
    minMonths: number;
    minScore: number | null;
    jobRole: JobRole;
    requirements: Requirement[];
}

interface CareerPath {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    levels: Level[];
}

interface Props {
    initialPaths: CareerPath[];
    jobRoles: JobRole[];
}

const REQ_TYPES = [
    { value: 'TIME', label: '⏱️ Tempo de Casa' },
    { value: 'TRAINING', label: '📚 Treinamento' },
    { value: 'EVALUATION', label: '📊 Avaliação' },
    { value: 'CERTIFICATION', label: '📜 Certificação' },
    { value: 'OTHER', label: '📌 Outro' },
];

export function CareerPathEditor({ initialPaths, jobRoles }: Props) {
    const [paths, setPaths] = useState<CareerPath[]>(initialPaths);
    const [newPathName, setNewPathName] = useState('');
    const [expandedPath, setExpandedPath] = useState<string | null>(null);
    const [addingLevel, setAddingLevel] = useState<string | null>(null);
    const [selectedJobRole, setSelectedJobRole] = useState('');
    const [minMonths, setMinMonths] = useState('0');
    const [addingReq, setAddingReq] = useState<string | null>(null);
    const [reqType, setReqType] = useState('TIME');
    const [reqDesc, setReqDesc] = useState('');
    const [reqValue, setReqValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreatePath = async () => {
        if (!newPathName.trim()) return;
        setLoading(true);
        try {
            console.log("Chamando createCareerPath enviando:", newPathName.trim());
            const result = await createCareerPath({ name: newPathName.trim() });
            console.log("Resultado createCareerPath:", result);
            if (result.success && result.data) {
                setPaths([...paths, { ...result.data, levels: [], description: null, isActive: true }]);
                setNewPathName('');
                toast.success('Trilha criada!');
            } else {
                toast.error(result.error || 'Erro ao criar trilha');
            }
        } catch (error: any) {
            console.error("Erro fatal ao criar trilha:", error);
            toast.error('Falha de conexão ou erro no servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePath = async (id: string) => {
        if (!confirm('Excluir esta trilha e todos os seus níveis?')) return;
        const result = await deleteCareerPath(id);
        if (result.success) {
            setPaths(paths.filter(p => p.id !== id));
            toast.success('Trilha excluída');
        }
    };

    const handleAddLevel = async (pathId: string) => {
        if (!selectedJobRole) return;
        setLoading(true);
        const path = paths.find(p => p.id === pathId);
        const nextOrder = (path?.levels.length || 0) + 1;

        try {
            const result = await addCareerLevel({
                careerPathId: pathId,
                jobRoleId: selectedJobRole,
                order: nextOrder,
                minMonths: parseInt(minMonths) || 0,
            });

            if (result.success) {
                window.location.reload();
            } else {
                toast.error(result.error || 'Erro ao adicionar nível');
            }
        } catch (error) {
            console.error("Erro fatal ao adicionar nivel:", error);
            toast.error('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLevel = async (levelId: string, pathId: string) => {
        const result = await deleteCareerLevel(levelId);
        if (result.success) {
            setPaths(paths.map(p =>
                p.id === pathId
                    ? { ...p, levels: p.levels.filter(l => l.id !== levelId) }
                    : p
            ));
            toast.success('Nível removido');
        }
    };

    const handleAddRequirement = async (levelId: string) => {
        if (!reqDesc.trim()) return;
        setLoading(true);
        try {
            const result = await addCareerRequirement({
                careerLevelId: levelId,
                type: reqType,
                description: reqDesc.trim(),
                value: reqValue || undefined,
            });

            if (result.success) {
                window.location.reload();
            } else {
                toast.error(result.error || 'Erro ao adicionar requisito');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequirement = async (reqId: string) => {
        const result = await deleteCareerRequirement(reqId);
        if (result.success) {
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Path */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>➕</span> Nova Trilha de Carreira
                </h3>
                <div className="flex gap-3">
                    <Input
                        value={newPathName}
                        onChange={(e) => setNewPathName(e.target.value)}
                        placeholder="Ex: Operações de Loja, Administrativo, Logística..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePath()}
                    />
                    <Button onClick={handleCreatePath} disabled={loading || !newPathName.trim()}>
                        Criar Trilha
                    </Button>
                </div>
            </div>

            {/* List Paths */}
            {paths.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <span className="text-4xl block mb-3">🌳</span>
                    <p className="font-medium">Nenhuma trilha de carreira criada ainda.</p>
                    <p className="text-sm">Crie a primeira trilha acima para começar.</p>
                </div>
            )}

            {paths.map((path) => (
                <div
                    key={path.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
                >
                    {/* Path Header */}
                    <div
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{expandedPath === path.id ? '📂' : '📁'}</span>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{path.name}</h3>
                                <p className="text-sm text-slate-500">{path.levels.length} nível(is) configurado(s)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${path.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {path.isActive ? 'Ativa' : 'Inativa'}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePath(path.id); }}
                                className="text-red-400 hover:text-red-600 px-2 py-1 text-sm"
                                title="Excluir trilha"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedPath === path.id && (
                        <div className="border-t border-slate-200 dark:border-slate-700 p-5 bg-slate-50 dark:bg-slate-900/50">
                            {/* Career tree visualization */}
                            <div className="space-y-0">
                                {path.levels.map((level, idx) => (
                                    <div key={level.id} className="relative">
                                        {/* Connector Line */}
                                        {idx > 0 && (
                                            <div className="flex justify-center -mt-1 mb-0">
                                                <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-orange-400"></div>
                                            </div>
                                        )}
                                        {idx > 0 && (
                                            <div className="flex justify-center -mt-1 mb-1">
                                                <span className="text-orange-400 text-sm">▼</span>
                                            </div>
                                        )}

                                        {/* Level Card */}
                                        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-[#0B1E3F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow">
                                                        {level.order}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{level.jobRole.name}</h4>
                                                        <p className="text-xs text-slate-500">
                                                            {level.minMonths > 0 ? `Mínimo ${level.minMonths} meses` : 'Nível inicial'}
                                                            {level.minScore ? ` • Nota ≥ ${level.minScore}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteLevel(level.id, path.id)}
                                                    className="text-red-400 hover:text-red-600 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* Requirements */}
                                            {level.requirements.length > 0 && (
                                                <div className="mt-3 pl-11 space-y-1">
                                                    {level.requirements.map((req) => (
                                                        <div key={req.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 rounded px-3 py-1.5 group">
                                                            <span className="text-slate-600 dark:text-slate-400">
                                                                {REQ_TYPES.find(t => t.value === req.type)?.label || '📌'} {req.description}
                                                                {req.value && <span className="text-blue-500 ml-1 font-medium">({req.value})</span>}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteRequirement(req.id)}
                                                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Requirement */}
                                            {addingReq === level.id ? (
                                                <div className="mt-3 pl-11 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={reqType}
                                                            onChange={(e) => setReqType(e.target.value)}
                                                            className="text-xs border rounded px-2 py-1.5 dark:bg-slate-800 dark:border-slate-600"
                                                        >
                                                            {REQ_TYPES.map(t => (
                                                                <option key={t.value} value={t.value}>{t.label}</option>
                                                            ))}
                                                        </select>
                                                        <Input
                                                            value={reqDesc}
                                                            onChange={(e) => setReqDesc(e.target.value)}
                                                            placeholder="Descrição do requisito..."
                                                            className="text-xs flex-1 h-8"
                                                        />
                                                        <Input
                                                            value={reqValue}
                                                            onChange={(e) => setReqValue(e.target.value)}
                                                            placeholder="Valor"
                                                            className="text-xs w-20 h-8"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleAddRequirement(level.id)} disabled={loading}>
                                                            Salvar
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => { setAddingReq(null); setReqDesc(''); setReqValue(''); }}>
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setAddingReq(level.id); setReqDesc(''); setReqValue(''); }}
                                                    className="mt-2 pl-11 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                                >
                                                    + Adicionar requisito
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Level */}
                            {addingLevel === path.id ? (
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Adicionar Nível #{path.levels.length + 1}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Cargo</label>
                                            <select
                                                value={selectedJobRole}
                                                onChange={(e) => setSelectedJobRole(e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600"
                                            >
                                                <option value="">Selecione um cargo...</option>
                                                {jobRoles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Tempo mínimo (meses)</label>
                                            <Input
                                                type="number"
                                                value={minMonths}
                                                onChange={(e) => setMinMonths(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleAddLevel(path.id)} disabled={loading || !selectedJobRole}>
                                            Adicionar Nível
                                        </Button>
                                        <Button variant="outline" onClick={() => { setAddingLevel(null); setSelectedJobRole(''); setMinMonths('0'); }}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setAddingLevel(path.id); setSelectedJobRole(''); setMinMonths('0'); }}
                                    className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                >
                                    + Adicionar próximo nível
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
