
import { JobForm } from '@/modules/recruitment/components/JobForm';

export default function NewJobPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nova Vaga</h1>
                <p className="text-slate-500 dark:text-slate-400">Preencha os dados abaixo para abrir uma nova posição.</p>
            </div>

            <JobForm />
        </div>
    );
}
