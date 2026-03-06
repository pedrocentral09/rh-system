import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import { ChangePinForm } from '@/modules/core/components/ChangePinForm';

export const metadata = {
    title: 'Trocar PIN — Portal do Colaborador',
};

export default async function ChangePinPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login/colaborador');

    // Get employee linked to this user
    const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true, pinMustChange: true },
    });

    if (!employee) redirect('/portal');

    return (
        <ChangePinForm
            employeeId={employee.id}
            isFirstAccess={employee.pinMustChange ?? true}
        />
    );
}
