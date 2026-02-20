
import { getPublicJob } from '../actions';
import { ApplicationForm } from '../components/ApplicationForm';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: job } = await getPublicJob(id);

    if (!job) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">Vaga não encontrada.</h1>
                <Link href="/careers">
                    <Button className="mt-4 bg-[#001B3D] hover:bg-[#FF7800]">Voltar para Carreiras</Button>
                </Link>
            </div>
        </div>
    );

    const isTalentBank = job.title === 'Banco de Talentos';

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100">
            {/* Header */}
            <header className="bg-[#001B3D] py-6 shadow-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 max-w-4xl flex justify-between items-center">
                    <Link href="/careers" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-[#FF7800] transition-colors">
                            ←
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-widest hidden sm:inline">Voltar para Vagas</span>
                    </Link>
                    <Image
                        src="/logo.jpg"
                        alt="Rede Família"
                        width={120}
                        height={40}
                        className="h-8 w-auto brightness-0 invert opacity-90"
                    />
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-5xl grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <span className="inline-block bg-orange-100 text-[#FF7800] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-3">
                            {job.department}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-[#001B3D] uppercase tracking-tighter leading-none">
                            {isTalentBank ? 'Banco de ' : ''}<span className="text-[#FF7800]">{isTalentBank ? 'Talentos' : job.title}</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {job.type} • Presencial
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-[#001B3D] uppercase tracking-tight mb-6 border-b pb-4">
                            Descrição da Oportunidade
                        </h3>
                        <div className="prose prose-slate max-w-none">
                            <p className="whitespace-pre-wrap text-slate-600 font-medium leading-relaxed">
                                {job.description}
                            </p>
                        </div>
                    </div>

                    {isTalentBank && (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 italic-none">
                            <p className="text-blue-800 text-sm font-medium">
                                <strong>Nota:</strong> Este é o nosso canal oficial de banco de currículos. Mesmo que não tenhamos uma vaga específica agora, seu perfil ficará em nossa base prioritária para futuras expansões e aberturas na Rede Família.
                            </p>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100">
                        <h3 className="text-lg font-black text-[#001B3D] uppercase tracking-tight mb-6">
                            Inicie sua <span className="text-[#FF7800]">Candidatura</span>
                        </h3>
                        <ApplicationForm job={job} />
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    © 2024 Rede Família Supermercados • Trabalhe Conosco
                </p>
            </footer>
        </div>
    );
}
