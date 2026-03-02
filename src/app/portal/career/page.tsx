import { getEmployeeCareerPath } from '@/modules/career/actions/employee-career';
import { EmployeeCareerPath } from '@/modules/career/components/EmployeeCareerPath';

export default async function PortalCareerPage() {
    const response = await getEmployeeCareerPath();

    if (!response.success) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <span className="text-4xl text-red-500 mb-4">❌</span>
                <p className="text-slate-600 font-medium">{response.error || 'Erro ao carregar plano de carreira.'}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EmployeeCareerPath careerData={response.data as any} />
        </div>
    );
}
