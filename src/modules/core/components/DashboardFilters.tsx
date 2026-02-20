'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/shared/components/ui/label';

interface FiltersProps {
    companies: { id: string, name: string }[];
    stores: { id: string, name: string }[];
}

export function DashboardFilters({ companies, stores }: FiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Empresa</Label>
                <select
                    className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer pr-4"
                    onChange={(e) => handleFilterChange('companyId', e.target.value)}
                    value={searchParams.get('companyId') || 'all'}
                >
                    <option value="all">TODAS EMPRESAS</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            <div className="w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loja / Unidade</Label>
                <select
                    className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer pr-4"
                    onChange={(e) => handleFilterChange('storeId', e.target.value)}
                    value={searchParams.get('storeId') || 'all'}
                >
                    <option value="all">TODAS LOJAS</option>
                    {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
