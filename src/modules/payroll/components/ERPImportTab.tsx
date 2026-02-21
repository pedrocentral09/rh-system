
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { saveExternalImports, getExternalImportsByPeriod, deleteExternalImport } from '../actions/imports';

interface ImportItem {
    id: string;
    employeeName: string;
    employeeCpf: string;
    itemCode: string;
    label: string;
    amount: number;
    sourceStore: string;
}

interface ImportError {
    cpf: string;
    name: string;
    amount: number;
    reason: string;
}

export function ERPImportTab({ periodId, isClosed }: { periodId: string; isClosed: boolean }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imports, setImports] = useState<ImportItem[]>([]);
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadImports = async () => {
        setFetching(true);
        const result = await getExternalImportsByPeriod(periodId);
        if (result.success && result.data) {
            setImports(result.data as ImportItem[]);
        }
        setFetching(false);
    };

    useEffect(() => {
        loadImports();
    }, [periodId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                const header = lines[0].toUpperCase();
                const separator = header.includes(';') ? ';' : ',';
                const columns = header.split(separator);

                const cpfIdx = columns.findIndex(c => c.includes('CPF') || c.includes('CNPJ'));
                const nameIdx = columns.findIndex(c => c.includes('CLIENTE') || c.includes('NOME'));
                const valueIdx = columns.findIndex(c => c.includes('VALOR') || c.includes('AMOUNT'));
                const obsIdx = columns.findIndex(c => c.includes('OBS'));
                const storeIdx = columns.findIndex(c => c.includes('EMPRESA') || c.includes('LOJA'));

                if (cpfIdx === -1 || valueIdx === -1) {
                    toast.error('Formato de planilha não reconhecido. Certifique-se de ter colunas de CPF e VALOR.');
                    setLoading(false);
                    return;
                }

                // Aggregated data by CPF, ItemCode and Store
                const aggregatedData: Record<string, { cpf: string, name: string, itemCode: string, label: string, amount: number, sourceStore: string }> = {};

                lines.slice(1).forEach(line => {
                    const parts = line.split(separator);
                    const rawCpf = parts[cpfIdx]?.trim() || '';
                    const cleanCpf = rawCpf.replace(/\D/g, '');

                    if (!cleanCpf) return;

                    const name = parts[nameIdx]?.trim() || 'DESCONHECIDO';
                    const rawAmount = parts[valueIdx]?.trim().replace(',', '.') || '0';
                    const amount = parseFloat(rawAmount);
                    if (isNaN(amount) || amount === 0) return;

                    const obs = parts[obsIdx]?.toUpperCase() || '';
                    const isQuebra = obs.includes('QUEBRA DE CAIXA');
                    const itemCode = isQuebra ? '5007' : '5006';
                    const label = isQuebra ? 'Quebra de Caixa (Desconto)' : 'Convênio ERP';

                    const sourceStore = storeIdx !== -1 ? (parts[storeIdx]?.trim() || 'MATRIZ') : 'MATRIZ';

                    const key = `${cleanCpf}-${itemCode}-${sourceStore}`;
                    if (aggregatedData[key]) {
                        aggregatedData[key].amount += amount;
                    } else {
                        aggregatedData[key] = { cpf: cleanCpf, name, itemCode, label, amount, sourceStore };
                    }
                });

                const dataToSave = Object.values(aggregatedData);

                if (dataToSave.length === 0) {
                    toast.error('Nenhum dado válido encontrado no arquivo.');
                    setLoading(false);
                    return;
                }

                const result = await saveExternalImports(periodId, dataToSave);
                if (result.success) {
                    const errorList = result.errors || [];
                    if (errorList.length > 0) {
                        setImportErrors(errorList);
                        setShowErrorModal(true);
                        toast.warning(`Importação concluída com ${errorList.length} divergências.`);
                    } else {
                        toast.success(`Importação realizada com sucesso! ${result.successCount} colaboradores processados.`);
                    }
                    loadImports();
                } else {
                    toast.error(result.error);
                }
            } catch (err) {
                console.error('Error parsing file:', err);
                toast.error('Erro ao processar arquivo.');
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este registro de importação?')) return;

        const result = await deleteExternalImport(id, periodId);
        if (result.success) {
            toast.success('Registro excluído.');
            loadImports();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Card */}
                <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm border-2 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                            <Upload className="h-5 w-5 text-orange-500" />
                            Importar Planilha ERP
                        </CardTitle>
                        <CardDescription>Upload inteligente de descontos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                            <div className="flex gap-2 items-start text-orange-700 dark:text-orange-400">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] font-bold leading-tight uppercase">
                                    O sistema identifica colunas e classifica descontos lendo as observações.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                disabled={isClosed || loading}
                            />
                            <Button
                                className="w-full h-32 flex flex-col gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-slate-500 hover:text-orange-600"
                                variant="ghost"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isClosed || loading}
                            >
                                {loading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <span className="text-[10px] font-black uppercase">Processando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <FileText className="h-10 w-10 text-orange-500/50" />
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Carregar arquivo do ERP</p>
                                            <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">Clique para selecionar</p>
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* List Card */}
                <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tighter">Conferência de Importação</CardTitle>
                                <CardDescription>Consolidado por colaborador neste período</CardDescription>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase">
                                {imports.length} Lançamentos
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {fetching ? (
                            <div className="h-48 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                            </div>
                        ) : imports.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                                <FileText className="h-10 w-10 mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase">Aguardando upload de dados</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-slate-800">
                                            <th className="py-2 text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Loja</th>
                                            <th className="py-2 text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Colaborador</th>
                                            <th className="py-2 text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest text-center">Tipo</th>
                                            <th className="py-2 text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest text-right">Valor</th>
                                            <th className="py-2 text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-slate-800">
                                        {imports.map((item) => (
                                            <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-2">
                                                    <Badge variant="secondary" className="text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {item.sourceStore || 'MATRIZ'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{item.employeeName}</p>
                                                    <p className="text-[10px] font-medium text-slate-400">{item.employeeCpf}</p>
                                                </td>

                                                <td className="py-3 px-2 text-center">
                                                    <Badge variant="outline" className={`text-[9px] font-black uppercase ${item.itemCode === '5006' ? 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                                        {item.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={isClosed}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Error Report Modal */}
            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            Divergências na Importação
                        </DialogTitle>
                        <DialogDescription className="font-bold uppercase text-[10px] text-slate-500">
                            Estes registros do ERP não foram localizados no sistema RH.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 px-2">Nome na Planilha</th>
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 px-2">CPF</th>
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 px-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                                {importErrors.map((error, idx) => (
                                    <tr key={idx} className="hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                                        <td className="py-3 px-2 text-xs font-bold text-slate-700 dark:text-slate-300">{error.name}</td>
                                        <td className="py-3 px-2 text-xs font-mono text-slate-500">{error.cpf}</td>
                                        <td className="py-3 px-2 text-xs font-black text-red-600 text-right">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(error.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-4 flex justify-end border-t dark:border-slate-800">
                        <Button
                            onClick={() => setShowErrorModal(false)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-widest rounded-none shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
                        >
                            ENTENDI, VOU VERIFICAR
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
