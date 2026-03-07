
import { getEmployeeCareerPath } from '@/modules/career/actions/employee-career';
import CareerPathClient from './CareerPathClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalCareerPage() {
    const careerResult = await getEmployeeCareerPath();
    const careerData = careerResult.success ? careerResult.data : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/portal" className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Carreira</h1>
                    <p className="text-sm text-slate-500 font-medium">Sua trilha de evolução na empresa.</p>
                </div>
            </div>

            <CareerPathClient careerData={careerData} />
        </div>
    );
}
