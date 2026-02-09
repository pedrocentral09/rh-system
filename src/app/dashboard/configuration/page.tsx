import { ConfigurationTabs } from '@/modules/configuration/components/ConfigurationTabs';

export default function ConfigurationPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">⚙️ Configurações</h2>
                    <p className="text-slate-500">Gerencie os dados da empresa e permissões do sistema.</p>
                </div>
            </div>

            <ConfigurationTabs />
        </div>
    );
}
