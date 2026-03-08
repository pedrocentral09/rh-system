'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { exportToExcel, exportToPDF } from '@/shared/utils/export-utils';
import { getTurnoverReport, getPayrollReportPreview } from '../actions/reports';
import { toast } from 'sonner';
import { FileText, Table as TableIcon, Download, Loader2, Users, Receipt, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { PeopleAnalytics } from '@/modules/core/components/PeopleAnalytics';

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
            <Card className="bg-surface border-border shadow-sm rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-text-primary">Filtros de Relatório</CardTitle>
                    <CardDescription className="text-text-muted">Refine os dados antes de exportar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-text-muted">Empresa</label>
                            <select
                                className="w-full h-10 px-3 bg-text-primary/5 border border-border rounded-xl text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                                value={filters.companyId}
                                onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
                            >
                                <option value="" className="bg-surface">Todas as Empresas</option>
                                {companies.map(c => <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-text-muted">Unidade/Loja</label>
                            <select
                                className="w-full h-10 px-3 bg-text-primary/5 border border-border rounded-xl text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                                value={filters.storeId}
                                onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                            >
                                <option value="" className="bg-surface">Todas as Unidades</option>
                                {stores.map(s => <option key={s.id} value={s.id} className="bg-surface">{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="export" className="space-y-6">
                <TabsList className="bg-surface border border-border p-1 rounded-2xl">
                    <TabsTrigger value="export" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-6 text-text-muted">
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Exportação
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-6 text-text-muted">
                        <BarChart3 className="w-3.5 h-3.5 mr-2" />
                        People Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="export" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Turnover Card */}
                        <Card className="bg-surface border border-border shadow-sm rounded-2xl hover:border-brand-orange/40 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-text-primary">
                                        <Users className="w-5 h-5 text-brand-orange" />
                                        Turnover e Equipe
                                    </CardTitle>
                                    <CardDescription className="text-text-muted">Lista completa de ativos e desligados.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-text-muted leading-tight">
                                    Gera um relatório detalhado com nomes, CPFs, cargos, datas de admissão e status atual dos colaboradores selecionados nos filtros.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        onClick={() => handleExportTurnover('excel')}
                                        disabled={loading === 'turnover'}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        {loading === 'turnover' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TableIcon className="w-4 h-4 mr-2" />}
                                        EXCEL (XLSX)
                                    </Button>
                                    <Button
                                        onClick={() => handleExportTurnover('pdf')}
                                        disabled={loading === 'turnover'}
                                        variant="outline"
                                        className="border-text-primary border-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-text-primary hover:text-surface transition-all shadow-lg text-text-primary"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payroll Preview Card */}
                        <Card className="bg-surface border border-border shadow-sm rounded-2xl hover:border-brand-blue/40 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-text-primary">
                                        <Receipt className="w-5 h-5 text-brand-blue" />
                                        Prévia de Folha
                                    </CardTitle>
                                    <CardDescription className="text-text-muted">Estimativa de custos e salários base.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-text-muted leading-tight">
                                    Analise os custos fixos estimados baseados em salários base, bônus e adicionais configurados nos contratos dos colaborares ATIVOS.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        onClick={() => handleExportPayroll('excel')}
                                        disabled={loading === 'payroll'}
                                        className="bg-brand-blue hover:brightness-110 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        {loading === 'payroll' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                        EXCEL (EST.)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <PeopleAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    );
}
