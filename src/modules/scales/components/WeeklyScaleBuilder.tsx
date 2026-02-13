'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subDays, isSameDay, differenceInMinutes, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

import { Card, CardContent } from '@/shared/components/ui/card';
import { getEmployeesForScale, getWeeklyScales, saveWorkScale, cloneWeeklyScale, generateAutomaticScale, saveWorkScalesBatch } from '../actions';

interface ShiftType {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface Employee {
    id: string;
    name: string;
    jobTitle: string;
    department: string;
    contract?: {
        store: { id: string; name: string };
    };
}

interface WorkScale {
    id: string;
    date: Date;
    employeeId: string;
    shiftTypeId: string | null;
}

export function WeeklyScaleBuilder({ shiftTypes }: { shiftTypes: ShiftType[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [scales, setScales] = useState<WorkScale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('ALL');
    const [selectedSector, setSelectedSector] = useState('ALL');

    // NEW Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, string>>>({});

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    // Extract unique Stores and Sectors
    const storesMap = new Map<string, string>();
    employees.forEach(e => {
        if (e.contract?.store) {
            storesMap.set(e.contract.store.id, e.contract.store.name);
        }
    });

    const stores = Array.from(storesMap.entries()).map(([id, name]) => ({ id, name }));
    const sectors = Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[];

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStore = selectedStore === 'ALL' || emp.contract?.store?.id === selectedStore;
        const matchesSector = selectedSector === 'ALL' || emp.department === selectedSector;
        return matchesSearch && matchesStore && matchesSector;
    });

    useEffect(() => {
        loadData();
    }, [weekStart]);

    async function loadData() {
        setLoading(true);
        const normalizedStart = new Date(format(weekStart, 'yyyy-MM-dd') + 'T00:00:00Z');
        const normalizedEnd = new Date(format(addDays(weekStart, 6), 'yyyy-MM-dd') + 'T00:00:00Z');

        const [empResult, scaleResult] = await Promise.all([
            getEmployeesForScale(),
            getWeeklyScales(normalizedStart, normalizedEnd)
        ]);

        if (empResult.success) setEmployees(empResult.data as any);
        if (scaleResult.success) setScales(scaleResult.data as any);
        setLoading(false);
    }

    function handlePrevWeek() {
        if (isEditing && Object.keys(pendingChanges).length > 0) {
            if (!confirm('Você tem alterações não salvas. Deseja descartar e mudar de semana?')) return;
        }
        setIsEditing(false);
        setPendingChanges({});
        setWeekStart(date => subDays(date, 7));
    }

    function handleNextWeek() {
        if (isEditing && Object.keys(pendingChanges).length > 0) {
            if (!confirm('Você tem alterações não salvas. Deseja descartar e mudar de semana?')) return;
        }
        setIsEditing(false);
        setPendingChanges({});
        setWeekStart(date => addDays(date, 7));
    }

    async function handleClone() {
        if (!confirm('Tem certeza que deseja copiar a escala da SEMANA ANTERIOR para a semana atual? Isso substituirá os registros existentes.')) return;

        setLoading(true);
        const normalizedStart = new Date(format(weekStart, 'yyyy-MM-dd') + 'T00:00:00Z');
        const result = await cloneWeeklyScale(normalizedStart);
        if (result.success) {
            toast.success('Escala clonada com sucesso!');
            await loadData(); // Reload data to show new values
        } else {
            toast.error(result.error || 'Erro ao clonar escala');
        }
        setLoading(false);
    }

    async function handleAutoGenerate() {
        if (!confirm('Deseja gerar uma escala automática padrão (5x2) para TODOS os funcionários nesta semana? Isso substituirá registros existentes.')) return;

        setLoading(true);
        const normalizedStart = new Date(format(weekStart, 'yyyy-MM-dd') + 'T00:00:00Z');
        const result = await generateAutomaticScale(normalizedStart);
        if (result.success) {
            toast.success('Escala automática gerada com sucesso!');
            await loadData();
        } else {
            toast.error(result.error || 'Erro ao gerar escala');
        }
        setLoading(false);
    }

    function getScaleForCell(employeeId: string, day: Date) {
        // Use YYYY-MM-DD format for internal keys and comparison
        const dayIso = format(day, 'yyyy-MM-dd');

        // Check pending changes first
        if (pendingChanges[employeeId]?.[dayIso] !== undefined) {
            const val = pendingChanges[employeeId][dayIso];
            return {
                id: 'pending',
                date: day,
                employeeId,
                shiftTypeId: val === 'FOLGA' || val === '' ? null : val,
                isPending: true
            };
        }

        const scale = scales.find(s => {
            if (!s.date) return false;
            // Ensure we compare using the same format
            const sDateIso = format(new Date(s.date), 'yyyy-MM-dd');
            return s.employeeId === employeeId && sDateIso === dayIso;
        });
        return scale;
    }

    function handleScaleChange(employeeId: string, day: Date, value: string) {
        const dayIso = format(day, 'yyyy-MM-dd');

        setPendingChanges(prev => ({
            ...prev,
            [employeeId]: {
                ...(prev[employeeId] || {}),
                [dayIso]: value
            }
        }));
    }

    async function saveChanges() {
        setLoading(true);
        const employeeIds = Object.keys(pendingChanges);
        let errorMessages: string[] = [];

        for (const empId of employeeIds) {
            const changes = Object.entries(pendingChanges[empId]).map(([dateIso, val]) => ({
                // Create a pure UTC date from the YYYY-MM-DD string
                date: new Date(`${dateIso}T00:00:00.000Z`),
                shiftTypeId: val
            }));

            const result = await saveWorkScalesBatch(empId, changes);
            if (!result.success) {
                errorMessages.push(result.error || `Erro ao salvar escalas do funcionário ${empId}`);
            }
        }

        if (errorMessages.length === 0) {
            toast.success('Todas as alterações foram salvas com sucesso!');
            setPendingChanges({});
            setIsEditing(false);
            await loadData();
        } else {
            toast.error(errorMessages[0]);
            console.error('Scale batch save errors:', errorMessages);
        }
        setLoading(false);
    }

    function calculateTotalHours(empId: string) {
        let totalMinutes = 0;

        weekDays.forEach(day => {
            const scale = getScaleForCell(empId, day);
            if (scale && scale.shiftTypeId) {
                const shift = shiftTypes.find(s => s.id === scale.shiftTypeId);
                if (shift) {
                    const start = parse(shift.startTime, 'HH:mm', new Date());
                    const end = parse(shift.endTime, 'HH:mm', new Date());
                    let diff = differenceInMinutes(end, start);
                    if (diff < 0) diff += 1440;
                    if (diff > 360) diff -= 60;
                    totalMinutes += diff;
                }
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { totalMinutes, label: `${hours}h${mins > 0 ? ` ${mins}m` : ''} ` };
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handlePrevWeek} disabled={loading} className="text-slate-600 border-slate-300 hover:bg-slate-50">◀ Anterior</Button>
                    {!isEditing && (
                        <>
                            <Button variant="outline" onClick={handleClone} disabled={loading} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" title="Copiar escala da semana passada">
                                📋 Copiar Anterior
                            </Button>
                            <Button variant="outline" onClick={handleAutoGenerate} disabled={loading} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Gerar escala padrão 5x2">
                                🤖 Escala Auto
                            </Button>
                            <Button variant="outline" onClick={() => window.print()} disabled={loading} className="text-slate-600 border-slate-300 hover:bg-slate-50" title="Imprimir escala">
                                🖨️ Imprimir
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-center">
                    <h3 className="text-slate-800 dark:text-white font-bold text-lg capitalize">
                        {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Semana de {format(weekStart, "dd/MM")} a {format(addDays(weekStart, 6), "dd/MM")}
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (confirm('Descartar todas as alterações?')) {
                                        setPendingChanges({});
                                        setIsEditing(false);
                                    }
                                }}
                                disabled={loading}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={saveChanges}
                                disabled={loading || Object.keys(pendingChanges).length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {loading ? 'Salvando...' : 'Gravar Alterações'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            disabled={loading}
                            className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900"
                        >
                            ✏️ Editar Escala
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleNextWeek} disabled={loading} className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">Próxima ▶</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Buscar</label>
                    <input
                        type="text"
                        placeholder="🔍 Nome do funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100"
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Loja</label>
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100"
                    >
                        <option value="ALL">Todas as Lojas</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Setor/Departamento</label>
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100"
                    >
                        <option value="ALL">Todos os Setores</option>
                        {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Matrix Table */}
            <div className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800 ${isEditing ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}`}>
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-slate-200 dark:border-slate-700">
                                Colaborador
                            </th>
                            {weekDays.map(day => (
                                <th key={day.toISOString()} className={`px-2 py-3 text-center min-w-[140px] border-b border-slate-200 dark:border-slate-700 ${isSameDay(day, new Date()) ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : ''}`}>
                                    <div className="font-bold text-slate-700 dark:text-slate-200">{format(day, "EEE", { locale: ptBR })}</div>
                                    <div className="text-xs opacity-70 text-slate-500 dark:text-slate-400">{format(day, "dd/MM")}</div>
                                </th>
                            ))}
                            <th className="px-2 py-3 text-center min-w-[80px] border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                {(() => {
                                    const shifts = weekDays.map(day => getScaleForCell(emp.id, day));
                                    const daysWorked = shifts.filter(s => s && s.shiftTypeId).length;
                                    const hasViols = daysWorked === 7;

                                    return (
                                        <td className={`px-4 py-3 font-medium text-slate-800 dark:text-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200 dark:border-slate-700 ${hasViols ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                            <div className="truncate w-48" title={emp.name}>{emp.name}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate text-[10px]">{emp.jobTitle}</div>
                                                {hasViols && (
                                                    <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] px-1 rounded font-bold border border-red-200 dark:border-red-800" title="Alerta: 7 dias de trabalho consecutivos nesta semana (Violação 6x1)">
                                                        ⚠ 7 Dias
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })()}
                                {
                                    weekDays.map(day => {
                                        const scale = getScaleForCell(emp.id, day) as any;
                                        const value = scale?.shiftTypeId || (scale ? 'FOLGA' : '');
                                        const isPending = scale?.isPending;

                                        return (
                                            <td key={day.toISOString()} className={`px-1 py-1 border-r border-slate-100 dark:border-slate-700 last:border-0 relative group ${isPending ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                                {!isEditing ? (
                                                    <div
                                                        className={`w-full h-8 px-2 flex items-center justify-center rounded text-[10px] font-bold transition-colors
                                                     ${value === 'FOLGA' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                                value ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-transparent text-slate-400 dark:text-slate-600'}
                                                 `}
                                                    >
                                                        {value === 'FOLGA' ? '🏖️ FOLGA' : shiftTypes.find(s => s.id === value)?.name || '-'}
                                                    </div>
                                                ) : (
                                                    <select
                                                        className={`w-full h-8 px-2 rounded border-0 text-[10px] font-bold cursor-pointer transition-colors appearance-none
                                                        ${value === 'FOLGA' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                                value ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                                        ${isPending ? 'ring-2 ring-indigo-400 ring-inset' : ''}
                                                    `}
                                                        value={value || ''}
                                                        onChange={(e) => handleScaleChange(emp.id, day, e.target.value)}
                                                    >
                                                        <option value="" className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">-</option>
                                                        <option value="FOLGA" className="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold">🏖️ FOLGA</option>
                                                        <optgroup label="Turnos" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                            {shiftTypes.map(s => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.name} ({s.startTime}-{s.endTime})
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                )}

                                                {isEditing && (
                                                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-slate-500 opacity-0 group-hover:opacity-50">
                                                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })
                                }
                                {
                                    (() => {
                                        const { totalMinutes, label } = calculateTotalHours(emp.id);
                                        const isOverload = totalMinutes > 2640;
                                        return (
                                            <td className={`px-2 py-3 text-center font-bold text-xs border-l border-slate-200 dark:border-slate-700 ${isOverload ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'}`}>
                                                {label}
                                            </td>
                                        );
                                    })()
                                }
                            </tr >
                        ))}
                    </tbody >
                </table >
            </div >
            {isEditing && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-white dark:bg-slate-800 p-3 rounded-full shadow-2xl border border-indigo-200 dark:border-indigo-900 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
                        {Object.values(pendingChanges).reduce((acc, curr) => acc + Object.keys(curr).length, 0)} alterações pendentes
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Descartar alterações?')) { setPendingChanges({}); setIsEditing(false); } }} className="text-red-600 hover:bg-red-50 rounded-full">Descartar</Button>
                    <Button size="sm" onClick={saveChanges} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full shadow-lg shadow-indigo-200 dark:shadow-none">
                        {loading ? 'Salvando...' : 'Gravar Tudo'}
                    </Button>
                </div>
            )}
        </div>
    );
}
