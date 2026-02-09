
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toggleTaskStatus } from '@/modules/onboarding/actions/processes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function OnboardingList({ processes }: { processes: any[] }) {
    const router = useRouter();

    async function handleToggle(taskId: string, currentStatus: string) {
        // Optimistic update could go here
        const result = await toggleTaskStatus(taskId, currentStatus);
        if (result.success) {
            toast.success('Tarefa atualizada');
            router.refresh();
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processes.map((proc) => {
                const completedCount = proc.tasks.filter((t: any) => t.status === 'DONE').length;
                const totalCount = proc.tasks.length;
                const progress = Math.round((completedCount / totalCount) * 100);

                return (
                    <Card key={proc.id} className="border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-bold">
                                    {proc.candidate?.name || proc.employee?.name || 'Novo Colaborador'}
                                </CardTitle>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                    {progress}% Completo
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Iniciado em: {new Date(proc.startDate).toLocaleDateString()}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {proc.tasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-2 group">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'DONE'}
                                            onChange={() => handleToggle(task.id, task.status)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        />
                                        <div className="flex-1 text-sm">
                                            <span className={task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700'}>
                                                {task.title}
                                            </span>
                                            <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">
                                                {task.assignedTo}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {processes.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    Nenhum processo de onboarding ativo.
                </div>
            )}
        </div>
    );
}
