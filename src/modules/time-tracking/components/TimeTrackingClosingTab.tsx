
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Loader2, Lock, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { closeTimeSheet, getClosingStatus, getClosedPeriods } from '@/modules/time-tracking/actions/closing';
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';
import { toast } from 'sonner';

export function TimeTrackingClosingTab() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth()); // 0-11
    const [year, setYear] = useState(today.getFullYear());

    const [status, setStatus] = useState<'IDLE' | 'FETCHING' | 'CONFIRM' | 'CLOSING' | 'DONE'>('IDLE');
    const [employees, setEmployees] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{ success: number, fail: number }>({ success: 0, fail: 0 });
    const [processedEmployees, setProcessedEmployees] = useState<any[]>([]);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [status]); // Reload when status changes (e.g. after a close)

    async function loadHistory() {
        setLoadingHistory(true);
        const res = await getClosedPeriods();
        if (res.success) {
            setHistory(res.data || []);
        }
        setLoadingHistory(false);
    }

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    async function handleAnalyze() {
        setStatus('FETCHING');
        const res = await getEmployees();
        if (res.data) {
            // Filter only active?
            const active = res.data.filter((e: any) => e.status === 'ACTIVE');
            setEmployees(active);
            setStatus('CONFIRM');
        } else {
            toast.error('Erro ao buscar funcionários');
            setStatus('IDLE');
        }
    }

    async function executeBulkClose() {
        if (!confirm(`Confirma o fechamento para ${employees.length} funcionários?`)) return;

        setStatus('CLOSING');
        setProgress(0);
        setProcessedEmployees([]);
        let s = 0;
        let f = 0;
        const tempProcessed: any[] = [];

        // Process in serial to avoid overwhelming DB/Server (or chunks of 5)
        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            try {
                // 1. Check if already closed
                const check = await getClosingStatus(emp.id, month + 1, year);
                if (check && check.data) {
                    s++; // Already closed counts as success/done
                    tempProcessed.push({ ...emp, status: 'ALREADY_CLOSED' });
                } else {
                    // 2. Need to get balance first
                    const sheet = await getTimeSheet(emp.id, month, year);
                    const balance = sheet.success && sheet.data ? sheet.data.totalBalance : 0;

                    // 3. Close
                    const closeRes = await closeTimeSheet(emp.id, month + 1, year, balance);
                    if (closeRes.success) {
                        s++;
                        tempProcessed.push({ ...emp, status: 'CLOSED_NOW' });
                    } else {
                        f++;
                    }
                }
            } catch (err) {
                f++;
                console.error(err);
            }

            // Update UI
            setProcessedEmployees([...tempProcessed]);
            setProgress(Math.round(((i + 1) / employees.length) * 100));
        }

        setResults({ success: s, fail: f });
        setStatus('DONE');
        toast.success(`Processo finalizado: ${s} fechados, ${f} erros.`);
        loadHistory(); // Refresh history immediately
    }

    // Group history by Period
    const groupedHistory = history.reduce((acc: any, curr: any) => {
        const key = `${curr.month}/${curr.year}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-slate-700" />
                        Fechamento Mensal em Massa
                    </CardTitle>
                    <CardDescription>
                        Selecione a competência para encerrar o ponto de todos os colaboradores ativos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Period Selector */}
                    <div className="flex gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mês</label>
                            <select
                                className="w-40 border rounded-md px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                value={month}
                                onChange={(e) => { setMonth(parseInt(e.target.value)); setStatus('IDLE'); }}
                                disabled={status === 'CLOSING'}
                            >
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Ano</label>
                            <select
                                className="w-24 border rounded-md px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                value={year}
                                onChange={(e) => { setYear(parseInt(e.target.value)); setStatus('IDLE'); }}
                                disabled={status === 'CLOSING'}
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={status !== 'IDLE'}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {status === 'FETCHING' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analisar Pendências'}
                        </Button>
                    </div>

                    {/* Confirmation Stage */}
                    {status === 'CONFIRM' && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex justify-between items-center animate-in fade-in">
                            <div className="flex gap-3 items-center text-amber-900 dark:text-amber-100">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="font-semibold">Pronto para fechar?</p>
                                    <p className="text-sm">Serão processados <strong>{employees.length}</strong> funcionários ativos.</p>
                                </div>
                            </div>
                            <Button onClick={executeBulkClose} className="bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600">
                                <Lock className="h-4 w-4 mr-2" />
                                Confirmar Fechamento Geral
                            </Button>
                        </div>
                    )}

                    {/* Progress Stage */}
                    {status === 'CLOSING' && (
                        <div className="space-y-2 animate-in fade-in">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Processando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Done Stage */}
                    {status === 'DONE' && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg animate-in fade-in">
                            <div className="text-center mb-6">
                                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Fechamento Concluído!</h3>
                                <p className="text-green-700 dark:text-green-400 mt-1">
                                    {results.success} fechados com sucesso. {results.fail > 0 && `${results.fail} falhas.`}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden text-left">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Folhas prontas para impressão
                                </div>
                                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                    {processedEmployees.map(emp => (
                                        <div key={emp.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <div>
                                                <p className="font-medium text-sm text-slate-900 dark:text-slate-200">{emp.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                                                onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${emp.id}&month=${month + 1}&year=${year}`, '_blank')}
                                            >
                                                <Printer className="h-3 w-3 mr-2" /> Imprimir
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <Button
                                    className=""
                                    variant="outline"
                                    onClick={() => setStatus('IDLE')}
                                >
                                    Novo Fechamento
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* HISTORY SECTION */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Histórico de Fechamentos</h3>

                {history.length === 0 && !loadingHistory && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 border-dashed">
                        Nenhum fechamento registrado ainda.
                    </div>
                )}

                {loadingHistory && (
                    <div className="text-center py-8 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                )}

                {Object.keys(groupedHistory).map(key => {
                    const [m, y] = key.split('/');
                    const items = groupedHistory[key];
                    const monthName = months[parseInt(m) - 1];

                    return (
                        <Card key={key} className="overflow-hidden border-slate-200 dark:border-slate-700">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{monthName} / {y}</span>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                        {items.length} funcionários fechados
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                                        onClick={() => window.open(`/dashboard/time-tracking/print?month=${m}&year=${y}&bulk=true`, '_blank')}
                                    >
                                        <Printer className="h-3 w-3 mr-1" /> Imprimir Todos
                                    </Button>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-60 overflow-y-auto">
                                {items.map((item: any) => (
                                    <div key={item.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-slate-200">{item.employee.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Fechado em {new Date(item.closedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <span className={`text-xs font-mono font-medium ${parseFloat(item.totalBalance) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {parseFloat(item.totalBalance) > 0 ? '+' : ''}{item.totalBalance}h
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${item.employee.id}&month=${m}&year=${y}`, '_blank')}
                                            >
                                                <Printer className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
