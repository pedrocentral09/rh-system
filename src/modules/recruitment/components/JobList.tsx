
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export function JobList({ jobs }: { jobs: any[] }) {
    return (
        <div className="space-y-4">
            {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                {job.title}
                            </CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {job.department} • {job.type} • {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            job.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {job.status}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-indigo-600">
                                {job._count.applications} Candidatos
                            </span>
                            <div className="flex gap-2">
                                <Link href={`/dashboard/recruitment/${job.id}`}>
                                    <Button variant="outline" size="sm">Gerenciar</Button>
                                </Link>
                                <Link href={`/dashboard/recruitment/${job.id}/edit`}>
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {jobs.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    Nenhuma vaga encontrada.
                </div>
            )}
        </div>
    );
}
