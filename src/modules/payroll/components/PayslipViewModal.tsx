
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Wallet, ArrowUpCircle, ArrowDownCircle, User, Calendar, Building2, Store } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

interface ViewProps {
    payslip: any;
    isOpen: boolean;
    onClose: () => void;
}

export function PayslipViewModal({ payslip, isOpen, onClose }: ViewProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl border-none shadow-2xl bg-white dark:bg-slate-950 p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Visualização de Holerite - {payslip.employee.name}</DialogTitle>
                </DialogHeader>

                {/* Header Estilizado */}
                <div className="bg-slate-900 p-6 text-white border-b border-white/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-white border-white/20 bg-white/10 uppercase tracking-widest text-[9px]">
                                    Holerite de Pagamento
                                </Badge>
                                <span className="text-slate-400 text-xs font-medium">Ref: {payslip.period?.month.toString().padStart(2, '0')}/{payslip.period?.year}</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{payslip.employee.name}</h2>
                            <div className="flex items-center text-slate-400 text-sm mt-1 font-medium italic">
                                {payslip.employee.jobTitle} • Matrícula: {payslip.employee.id.split('-')[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-emerald-400 font-black text-2xl">{formatCurrency(payslip.netSalary)}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Valor Líquido</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-slate-950 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center text-slate-400 text-[9px] font-bold uppercase mb-1">
                                <Building2 className="h-3 w-3 mr-1" /> Empresa
                            </div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {payslip.employee.contract?.company?.name || '---'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center text-slate-400 text-[9px] font-bold uppercase mb-1">
                                <Store className="h-3 w-3 mr-1" /> Unidade/Loja
                            </div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {payslip.employee.contract?.store?.name || '---'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center text-slate-400 text-[9px] font-bold uppercase mb-1">
                                <Calendar className="h-3 w-3 mr-1" /> Admissão
                            </div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {payslip.employee.hireDate ? new Date(payslip.employee.hireDate).toLocaleDateString('pt-BR') : '---'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center text-slate-400 text-[9px] font-bold uppercase mb-1">
                                <Wallet className="h-3 w-3 mr-1" /> Salário Base
                            </div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {formatCurrency(payslip.grossSalary)}
                            </div>
                        </div>
                    </div>

                    {/* Table of Items */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                    <th className="px-4 py-3 text-left w-16">Cód</th>
                                    <th className="px-4 py-3 text-left">Descrição do Evento</th>
                                    <th className="px-4 py-3 text-center w-24">Referência</th>
                                    <th className="px-4 py-3 text-right w-32">Vencimentos</th>
                                    <th className="px-4 py-3 text-right w-32 text-red-400">Descontos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {payslip.items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 text-xs font-bold text-slate-400">{item.event?.code || '---'}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                                            {item.name}
                                            {item.source === 'SYNC' && <Badge className="ml-2 h-3 text-[7px] bg-amber-50 text-amber-600 border-amber-100">PONTO</Badge>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500 font-medium">
                                            {item.reference ? (
                                                <span className="flex flex-col items-center">
                                                    <span className="text-xs">{item.reference}</span>
                                                    <span className="text-[8px] opacity-60 uppercase">
                                                        {item.code === '5001' || item.code === '5002' ? '%' : (item.code === '1001' ? 'dias' : 'hrs')}
                                                    </span>
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200">
                                            {item.type === 'EARNING' ? formatCurrency(item.value) : ''}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-red-500">
                                            {item.type === 'DEDUCTION' ? formatCurrency(item.value) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
                                <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                                    <ArrowUpCircle className="h-4 w-4 mr-2" /> Total de Vencimentos
                                </span>
                                <span className="font-black text-emerald-600">{formatCurrency(payslip.totalAdditions)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30">
                                <span className="flex items-center text-red-700 dark:text-red-400 font-bold uppercase text-[10px] tracking-widest">
                                    <ArrowDownCircle className="h-4 w-4 mr-2" /> Total de Descontos
                                </span>
                                <span className="font-black text-red-600">{formatCurrency(payslip.totalDeductions)}</span>
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-6 rounded-xl text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col justify-center relative overflow-hidden group">
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Líquido a Receber</div>
                                    <div className="text-4xl font-black">{formatCurrency(payslip.netSalary)}</div>
                                </div>
                                <Wallet className="h-12 w-12 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            {/* Efeito Visual */}
                            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
