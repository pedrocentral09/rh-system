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
        <div className="flex flex-wrap items-center gap-6 px-6 py-2 bg-transparent">
            {/* Business Unit Selector */}
            <div className="flex flex-col gap-1.5 transition-all duration-300 group">
                <Label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-brand-orange" />
                    Organização
                </Label>
                <div className="relative">
                    <select
                        className="appearance-none bg-transparent text-xs font-black text-text-primary uppercase tracking-wider outline-none cursor-pointer pr-8 py-1 hover:text-brand-orange transition-colors"
                        onChange={(e) => handleFilterChange('companyId', e.target.value)}
                        value={searchParams.get('companyId') || 'all'}
                    >
                        <option value="all" className="bg-surface text-text-primary">Todas as Unidades</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id} className="bg-surface text-text-primary">{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                </div>
            </div>

            <div className="w-[1px] h-8 bg-border/20 self-center" />

            {/* Store/Branch Selector */}
            <div className="flex flex-col gap-1.5 transition-all duration-300 group">
                <Label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-brand-orange/50" />
                    Filial Operacional
                </Label>
                <div className="relative">
                    <select
                        className="appearance-none bg-transparent text-xs font-black text-text-primary uppercase tracking-wider outline-none cursor-pointer pr-8 py-1 hover:text-brand-orange transition-colors"
                        onChange={(e) => handleFilterChange('storeId', e.target.value)}
                        value={searchParams.get('storeId') || 'all'}
                    >
                        <option value="all" className="bg-surface text-text-primary">Unidade Geral</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id} className="bg-surface text-text-primary">{s.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
