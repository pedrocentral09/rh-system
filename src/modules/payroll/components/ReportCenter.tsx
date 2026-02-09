'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { exportToExcel, exportToPDF } from '@/shared/utils/export-utils';
import { getTurnoverReport, getPayrollReportPreview } from '../actions/reports';
import { toast } from 'sonner';
import { FileText, Table as TableIcon, Download, Loader2, Users, Receipt } from 'lucide-react';

interface ReportCenterProps {
    companies: { id: string, name: string }[];
    stores: { id: string, name: string }[];
}

export function ReportCenter({ companies, stores }: ReportCenterProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        companyId: '',
        storeId: ''
    });

    const handleExportTurnover = async (format: 'excel' | 'pdf') => {
        setLoading('turnover');
        try {
            const result = await getTurnoverReport(filters);
            if (result.success && result.data) {
                if (format === 'excel') {
                    exportToExcel(result.data, `turnover_${new Date().getTime()}`, 'Turnover');
                } else {
                    const columns = [
                        { header: 'Nome', dataKey: 'Nome' },
                        { header: 'Status', dataKey: 'Status' },
                        { header: 'Admissão', dataKey: 'Admissão' },
                        { header: 'Cargo', dataKey: 'Cargo' }
                    ];
                    exportToPDF(result.data, columns as any, 'Relatório de Turnover', `turnover_${new Date().getTime()}`);
                }
                toast.success('Relatório gerado com sucesso!');
            } else {
                toast.error(result.message || 'Erro ao buscar dados');
            }
        } catch (err) {
            toast.error('Ocorreu um erro na geração');
        } finally {
            setLoading(null);
        }
    };

    const handleExportPayroll = async (format: 'excel' | 'pdf') => {
        setLoading('payroll');
        try {
            const result = await getPayrollReportPreview(filters);
            if (result.success && result.data) {
                if (format === 'excel') {
                    exportToExcel(result.data, `folha_previa_${new Date().getTime()}`, 'Prévia Folha');
                } else {
                    const columns = [
                        { header: 'Colaborador', dataKey: 'Colaborador' },
                        { header: 'Salário Base', dataKey: 'Salário Base' },
                        { header: 'Total Bruto Est.', dataKey: 'Total Bruto Est.' }
                    ];
                    exportToPDF(result.data, columns as any, 'Prévia de Folha Pagamento', `folha_${new Date().getTime()}`);
                }
                toast.success('Exportação concluída!');
            }
        } catch (err) {
            toast.error('Erro ao exportar dados da folha');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filters Section */}
            <Card className="border-slate-200 shadow-sm rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Filtros de Relatório</CardTitle>
                    <CardDescription>Refine os dados antes de exportar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Empresa</label>
                            <select
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-none text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={filters.companyId}
                                onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
                            >
                                <option value="">Todas as Empresas</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Unidade/Loja</label>
                            <select
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-none text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={filters.storeId}
                                onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                            >
                                <option value="">Todas as Unidades</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Turnover Card */}
                <Card className="border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-none hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,0.4)] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Users className="w-5 h-5 text-orange-500" />
                                Turnover e Equipe
                            </CardTitle>
                            <CardDescription>Lista completa de ativos e desligados.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 leading-tight">
                            Gera um relatório detalhado com nomes, CPFs, cargos, datas de admissão e status atual dos colaboradores selecionados nos filtros.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                onClick={() => handleExportTurnover('excel')}
                                disabled={loading === 'turnover'}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold uppercase text-xs tracking-widest shadow-lg"
                            >
                                {loading === 'turnover' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TableIcon className="w-4 h-4 mr-2" />}
                                EXCEL (XLSX)
                            </Button>
                            <Button
                                onClick={() => handleExportTurnover('pdf')}
                                disabled={loading === 'turnover'}
                                variant="outline"
                                className="border-slate-900 border-2 rounded-none font-bold uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payroll Preview Card */}
                <Card className="border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-none hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.4)] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-indigo-600" />
                                Prévia de Folha
                            </CardTitle>
                            <CardDescription>Estimativa de custos e salários base.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 leading-tight">
                            Analise os custos fixos estimados baseados em salários base, bônus e adicionais configurados nos contratos dos colaborares ATIVOS.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                onClick={() => handleExportPayroll('excel')}
                                disabled={loading === 'payroll'}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-bold uppercase text-xs tracking-widest shadow-lg"
                            >
                                {loading === 'payroll' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                EXCEL (EST.)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
