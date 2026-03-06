import { EmployeeLoginForm } from '@/modules/core/components/EmployeeLoginForm';

export const metadata = {
    title: 'Acesso do Colaborador',
    description: 'Portal de acesso para colaboradores via CPF e PIN.',
};

export default function EmployeeLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 relative px-4">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-slate-100/40 -z-10" />
            <EmployeeLoginForm />
        </div>
    );
}
