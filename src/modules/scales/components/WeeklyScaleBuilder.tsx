'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subDays, isSameDay, differenceInMinutes, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

import { Card, CardContent } from '@/shared/components/ui/card';
import { getEmployeesForScale, getWeeklyScales, saveWorkScale, cloneWeeklyScale, generateAutomaticScale } from '../actions';

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
        store: string;
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

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    // Extract unique Stores and Sectors
    const stores = Array.from(new Set(employees.map(e => e.contract?.store).filter(Boolean))) as string[];
    const sectors = Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[];

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStore = selectedStore === 'ALL' || emp.contract?.store === selectedStore;
        const matchesSector = selectedSector === 'ALL' || emp.department === selectedSector;
        return matchesSearch && matchesStore && matchesSector;
    });

    useEffect(() => {
        loadData();
    }, [weekStart]);

    async function loadData() {
        setLoading(true);
        const [empResult, scaleResult] = await Promise.all([
            getEmployeesForScale(),
            getWeeklyScales(weekStart, addDays(weekStart, 6))
        ]);

        if (empResult.success) setEmployees(empResult.data as any);
        if (scaleResult.success) setScales(scaleResult.data as any);
        setLoading(false);
    }

    function handlePrevWeek() {
        setWeekStart(date => subDays(date, 7));
    }

    function handleNextWeek() {
        setWeekStart(date => addDays(date, 7));
    }

    async function handleClone() {
        if (!confirm('Tem certeza que deseja copiar a escala da SEMANA ANTERIOR para a semana atual? Isso substituirá os registros existentes.')) return;

        setLoading(true);
        const result = await cloneWeeklyScale(weekStart);
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
        const result = await generateAutomaticScale(weekStart);
        if (result.success) {
            toast.success('Escala automática gerada com sucesso!');
            await loadData();
        } else {
            toast.error(result.error || 'Erro ao gerar escala');
        }
        setLoading(false);
    }

    function getScaleForCell(employeeId: string, day: Date) {
        return scales.find(s => s.employeeId === employeeId && isSameDay(new Date(s.date), day));
    }

    async function handleScaleChange(employeeId: string, day: Date, value: string) {
        // Optimistic update
        const newScales = [...scales];
        const existingIndex = newScales.findIndex(s => s.employeeId === employeeId && isSameDay(new Date(s.date), day));

        const newRecord = {
            id: 'temp-' + Math.random(),
            date: day,
            employeeId,
            shiftTypeId: value === 'FOLGA' ? null : value
        };

        if (existingIndex >= 0) {
            newScales[existingIndex] = newRecord as any;
        } else {
            newScales.push(newRecord as any);
        }
        setScales(newScales);

        // Server update
        await saveWorkScale(employeeId, day, value);
    }

    function calculateTotalHours(empId: string) {
        let totalMinutes = 0;

        weekDays.forEach(day => {
            const scale = getScaleForCell(empId, day);
            if (scale && scale.shiftTypeId) {
                const shift = shiftTypes.find(s => s.id === scale.shiftTypeId);
                if (shift) {
                    // Start/End are strings "08:00", we need to parse them to calc diff
                    const start = parse(shift.startTime, 'HH:mm', new Date());
                    const end = parse(shift.endTime, 'HH:mm', new Date());
                    let diff = differenceInMinutes(end, start);
                    if (diff < 0) diff += 1440; // Handle overnight shifts if needed (simple logic)

                    // Subtract 1 hour (60 min) for break if shift > 6 hours (standard rule approximation)
                    // TODO: In future, get break duration from ShiftType
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
                    <Button variant="outline" onClick={handlePrevWeek} className="text-slate-600 border-slate-300 hover:bg-slate-50">◀ Anterior</Button>
                    <Button variant="outline" onClick={handleClone} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" title="Copiar escala da semana passada">
                        📋 Copiar Anterior
                    </Button>
                    <Button variant="outline" onClick={handleAutoGenerate} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Gerar escala padrão 5x2">
                        🤖 Escala Auto
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="text-slate-600 border-slate-300 hover:bg-slate-50" title="Imprimir escala">
                        🖨️ Imprimir
                    </Button>
                </div>

                <div className="text-center">
                    <h3 className="text-slate-800 dark:text-white font-bold text-lg capitalize">
                        {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Semana de {format(weekStart, "dd/MM")} a {format(addDays(weekStart, 6), "dd/MM")}
                    </p>
                </div>
                <Button variant="outline" onClick={handleNextWeek} className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">Próxima ▶</Button>
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
                            <option key={store} value={store}>{store}</option>
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
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-slate-200 dark:border-slate-700">
                                Colaborador
                            </th>
                            {weekDays.map(day => (
                                <th key={day.toISOString()} className={`px - 2 py - 3 text - center min - w - [140px] border - b border - slate - 200 dark: border - slate - 700 ${isSameDay(day, new Date()) ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : ''} `}>
                                    <div className="font-bold">{format(day, "EEE", { locale: ptBR })}</div>
                                    <div className="text-xs opacity-70">{format(day, "dd/MM")}</div>
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
                                    // Validation Logic
                                    const shifts = weekDays.map(day => getScaleForCell(emp.id, day));
                                    const daysWorked = shifts.filter(s => s && s.shiftTypeId && s.shiftTypeId !== 'FOLGA').length; // Assuming null can be empty
                                    // Scale items might be null if not created yet. 
                                    // 'FOLGA' is stored as shiftTypeId in our optimistic logic, but what about DB?
                                    // handleScaleChange uses: shiftTypeId: value === 'FOLGA' ? null : value
                                    // Wait, if shiftTypeId is null, it is a Day Off?
                                    // In `WorkScale` model: `shiftTypeId String ? // If null = Day Off (Folga)`
                                    // So we need to count explicit NULLs as Folga? 
                                    // Or simply: count days WITH shiftTypeId.

                                    // Let's refine checks. 
                                    // If record exists and shiftTypeId is NOT null -> Working.
                                    // If record exists and shiftTypeId IS null -> Off.
                                    // If record does NOT exist -> Undefined (treat as Off or Pending? usually needs definition).
                                    // For safety, let's flag if daysWorked == 7.

                                    const hasViols = daysWorked === 7;

                                    return (
                                        <td className={`px-4 py-3 font-medium text-slate-800 dark:text-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200 dark:border-slate-700 ${hasViols ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                            <div className="truncate w-48" title={emp.name}>{emp.name}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.jobTitle}</div>
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
                                        const scale = getScaleForCell(emp.id, day);
                                        const value = scale?.shiftTypeId || (scale ? 'FOLGA' : '');

                                        function calculateTotalHours(empId: string) {
                                            let totalMinutes = 0;

                                            weekDays.forEach(day => {
                                                const scale = getScaleForCell(empId, day);
                                                if (scale && scale.shiftTypeId) {
                                                    const shift = shiftTypes.find(s => s.id === scale.shiftTypeId);
                                                    if (shift) {
                                                        // Start/End are strings "08:00", we need to parse them to calc diff
                                                        const start = parse(shift.startTime, 'HH:mm', new Date());
                                                        const end = parse(shift.endTime, 'HH:mm', new Date());
                                                        let diff = differenceInMinutes(end, start);
                                                        if (diff < 0) diff += 1440; // Handle overnight shifts if needed (simple logic)

                                                        // Subtract 1 hour (60 min) for break if shift > 6 hours (standard rule approximation)
                                                        // TODO: In future, get break duration from ShiftType
                                                        if (diff > 360) diff -= 60;

                                                        totalMinutes += diff;
                                                    }
                                                }
                                            });

                                            const hours = Math.floor(totalMinutes / 60);
                                            const mins = totalMinutes % 60;
                                            return { totalMinutes, label: `${hours}h${mins > 0 ? ` ${mins}m` : ''}` };
                                        }

                                        return (
                                            <td key={day.toISOString()} className="px-1 py-1 border-r border-slate-100 dark:border-slate-700 last:border-0 relative group">
                                                <select
                                                    className={`w-full h-8 px-2 rounded border-0 text-xs font-medium cursor-pointer transition-colors appearance-none
                                                    ${value === 'FOLGA' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                            value ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
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
                                                {/* Custom Chevron because select appearance-none removes it */}
                                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-slate-500 opacity-0 group-hover:opacity-50">
                                                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </td>
                                        );
                                    })
                                }
                                {
                                    (() => {
                                        const { totalMinutes, label } = calculateTotalHours(emp.id);
                                        const isOverload = totalMinutes > 2640; // > 44 hours
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
        </div >
    );
}
