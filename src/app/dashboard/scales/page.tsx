import { getShiftTypes } from '@/modules/scales/actions';
import { ShiftManageForm } from '@/modules/scales/components/ShiftManageForm';
import { WeeklyScaleBuilder } from '@/modules/scales/components/WeeklyScaleBuilder';
import { Tabs } from '@/shared/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function ScalesPage() {
    const { data: shifts } = await getShiftTypes();

    return (
        <div className="space-y-6 pb-24">


            <Tabs
                defaultValue="builder"
                fullContent={true}
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
