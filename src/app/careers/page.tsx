import { getJobs, getTalentBankJob } from './actions';
import { Button } from '@/shared/components/ui/button';
import { TalentBankCard } from './components/TalentBankCard';
import { ApplyJobDialog } from './components/ApplyJobDialog';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, MapPin, Clock, ArrowRight, ChevronRight, Search, Star } from 'lucide-react';

export const metadata = {
    title: 'Carreiras | Rede Família',
    description: 'Faça parte do nosso time. Descubra oportunidades e potencialize sua trajetória.',
};

export default async function CareersPage() {
    const { data: jobsRaw } = await getJobs();
    const { data: talentBankRaw } = await getTalentBankJob();

    // Serialize Prisma objects (Decimal/Date) to plain JSON for Client Components
    const jobs = JSON.parse(JSON.stringify(jobsRaw));
    const talentBank = JSON.parse(JSON.stringify(talentBankRaw));

    const openJobs = jobs?.filter((j: any) => j.status === 'OPEN' && j.title !== 'Banco de Talentos') || [];

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col font-sans selection:bg-brand-orange/30 text-white relative overflow-x-hidden">
            {/* Ambient Backgrounds */}
            <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-brand-orange/5 blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Premium Header */}
            <header className="border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-24 flex justify-between items-center max-w-7xl">
                    <Link href="/careers" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-brand-orange/20 transition-all duration-500">
                            <Image
                                src="/logo.jpg"
                                alt="Logo"
                                width={60}
                                height={60}
                                className="w-10 h-10 object-contain rounded-xl"
                            />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-white font-black uppercase tracking-tighter text-lg leading-none">Rede Família</span>
                            <span className="text-brand-orange text-[10px] font-black uppercase tracking-[0.3em]">Talent Portal</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#vagas" className="text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Ver Oportunidades</a>
                        <a href="#banco" className="text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Banco de Talentos</a>
                    </nav>

                    <Button variant="outline" className="hidden border-white/10 hover:bg-white/5 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest transition-all">
                        Portal Interno
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange mb-8">
                        <Star className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Oportunidades Abertas</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-8 tracking-tighter leading-[0.9] uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 pb-2">
                        Construa seu futuro <br />
                        <span className="text-brand-orange drop-shadow-[0_0_30px_rgba(255,120,0,0.3)]">conosco.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        Mais do que empregos, oferecemos carreiras. Junte-se a uma equipe apaixonada por excelência e em constante crescimento.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#vagas" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[0_0_40px_rgba(255,120,0,0.3)] hover:shadow-[0_0_60px_rgba(255,120,0,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3">
                            Explorar Vagas
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#banco" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center backdrop-blur-md">
                            Banco de Talentos
                        </a>
                    </div>
                </div>
            </section>

            {/* Talent Bank Promo Section */}
            <section id="banco" className="container mx-auto px-6 py-12 max-w-6xl relative z-20">
                {talentBank && <TalentBankCard talentBank={talentBank} />}
            </section>

            {/* Open Positions */}
            <main id="vagas" className="flex-1 container mx-auto px-6 py-24 max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                            Vagas <span className="text-brand-orange">Disponíveis</span>
                        </h2>
                        <p className="text-slate-400 font-medium mt-3 text-sm md:text-base">Encontre a posição perfeita para o seu perfil e momento de carreira.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 py-3 px-6 rounded-2xl backdrop-blur-md">
                        <div className="flex flex-col text-right">
                            <span className="text-2xl font-black text-white leading-none">{openJobs.length}</span>
                            <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">Abertas Agora</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 space-y-4">
                    {openJobs.map((job: any, index: number) => (
                        <div key={job.id}
                            className="group bg-white/[0.02] border border-white/5 hover:border-brand-orange/30 rounded-3xl p-6 md:p-8 transition-all duration-500 hover:bg-white/[0.04] flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative overflow-hidden">

                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-orange/0 via-brand-orange/0 to-brand-orange/0 group-hover:via-brand-orange/50 transition-all duration-700" />

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                        {job.department}
                                    </span>
                                    {index === 0 && (
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Destaque
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-brand-orange transition-colors uppercase tracking-tight">
                                    {job.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                        {job.type}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        {job.location || 'Presencial'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        Tempo Integral
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 shrink-0 mt-4 lg:mt-0">
                                <Link href={`/careers/${job.id}`} className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center">
                                    Detalhes
                                </Link>
                                <div className="flex-1 sm:flex-none">
                                    <ApplyJobDialog job={job} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {openJobs.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-sm">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                                <Search className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Nenhuma vaga direta no momento</h3>
                            <p className="text-slate-400 max-w-md mx-auto text-sm">
                                Nossas equipes estão completas, mas você pode se inscrever no Banco de Talentos para oportunidades futuras.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#0A0F1C]/90 backdrop-blur-xl py-12 relative z-20">
                <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Image src="/logo.jpg" alt="Logo" width={30} height={30} className="rounded-lg object-contain" />
                        </div>
                        <span className="font-black text-white uppercase tracking-tighter">Rede Família</span>
                    </div>

                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} GESTÃO DE TALENTOS. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>
        </div>
    );
}
