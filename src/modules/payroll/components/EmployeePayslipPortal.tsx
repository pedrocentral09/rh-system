'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    Search,
    ChevronRight,
    Wallet
} from 'lucide-react';
import { PayslipViewModal } from './PayslipViewModal';

interface PayslipPortalProps {
    payslips: any[];
}

export function EmployeePayslipPortal({ payslips }: PayslipPortalProps) {
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const filteredPayslips = payslips.filter(p => {
        const monthName = monthNames[p.period.month - 1].toLowerCase();
        return monthName.includes(searchTerm.toLowerCase()) || p.period.year.toString().includes(searchTerm);
    });

    const handleView = (payslip: any) => {
        setSelectedPayslip(payslip);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Premium Stats Card */}
            <Card className="bg-surface-secondary border border-border rounded-[40px] overflow-hidden relative backdrop-blur-3xl">
                <CardContent className="p-8 text-text-primary relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="p-4 bg-brand-orange/20 rounded-2xl backdrop-blur-md border border-brand-orange/30">
                            <Wallet className="h-7 w-7 text-brand-orange" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-[1000] text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Atualizado</Badge>
                    </div>

                    <div className="space-y-1">
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mb-2">Última Referência</p>
                        <h3 className="text-5xl font-[1000] tracking-tighter text-text-primary">
                            {payslips.length > 0 ? formatCurrency(payslips[0].netSalary) : 'R$ 0,00'}
                        </h3>
                        <p className="text-brand-blue text-[11px] font-[1000] uppercase tracking-widest mt-2 px-1">
                            {payslips.length > 0 ? `${monthNames[payslips[0].period.month - 1]} ${payslips[0].period.year}` : '--'}
                        </p>
                    </div>
                </CardContent>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-blue rounded-full blur-[120px] opacity-20" />
            </Card>

            {/* Search Bar - Glass */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar por mês ou ano..."
                    className="w-full pl-14 pr-8 py-5 bg-text-primary/5 border border-border rounded-[28px] text-sm font-bold text-text-primary focus:ring-4 ring-text-primary/10 backdrop-blur-xl transition-all outline-none placeholder:text-text-muted/40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* History List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Recibos Digitais</h3>
                    <div className="h-px bg-border flex-1 mx-6" />
                    <span className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest">{filteredPayslips.length} Itens</span>
                </div>

                {filteredPayslips.length === 0 ? (
                    <div className="text-center py-24 bg-text-primary/2 rounded-[40px] border border-dashed border-border backdrop-blur-2xl">
                        <FileText className="h-12 w-12 text-text-muted/20 mx-auto mb-4" />
                        <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">Nenhum resultado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPayslips.map((payslip) => (
                            <motion.div
                                key={payslip.id}
                                whileTap={{ scale: 0.98 }}
                                className="bg-surface/60 border border-border rounded-[32px] p-5 flex items-center justify-between backdrop-blur-2xl cursor-pointer hover:bg-surface transition-all group"
                                onClick={() => handleView(payslip)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-text-primary/5 text-text-muted rounded-[22px] flex items-center justify-center transition-all group-hover:bg-brand-blue/10 group-hover:text-brand-blue group-hover:shadow-[0_0_20px_rgba(var(--brand-blue-rgb),0.1)]">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-[1000] text-text-primary uppercase text-xs tracking-widest mb-1.5">
                                            {monthNames[payslip.period.month - 1]} <span className="text-text-muted">{payslip.period.year}</span>
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-[1000] text-emerald-500 tracking-tight">{formatCurrency(payslip.netSalary)}</span>
                                            <div className="h-1 w-1 rounded-full bg-text-muted/20" />
                                            <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em]">Folha Mensal</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-12 w-12 rounded-2xl bg-text-primary/5 flex items-center justify-center text-text-muted transition-all group-hover:text-brand-orange group-hover:bg-text-primary/10">
                                    <ChevronRight className="h-6 w-6" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {selectedPayslip && (
                <PayslipViewModal
                    payslip={selectedPayslip}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
