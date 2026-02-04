'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { getCompanies, createCompany, deleteCompany } from '../actions/companies';
import { toast } from 'sonner';

export function CompanyList() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', cnpj: '', city: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { load() }, []);

    async function load() {
        const res = await getCompanies();
        if (res.success) setCompanies(res.data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await createCompany(formData);
        if (res.success) {
            toast.success('Empresa adicionada!');
            setIsModalOpen(false);
            setFormData({ name: '', cnpj: '', city: '' });
            load();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Excluir empresa?')) return;
        const res = await deleteCompany(id);
        if (res.success) {
            toast.success('Excluída!');
            load();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="text-slate-900 dark:text-white">Empresas (CNPJs)</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Entidades legais para registro de funcionários.</CardDescription>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white">
                    + Nova Empresa
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {companies.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{comp.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">CNPJ: {comp.cnpj} • {comp._count?.contracts || 0} funcionários</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 h-8" onClick={() => handleDelete(comp.id)}>
                                🗑️
                            </Button>
                        </div>
                    ))}
                    {companies.length === 0 && <div className="text-center text-slate-400 py-4">Nenhuma empresa cadastrada.</div>}
                </div>
            </CardContent>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Empresa">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Razão Social / Nome</label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Empresa LTDA" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">CNPJ</label>
                        <Input value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} required placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Cidade (Opcional)</label>
                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="São Paulo" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
