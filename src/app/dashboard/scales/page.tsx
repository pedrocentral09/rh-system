import { getShiftTypes } from '@/modules/scales/actions';
import { ShiftManageForm } from '@/modules/scales/components/ShiftManageForm';
import { WeeklyScaleBuilder } from '@/modules/scales/components/WeeklyScaleBuilder';
import { Tabs } from '@/shared/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function ScalesPage() {
    const { data: shifts } = await getShiftTypes();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">🗓️ Gestão de Escalas</h2>
                    <p className="text-slate-500">Planeje a jornada de trabalho da equipe.</p>
                </div>
            </div>

            <Tabs
                defaultValue="builder"
                tabs={[
                    {
                        id: 'builder',
                        label: 'Escala Semanal',
                        content: <WeeklyScaleBuilder shiftTypes={shifts || []} />
                    },
                    {
                        id: 'shifts',
                        label: 'Configurar Turnos',
                        content: <ShiftManageForm existingShifts={shifts || []} />
                    }
                ]}
            />
        </div>
    );
}
