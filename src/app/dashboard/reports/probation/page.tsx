import { requireAuth } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { ProbationClientBoard } from './ProbationClientBoard';

export default async function ProbationReportPage() {
    await requireAuth(['ADMIN', 'MANAGER']);

    const employees = await prisma.employee.findMany({
        where: {
            status: 'ACTIVE',
            contract: { isExperienceContract: true }
        },
        select: {
            id: true,
            name: true,
            photoUrl: true,
            jobTitle: true,
            department: true,
            contract: {
                select: {
                    admissionDate: true,
                    experienceDays: true,
                    isExperienceExtended: true,
                    experienceExtensionDays: true,
                    isExperienceExtended2: true,
                    experienceExtension2Days: true,
                    store: { select: { name: true } }
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <Link href="/dashboard/reports" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-indigo-400 transition-colors mb-4 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        VOLTAR PARA RELATÓRIOS
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-0.5 w-8 bg-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Módulo de Controle Real-Time</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-text-primary tracking-tighter uppercase leading-tight italic">
                        Períodos de <span className="text-indigo-500">Experiência</span>
                    </h1>
                    <p className="text-text-muted font-bold block text-[10px] lg:text-[11px] mt-4 uppercase tracking-[0.1em] opacity-80">
                        Acompanhamento inteligente de vencimentos e prorrogações ativas
                    </p>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4 text-indigo-400">
                    <Clock className="w-5 h-5" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Total Monitorado</p>
                        <p className="text-xl font-bold font-mono tracking-tight leading-none">{employees.length}</p>
                    </div>
                </div>
            </div>

            <ProbationClientBoard employees={employees} />
        </div>
    );
}
