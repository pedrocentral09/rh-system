import { getPublicJob } from '../actions';
import { ApplicationForm } from '../components/ApplicationForm';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Briefcase, MapPin, Clock, HelpCircle } from 'lucide-react';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: job } = await getPublicJob(id);

    if (!job) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
            <div className="text-center relative z-10 w-full max-w-md p-12 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-md">
                <div className="absolute inset-0 bg-brand-orange/5 blur-[80px] rounded-full pointer-events-none" />
                <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Vaga não encontrada</h1>
                <Link href="/careers" className="inline-block h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center">
                    Voltar para Carreiras
                </Link>
            </div>
        </div>
    );

    const isTalentBank = job.title === 'Banco de Talentos';

    return (
        <div className="min-h-screen bg-[#0A0F1C] font-sans selection:bg-brand-orange/30 text-white relative overflow-x-hidden pb-20">
            {/* Ambient Backgrounds */}
            <div className="fixed top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-brand-orange/5 blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-0 right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Header */}
            <header className="border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-24 flex justify-between items-center max-w-7xl">
                    <Link href="/careers" className="flex items-center gap-3 group px-4 py-2 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Voltar para Vagas</span>
                    </Link>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Image src="/logo.jpg" alt="Rede Família" width={60} height={60} className="w-10 h-10 object-contain rounded-xl" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16 max-w-7xl grid lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-7 xl:col-span-8 space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                {job.department}
                            </span>
                            {isTalentBank && (
                                <span className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                                    Vagas Contínuas
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                            {isTalentBank ? 'Banco de ' : ''}<span className="text-brand-orange">{isTalentBank ? 'Talentos' : job.title}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-8">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-500" />
                                {job.type}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                {(job as any).location || 'Presencial'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                Tempo Integral
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] transition-all duration-700 pointer-events-none group-hover:bg-brand-orange/10" />

                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                            </div>
                            Descrição da Oportunidade
                        </h3>
                        <div className="prose prose-invert prose-p:text-slate-400 prose-p:leading-relaxed prose-headings:text-white prose-li:text-slate-400 prose-strong:text-slate-200 max-w-none">
                            <p className="whitespace-pre-wrap font-medium">
                                {job.description}
                            </p>
                        </div>
                    </div>

                    {isTalentBank && (
                        <div className="p-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xl">ℹ️</span>
                            </div>
                            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                                <strong className="text-indigo-400">Nota Estratégica:</strong> Este é o nosso canal oficial de banco de currículos. Mesmo que não tenhamos uma vaga específica agora, seu perfil permanecerá ativo em nossa base prioritária de talentos, sendo avaliado em futuras expansões da Rede Família.
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 xl:col-span-4 relative">
                    <div className="sticky top-32 bg-[#0A0F1C]/95 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange via-orange-500 to-amber-500" />
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-orange/10 blur-[60px] pointer-events-none" />

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 mt-2">
                            Inicie sua <br /><span className="text-brand-orange">Candidatura</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-8">
                            PREENCHA OS DADOS ABAIXO PARA CONTINUAR
                        </p>

                        <ApplicationForm job={job} />
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5 bg-[#0A0F1C]/90 backdrop-blur-xl py-12 relative z-20 mt-20">
                <div className="container mx-auto px-6 max-w-6xl flex flex-col items-center gap-6 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} GESTÃO DE TALENTOS REDE FAMÍLIA.
                    </div>
                </div>
            </footer>
        </div>
    );
}
