'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Building, Store } from 'lucide-react';

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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 px-4 py-2">
            {/* Organizations */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-brand-orange/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <Building className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="company-filter" className="text-[9px] font-black uppercase text-text-muted tracking-widest opacity-50 mb-0.5 cursor-pointer">Organização</label>
                    <div className="relative">
                        <select
                            id="company-filter"
                            aria-label="Filtrar por Organização"
                            className="appearance-none bg-transparent text-xs font-bold text-text-primary uppercase tracking-tight outline-none cursor-pointer pr-6 group-hover:text-brand-orange transition-colors"
                            onChange={(e) => handleFilterChange('companyId', e.target.value)}
                            value={searchParams.get('companyId') || 'all'}
                        >
                            <option value="all" className="bg-surface text-text-primary">Todas as Unidades</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id} className="bg-surface text-text-primary">{c.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted opacity-30 group-hover:text-brand-orange group-hover:opacity-100 transition-all">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branches */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-brand-orange/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="store-filter" className="text-[9px] font-black uppercase text-text-muted tracking-widest opacity-50 mb-0.5 cursor-pointer">Filial Operacional</label>
                    <div className="relative">
                        <select
                            id="store-filter"
                            aria-label="Filtrar por Filial Operacional"
                            className="appearance-none bg-transparent text-xs font-bold text-text-primary uppercase tracking-tight outline-none cursor-pointer pr-6 group-hover:text-brand-orange transition-colors"
                            onChange={(e) => handleFilterChange('storeId', e.target.value)}
                            value={searchParams.get('storeId') || 'all'}
                        >
                            <option value="all" className="bg-surface text-text-primary">Unidade Geral</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id} className="bg-surface text-text-primary">{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted opacity-30 group-hover:text-brand-orange group-hover:opacity-100 transition-all">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
