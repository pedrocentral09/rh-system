
import { getJobById } from '@/modules/recruitment/actions/jobs';
import { JobForm } from '@/modules/recruitment/components/JobForm';
import Link from 'next/link';

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { data: job } = await getJobById(params.id);

    if (!job) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold">Vaga não encontrada</h2>
                <Link href="/dashboard/recruitment" className="text-indigo-600 hover:underline mt-4 inline-block">
                    Voltar para lista
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Vaga</h1>
                <p className="text-slate-500 dark:text-slate-400">Atualize as informações da oportunidade.</p>
            </div>

            <JobForm initialData={job} />
        </div>
    );
}
