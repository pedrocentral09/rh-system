'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { getMyComplianceStatus } from '@/modules/configuration/actions/compliance';
import Link from 'next/link';

export function ComplianceWidget() {
    const [compliance, setCompliance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getMyComplianceStatus();
            if (res.success) setCompliance(res.data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading || !compliance || compliance.totalMandatory === 0) return null;

    const isFull = compliance.complianceScore === 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2.5rem] border ${isFull ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} backdrop-blur-xl relative overflow-hidden`}
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${isFull ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'}`}>
                        {isFull ? <ShieldCheck className="h-6 w-6 text-emerald-400" /> : <AlertCircle className="h-6 w-6 text-rose-400" />}
                    </div>
                    <div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isFull ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isFull ? 'Conformidade Legal Ativa' : 'Pendência de Documentação'}
                        </h4>
                        <p className="text-white font-bold text-sm tracking-tight">
                            {isFull
                                ? 'Todos os seus documentos obrigatórios foram assinados.'
                                : `Você possui ${compliance.pendingDocs.length} documentos pendentes de assinatura.`}
                        </p>
                    </div>
                </div>

                {!isFull && (
                    <Link href="/portal/documents">
                        <button className="px-6 py-3 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all group">
                            Resolver Agora
                            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${compliance.complianceScore}%` }}
                    className={`h-full ${isFull ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(var(--brand-rose-rgb),0.5)]`}
                />
            </div>
        </motion.div>
    );
}
