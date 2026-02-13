import { getCurrentUser } from '@/modules/core/actions/auth';

export default async function DebugPage() {
    const user = await getCurrentUser();

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug de Usuário</h1>
            <div className="bg-slate-100 p-4 rounded-md font-mono text-sm whitespace-pre-wrap text-slate-900 border border-slate-300">
                {JSON.stringify(user, null, 2)}
            </div>
            <p className="text-sm text-slate-500">
                Tire um print desta tela e me mostre se o campo "roleDef" está aparecendo e qual o "name" dele.
            </p>
        </div>
    );
}
