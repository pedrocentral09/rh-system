
import { getJobs } from '@/modules/recruitment/actions/jobs';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export const metadata = {
    title: 'Carreiras | Trabalhe Conosco',
    description: 'Confira nossas vagas abertas e venha fazer parte do time.',
};

export default async function CareersPage() {
    const { data: jobs } = await getJobs();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b py-6 sticky top-0 z-10">
                <div className="container mx-auto px-4 flex justify-between items-center max-w-4xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FF7800] rounded-lg"></div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">Sistema RH</span>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                        <a href="#" className="hover:text-[#FF7800]">Sobre Nós</a>
                        <a href="#" className="hover:text-[#FF7800]">Cultura</a>
                        <a href="#" className="hover:text-[#FF7800]">Vagas</a>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Construa o futuro com a gente.</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                        Estamos sempre em busca de talentos que queiram fazer a diferença. Confira nossas posições abertas abaixo.
                    </p>
                </div>
            </section>

            {/* Jobs List */}
            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-8">Vagas Disponíveis</h2>

                <div className="grid gap-4">
                    {jobs?.filter((j: any) => j.status === 'OPEN').map((job: any) => (
                        <div key={job.id} className="bg-white p-6 rounded-lg border border-slate-200 hover:border-[#FF7800] transition-colors group flex justify-between items-center shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#FF7800] transition-colors">{job.title}</h3>
                                <div className="flex gap-3 mt-2 text-sm text-slate-500">
                                    <span>{job.department}</span>
                                    <span>•</span>
                                    <span>{job.type}</span>
                                </div>
                            </div>
                            <Link href={`/careers/${job.id}`}>
                                <Button className="bg-slate-900 hover:bg-[#FF7800] text-white">
                                    Ver Detalhes
                                </Button>
                            </Link>
                        </div>
                    ))}

                    {(!jobs || jobs.filter((j: any) => j.status === 'OPEN').length === 0) && (
                        <div className="text-center py-12 bg-white rounded-lg border text-slate-500">
                            Nenhuma vaga aberta no momento.
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 py-8 border-t">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    © 2024 Sistema RH. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
