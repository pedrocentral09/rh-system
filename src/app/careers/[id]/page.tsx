
import { getPublicJob } from '../actions';
import { ApplicationForm } from '../components/ApplicationForm';
import Link from 'next/link';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const { data: job } = await getPublicJob(params.id);

    if (!job) return <div>Vaga não encontrada.</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/careers" className="text-sm font-medium text-slate-500 hover:text-[#FF7800]">
                        ← Voltar para Vagas
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                        <p className="text-slate-500 mt-2">{job.department} • {job.type}</p>
                    </div>

                    <div className="prose prose-slate max-w-none bg-white p-6 rounded-lg border">
                        <h3 className="text-lg font-bold mb-2">Descrição da Vaga</h3>
                        <p className="whitespace-pre-wrap text-slate-600">
                            {job.description}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <div className="sticky top-8">
                        <ApplicationForm job={job} />
                    </div>
                </div>
            </main>
        </div>
    );
}
