
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, Search, UserPlus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { getAdvancesByPeriod, createSalaryAdvance, updateAdvanceStatus, deleteAdvance } from '../actions/advances';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/components/ui/command';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Printer, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrencyForExport, exportToPDF } from '@/shared/utils/export-utils';

interface SalaryAdvanceTabProps {
    periodId: string;
    isClosed: boolean;
}

export function SalaryAdvanceTab({ periodId, isClosed }: SalaryAdvanceTabProps) {
    const [loading, setLoading] = useState(true);
    const [advances, setAdvances] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('ALL');
    const [companyFilter, setCompanyFilter] = useState('ALL');

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Form state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [openPopover, setOpenPopover] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadData();
    }, [periodId]);

    async function loadData() {
        setLoading(true);
        const [advRes, empRes] = await Promise.all([
            getAdvancesByPeriod(periodId),
            getEmployees({ status: 'ACTIVE' })
        ]);

        if (advRes.success) setAdvances(advRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    }

    async function handleAdd() {
        if (!selectedEmployeeId || !amount) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        const res = await createSalaryAdvance({
            employeeId: selectedEmployeeId,
            periodId,
            amount: parseFloat(amount),
            description
        });

        if (res.success) {
            toast.success('Adiantamento registrado!');
            setIsAdding(false);
            setSelectedEmployeeId('');
            setAmount('');
            setDescription('');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao salvar.');
        }
    }

    async function handleToggleStatus(id: string, currentStatus: string) {
        let newStatus: 'PAID' | 'PENDING' = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
        const res = await updateAdvanceStatus(id, newStatus, periodId);
        if (res.success) {
            toast.success(newStatus === 'PAID' ? 'Marcado como Pago' : 'Marcado como Pendente');
            loadData();
        } else {
            toast.error('Erro ao atualizar status.');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Deseja excluir este adiantamento?')) return;
        const res = await deleteAdvance(id, periodId);
        if (res.success) {
            toast.success('Excluído com sucesso.');
            loadData();
        } else {
            toast.error('Erro ao excluir.');
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const pendingIds = filteredAdvances.filter(a => a.status !== 'PAID').map(a => a.id);
        const allSelected = pendingIds.length > 0 && pendingIds.every(id => selectedIds.has(id));
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingIds));
        }
    };

    const handleBulkPay = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Deseja marcar ${selectedIds.size} adiantamento(s) como PAGO?`)) return;
        let ok = 0;
        for (const id of selectedIds) {
            const res = await updateAdvanceStatus(id, 'PAID', periodId);
            if (res.success) ok++;
        }
        toast.success(`${ok} adiantamento(s) marcado(s) como pago!`);
        setSelectedIds(new Set());
        loadData();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    // Filter Logic
    const uniqueStores = Array.from(new Set(advances.map(a => a.storeName).filter(Boolean))).sort() as string[];
    const uniqueCompanies = Array.from(new Set(advances.map(a => a.companyName).filter(c => c && c !== '-'))).sort() as string[];
    const filteredAdvances = advances.filter(adv => {
        const matchesSearch = adv.employeeName.toLowerCase().includes(search.toLowerCase()) || (adv.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesStore = storeFilter === 'ALL' || adv.storeName === storeFilter;
        const matchesCompany = companyFilter === 'ALL' || adv.companyName === companyFilter;
        return matchesSearch && matchesStore && matchesCompany;
    });

    const drawReceipt = (doc: jsPDF, adv: any) => {
        const dateStr = new Date().toLocaleDateString('pt-BR');
        const company = adv.companyName && adv.companyName !== '-' ? adv.companyName : 'FAMÍLIA RH';
        const obs = adv.description || '';

        const drawVia = (yStart: number, viaLabel: string) => {
            const y = yStart;

            // Título
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RECIBO DE ADIANTAMENTO SALARIAL', 105, y, { align: 'center' });

            // Via label
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(viaLabel, 196, y, { align: 'right' });

            // Linha divisória abaixo do título
            doc.setDrawColor(180);
            doc.setLineWidth(0.3);
            doc.line(14, y + 3, 196, y + 3);

            // Corpo
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Colaborador:', 14, y + 12);
            doc.setFont('helvetica', 'normal');
            doc.text(adv.employeeName, 48, y + 12);

            doc.setFont('helvetica', 'bold');
            doc.text('Empresa:', 14, y + 20);
            doc.setFont('helvetica', 'normal');
            doc.text(company, 38, y + 20);

            doc.setFont('helvetica', 'bold');
            doc.text('Valor:', 14, y + 28);
            doc.setFont('helvetica', 'normal');
            doc.text(formatCurrency(adv.amount), 30, y + 28);

            doc.setFont('helvetica', 'bold');
            doc.text('Data:', 120, y + 28);
            doc.setFont('helvetica', 'normal');
            doc.text(dateStr, 133, y + 28);

            if (obs) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Obs:', 14, y + 36);
                doc.setFont('helvetica', 'normal');
                doc.text(obs.substring(0, 90), 28, y + 36);
            }

            // Declaração
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `Declaro ter recebido a importância acima referente a adiantamento salarial.`,
                14, y + 48
            );

            // Assinatura
            doc.setDrawColor(0);
            doc.setLineWidth(0.4);
            doc.line(14, y + 68, 120, y + 68);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(adv.employeeName.toUpperCase(), 14, y + 74);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`CPF: ${adv.cpf || '_______________'}`, 14, y + 80);
        };

        // 1ª Via (Empresa) — metade superior
        drawVia(18, '1ª Via – Empresa');

        // Linha tracejada de corte (tesoura) no meio da página
        doc.setDrawColor(150);
        doc.setLineWidth(0.2);
        const midY = 148;
        for (let x = 10; x < 200; x += 5) {
            doc.line(x, midY, x + 3, midY);
        }
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('✂  Recorte aqui', 105, midY - 2, { align: 'center' });

        // 2ª Via (Colaborador) — metade inferior
        drawVia(160, '2ª Via – Colaborador');
    };

    const handlePrintReceipt = (adv: any) => {
        const doc = new jsPDF();
        drawReceipt(doc, adv);
        doc.save(`Recibo_Adiantamento_${adv.employeeName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    };

    const handlePrintAllReceipts = () => {
        if (filteredAdvances.length === 0) {
            toast.error('Nenhum adiantamento para gerar comprovantes.');
            return;
        }
        const doc = new jsPDF();
        filteredAdvances.forEach((adv, i) => {
            if (i > 0) doc.addPage();
            drawReceipt(doc, adv);
        });
        doc.save(`Comprovantes_Adiantamentos_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success(`${filteredAdvances.length} comprovante(s) gerado(s) com sucesso!`);
    };

    const handleExportListPDF = () => {
        const exportData = filteredAdvances.map(a => ({
            Nome: a.employeeName,
            Empresa: a.companyName || '-',
            Loja: a.storeName || 'Geral',
            Valor: formatCurrencyForExport(a.amount),
            Observacao: a.description || '-',
            Status: a.status === 'PAID' ? 'PAGO' : 'PENDENTE'
        }));
        const cols: any = [
            { header: 'Nome', dataKey: 'Nome' },
            { header: 'Empresa', dataKey: 'Empresa' },
            { header: 'Loja', dataKey: 'Loja' },
            { header: 'Valor', dataKey: 'Valor' },
            { header: 'Status', dataKey: 'Status' },
            { header: 'Observação', dataKey: 'Observacao' },
        ];
        exportToPDF(exportData, cols, 'Relatório de Adiantamentos / Vales', `Adiantamentos_${new Date().toISOString().split('T')[0]}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium">Carregando adiantamentos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">Gestão de Vales (Adiantamentos)</h2>
                    <p className="text-sm text-slate-500">Lance adiantamentos individuais. Somente itens marcados como <span className="text-emerald-600 font-bold uppercase">Pago</span> serão descontados na folha final.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExportListPDF} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                        <FileText className="mr-2 h-4 w-4" />
                        Lista PDF
                    </Button>
                    <Button onClick={handlePrintAllReceipts} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <Printer className="mr-2 h-4 w-4" />
                        Todos Comprovantes
                    </Button>
                    {!isClosed && (
                        <Button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Adiantamento
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar funcionário..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                </div>
                {uniqueStores.length > 0 && (
                    <div className="w-full sm:w-64 shrink-0">
                        <select
                            value={storeFilter}
                            onChange={e => setStoreFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="ALL">Todas as Lojas</option>
                            {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}
                {uniqueCompanies.length > 0 && (
                    <div className="w-full sm:w-64 shrink-0">
                        <select
                            value={companyFilter}
                            onChange={e => setCompanyFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="ALL">Todas as Empresas</option>
                            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-lg animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador</label>
                            <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openPopover}
                                        className="w-full justify-between font-normal"
                                    >
                                        {selectedEmployeeId
                                            ? employees.find((emp) => emp.id === selectedEmployeeId)?.name
                                            : "Pesquisar colaborador..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl opacity-100" align="start">
                                    <Command className="bg-white dark:bg-slate-900">
                                        <CommandInput placeholder="Digite o nome..." className="bg-white dark:bg-slate-900" />
                                        <CommandList className="bg-white dark:bg-slate-900">
                                            <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                                            <CommandGroup className="bg-white dark:bg-slate-900">
                                                {employees.map((emp: any) => (
                                                    <CommandItem
                                                        key={emp.id}
                                                        value={emp.name}
                                                        className="data-[selected='true']:bg-slate-100 dark:data-[selected='true']:bg-slate-800 cursor-pointer"
                                                        onSelect={() => {
                                                            setSelectedEmployeeId(emp.id);
                                                            setOpenPopover(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedEmployeeId === emp.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {emp.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observação</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                placeholder="Opcional..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            {!isClosed && (
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={filteredAdvances.filter(a => a.status !== 'PAID').length > 0 && filteredAdvances.filter(a => a.status !== 'PAID').every(a => selectedIds.has(a.id))}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                            )}
                            <th className="px-6 py-4 font-semibold text-slate-500">Colaborador</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Empresa</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Valor Adiantado</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Observação</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAdvances.map((adv: any) => (
                            <tr key={adv.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.has(adv.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                                {!isClosed && (
                                    <td className="px-4 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={selectedIds.has(adv.id)}
                                            onChange={() => toggleSelect(adv.id)}
                                            disabled={adv.status === 'PAID'}
                                        />
                                    </td>
                                )}
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                                    <p>{adv.employeeName}</p>
                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{adv.storeName}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                                    {adv.companyName}
                                </td>
                                <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(adv.amount)}
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                                    {adv.description || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={
                                        adv.status === 'PAID'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }>
                                        {adv.status === 'PAID' ? 'PAGO (Descontará)' : 'PENDENTE'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {!isClosed && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={adv.status === 'PAID' ? 'text-amber-600' : 'text-emerald-600'}
                                                    onClick={() => handleToggleStatus(adv.id, adv.status)}
                                                >
                                                    {adv.status === 'PAID' ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                                                    {adv.status === 'PAID' ? 'Reverter' : 'Marcar Pago'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-slate-500 hover:text-indigo-600"
                                                    title="Imprimir Comprovante (Recibo)"
                                                    onClick={() => handlePrintReceipt(adv)}
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(adv.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAdvances.length === 0 && (
                            <tr>
                                <td colSpan={!isClosed ? 7 : 6} className="p-12 text-center text-slate-400 italic">
                                    Nenhum adiantamento encontrado com os filtros atuais.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk action bar */}
            {!isClosed && selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg shadow-indigo-500/20 animate-in slide-in-from-bottom-4 duration-300">
                    <p className="text-sm font-bold">
                        {selectedIds.size} adiantamento(s) selecionado(s)
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            Limpar Seleção
                        </Button>
                        <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            onClick={handleBulkPay}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar Todos como Pago
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    💡 **Dica do Sistema**: O valor do adiantamento deve ser pago via PIX/Transferência por fora.
                    Ao marcar como **"PAGO"** aqui, o sistema automaticamente injetará a rubrica de desconto de adiantamento (5004) quando você recalcular o holerite mensal.
                </p>
            </div>
        </div>
    );
}
