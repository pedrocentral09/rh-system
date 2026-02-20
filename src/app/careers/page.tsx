
import { getJobs, getTalentBankJob } from './actions';
import { Button } from '@/shared/components/ui/button';
import { TalentBankCard } from './components/TalentBankCard';
import { ApplyJobDialog } from './components/ApplyJobDialog';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: 'Trabalhe Conosco | Rede Família Supermercados',
    description: 'Faça parte da nossa família. Confira nossas vagas abertas e cadastre seu currículo em nosso banco de talentos.',
};

export default async function CareersPage() {
    const { data: jobsRaw } = await getJobs();
    const { data: talentBankRaw } = await getTalentBankJob();

    // Serialize Prisma objects (Decimal/Date) to plain JSON for Client Components
    const jobs = JSON.parse(JSON.stringify(jobsRaw));
    const talentBank = JSON.parse(JSON.stringify(talentBankRaw));

    const openJobs = jobs?.filter((j: any) => j.status === 'OPEN' && j.title !== 'Banco de Talentos') || [];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 italic-none">
            {/* Header */}
            <header className="bg-white border-b py-4 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
                    <div className="flex items-center gap-4">
                        <Link href="/careers">
                            <Image
                                src="/logo.jpg"
                                alt="Rede Família Supermercados"
                                width={180}
                                height={60}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-bold text-[#001B3D] uppercase tracking-wider">
                        <a href="#vagas" className="hover:text-[#FF7800] transition-colors">Vagas Abertas</a>
                        <a href="#banco" className="hover:text-[#FF7800] transition-colors">Banco de Talentos</a>
                        <a href="#" className="hover:text-[#FF7800] transition-colors">Nossas Lojas</a>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-[#001B3D] text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#001B3D] via-[#002654] to-[#001B3D] opacity-50"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF7800] rounded-full blur-[120px] opacity-20"></div>

                <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
                    <span className="inline-block bg-[#FF7800] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6">
                        Carreiras Rede Família
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight uppercase">
                        Vem pra nossa <span className="text-[#FF7800]">Família!</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                        Somos mais que um supermercado, somos uma comunidade. Inicie sua trajetória profissional com a gente e cresça junto com a Rede Família.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#vagas">
                            <Button className="bg-[#FF7800] hover:bg-orange-600 text-white font-bold py-7 px-10 text-lg rounded-xl shadow-xl transition-all shadow-orange-900/20">
                                Ver Oportunidades
                            </Button>
                        </a>
                        <a href="#banco">
                            <Button variant="outline" className="border-2 border-white/20 hover:bg-white/10 text-white font-bold py-7 px-10 text-lg rounded-xl backdrop-blur-sm">
                                Banco de Talentos
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Talent Bank Section */}
            <section id="banco" className="container mx-auto px-4 pt-12 max-w-5xl -mt-10 relative z-20">
                {talentBank && <TalentBankCard talentBank={talentBank} />}
            </section>

            {/* Jobs List */}
            <main id="vagas" className="flex-1 container mx-auto px-4 py-20 max-w-5xl">
                <div className="flex items-center justify-between mb-12 border-b border-slate-200 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-[#001B3D] uppercase tracking-tighter">Vagas <span className="text-[#FF7800]">Abertas</span></h2>
                        <p className="text-slate-500 font-medium mt-1">Confira nossas posições disponíveis em diversas áreas.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <span className="text-3xl font-black text-slate-200">{openJobs.length}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-[-4px]">Oportunidades</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {openJobs.map((job: any) => (
                        <div key={job.id} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#FF7800]/30 transition-all group flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-xl hover:shadow-orange-900/5">
                            <div className="w-full">
                                <span className="inline-block bg-slate-100 text-[#001B3D] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-3">
                                    {job.department}
                                </span>
                                <h3 className="text-2xl font-black text-[#001B3D] group-hover:text-[#FF7800] transition-colors leading-tight uppercase tracking-tight">{job.title}</h3>
                                <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF7800]"></div>
                                        {job.type}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        Presencial
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 md:mt-0 w-full md:w-auto flex flex-col gap-2">
                                <ApplyJobDialog job={job} />
                                <Link href={`/careers/${job.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center hover:text-[#001B3D] transition-colors">
                                    Ver Detalhes da Vaga
                                </Link>
                            </div>
                        </div>
                    ))}

                    {openJobs.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
                            <div className="text-5xl mb-4">🛒</div>
                            <h3 className="text-xl font-bold text-slate-400">Nenhuma vaga operacional aberta no momento.</h3>
                            <p className="text-slate-400 mt-2 max-w-sm mx-auto">Mas não se preocupe! Você ainda pode se cadastrar em nosso banco de talentos clicando no botão laranja acima.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t">
                <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <Image
                        src="/logo.jpg"
                        alt="Rede Família Supermercados"
                        width={140}
                        height={40}
                        className="h-8 w-auto grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100"
                    />
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        © 2024 REDE FAMÍLIA SUPERMERCADOS. GESTÃO DE TALENTOS.
                    </div>
                </div>
            </footer>
        </div>
    );
}
