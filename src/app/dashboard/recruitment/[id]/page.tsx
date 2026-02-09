
import { getJobDetails } from '@/modules/recruitment/actions/candidates';
import { JobKanban } from '@/modules/recruitment/components/JobKanban';
import { CandidateForm } from '@/modules/recruitment/components/CandidateForm';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const { data: job } = await getJobDetails(params.id);

    if (!job) {
        return <div>Vaga não encontrada</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {job.department} • {job.status}
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-[#FF7800] hover:bg-orange-600 text-white">
                            + Adicionar Candidato
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Candidato</DialogTitle>
                        </DialogHeader>
                        <CandidateForm jobId={job.id} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-x-auto">
                <JobKanban job={job as any} />
            </div>
        </div>
    );
}
