
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
            <DialogContent className="max-w-4xl border-none shadow-2xl bg-white p-0 overflow-hidden rounded-[40px]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Visualização de Holerite - {payslip.employee.name}</DialogTitle>
                </DialogHeader>

                {/* Header Estilizado - Premium Dark */}
                <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xl">
                                    <Wallet className="h-5 w-5 text-brand-orange" />
                                </div>
                                <Badge className="bg-white/10 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Holerite Digital</Badge>
                                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">
                                    {payslip.period?.month.toString().padStart(2, '0')}/{payslip.period?.year}
                                </span>
                            </div>
                            <h2 className="text-4xl font-[1000] tracking-tight leading-none mb-3">{payslip.employee.name}</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-80 italic">
                                {payslip.employee.jobTitle} • Matrícula {payslip.employee.id.split('-')[0].toUpperCase()}
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] md:text-right min-w-[200px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Líquido</p>
                            <div className="text-3xl font-[1000] text-emerald-400 tracking-tighter">
                                {formatCurrency(payslip.netSalary)}
                            </div>
                        </div>
                    </div>
                    {/* Visual Decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-blue rounded-full blur-[100px] opacity-20 pointer-events-none" />
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Compact Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Building2, label: 'Empresa', value: payslip.employee.contract?.company?.name || '---' },
                            { icon: Store, label: 'Unidade', value: payslip.employee.contract?.store?.name || '---' },
                            { icon: Calendar, label: 'Admissão', value: payslip.employee.hireDate ? new Date(payslip.employee.hireDate).toLocaleDateString('pt-BR') : '---' },
                            { icon: Wallet, label: 'Base', value: formatCurrency(payslip.grossSalary) },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-[22px]">
                                <div className="flex items-center text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5 gap-2">
                                    <item.icon className="h-3 w-3" /> {item.label}
                                </div>
                                <div className="text-[11px] font-[1000] text-slate-800 line-clamp-1">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Streamlined Table */}
                    <div className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                    <th className="px-6 py-4 text-left font-black">Item</th>
                                    <th className="px-4 py-4 text-center font-black">Ref</th>
                                    <th className="px-6 py-4 text-right font-black">Proventos</th>
                                    <th className="px-6 py-4 text-right font-black text-rose-500">Descontos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payslip.items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-[900] text-slate-800 uppercase tracking-tighter text-[11px]">{item.name}</span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.event?.code || '--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-lg font-[1000] text-slate-500 text-[10px]">{item.reference || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-[1000] text-slate-800">
                                                {item.type === 'EARNING' ? formatCurrency(item.value) : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-[1000] text-rose-500">
                                                {item.type === 'DEDUCTION' ? formatCurrency(item.value) : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-center relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Total Líquido</p>
                                    <h4 className="text-4xl font-[1000] tracking-tighter text-brand-orange">{formatCurrency(payslip.netSalary)}</h4>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <Wallet className="h-6 w-6 text-slate-500" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand-orange rounded-full blur-[80px] opacity-10 pointer-events-none" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-5 rounded-[24px] bg-emerald-50 border border-emerald-100">
                                <span className="font-black uppercase text-[10px] tracking-widest text-emerald-600/60">Proventos</span>
                                <span className="font-[1000] text-emerald-600 text-lg">{formatCurrency(payslip.totalAdditions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-5 rounded-[24px] bg-rose-50 border border-rose-100">
                                <span className="font-black uppercase text-[10px] tracking-widest text-rose-600/60">Descontos</span>
                                <span className="font-[1000] text-rose-600 text-lg">{formatCurrency(payslip.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
