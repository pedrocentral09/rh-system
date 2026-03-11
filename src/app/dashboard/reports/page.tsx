import { ReportGeneratorWizard } from '@/modules/reports/components/ReportGeneratorWizard';
import { requireAuth } from '@/modules/core/actions/auth';
import { BarChart3, ShieldCheck, Download, Zap } from 'lucide-react';

export default async function ReportsPage() {
    // Audit check: Only Admins can see this page
    await requireAuth(['ADMIN']);

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-0.5 w-8 bg-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">Célula de Inteligência</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-text-primary tracking-tighter uppercase leading-tight italic">
                        Relatórios <span className="text-brand-orange">Corporativos</span>
                    </h1>
                    <p className="text-text-muted font-bold tracking-tight text-[10px] lg:text-[11px] mt-4 uppercase tracking-[0.1em] opacity-80">
                        Auditagem de Ativos, Projeções Financeiras e Conformidade Legal
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-surface-secondary border border-border flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Acesso Restrito: Nível 01</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2">
                    <ReportGeneratorWizard />
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 blur-3xl" />
                        <Zap className="h-10 w-10 text-brand-orange mb-6 animate-pulse" />
                        <h4 className="text-lg font-black uppercase tracking-tight italic mb-4">Dica de Exportação</h4>
                        <p className="text-xs font-bold text-white/60 leading-relaxed uppercase tracking-wider">
                            Use o formato <span className="text-emerald-400">EXCEL</span> para auditorias cruzadas e reconciliação de folha. O <span className="text-brand-orange">PDF</span> é recomendado para apresentações de diretoria e registros físicos.
                        </p>
                    </div>

                    <div className="p-8 bg-surface-secondary border border-border border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                        <BarChart3 className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">O Gerador opera com latência <br /> zero sobre o banco de dados oficial.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
