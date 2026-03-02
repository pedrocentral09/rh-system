import { getCareerPaths } from '@/modules/career/actions/career-paths';
import { getJobRoles } from '@/modules/configuration/actions/auxiliary';
import { CareerPathEditor } from '@/modules/career/components/CareerPathEditor';

export default async function CareerPage() {
    const [pathsResult, rolesResult] = await Promise.all([
        getCareerPaths(),
        getJobRoles(),
    ]);

    const paths = pathsResult.data || [];
    const jobRoles = rolesResult.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="text-3xl">🌳</span> Plano de Carreira
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Configure trilhas de progressão de cargos com requisitos claros para cada nível.
                </p>
            </div>

            <CareerPathEditor initialPaths={paths as any} jobRoles={jobRoles as any} />
        </div>
    );
}
