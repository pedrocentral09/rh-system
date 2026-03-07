
import { getEmployeeDocuments } from '@/modules/payroll/actions/employee-portal';
import DocumentsClient from './DocumentsClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalDocumentsPage() {
    const result = await getEmployeeDocuments();
    const documents = result.success ? result.data || [] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/portal" className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Documentos</h1>
                    <p className="text-sm text-slate-500 font-medium">Acesse seus arquivos e registros digitais.</p>
                </div>
            </div>

            <DocumentsClient documents={documents} />
        </div>
    );
}
