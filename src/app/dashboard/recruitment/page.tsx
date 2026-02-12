
import { getJobs } from '@/modules/recruitment/actions/jobs';
import { getCandidates } from '@/modules/recruitment/actions/list-candidates';
import { JobList } from '@/modules/recruitment/components/JobList';
import { CandidateList } from '@/modules/recruitment/components/CandidateList';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function RecruitmentPage() {
    const { data: jobs } = await getJobs();
    const { data: candidates } = await getCandidates();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recrutamento</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestão de Vagas e Banco de Talentos</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/careers" target="_blank">
                        <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                            🌐 Ver Site de Vagas
                        </Button>
                    </Link>
                    <Link href="/dashboard/recruitment/new">
                        <Button className="bg-[#FF7800] hover:bg-orange-600 text-white">
                            + Nova Vaga
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="jobs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="jobs">Vagas Abertas</TabsTrigger>
                    <TabsTrigger value="candidates">Banco de Currículos</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="mt-4">
                    <JobList jobs={jobs || []} />
                </TabsContent>

                <TabsContent value="candidates" className="mt-4">
                    <CandidateList candidates={candidates || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
