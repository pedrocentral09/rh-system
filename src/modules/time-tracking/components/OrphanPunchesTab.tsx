'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { getOrphanPunches } from '../actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldAlert, RefreshCw, UserPlus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/shared/components/ui/input';

export function OrphanPunchesTab() {
    const [orphans, setOrphans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrphans = async () => {
        setLoading(true);
        const res = await getOrphanPunches();
        if (res.success && res.data) {
            setOrphans(res.data);
        } else {
            toast.error('Erro ao carregar registros sem vínculo.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrphans();
    }, []);

    const filtered = orphans.filter(o => o.pis.includes(searchTerm));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Registros sem Vínculo</h2>
                    <p className="text-sm text-slate-500">PIS/CPF encontrados no relógio que não estão cadastrados em nenhum colaborador ativo.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOrphans} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2 text-orange-700">
                        <ShieldAlert className="w-5 h-5" />
                        <CardTitle className="text-lg">Atenção Necessária</CardTitle>
                    </div>
                    <CardDescription className="text-orange-600">
                        Estes registros indicam que colaboradores estão batendo ponto, mas o sistema não consegue identificar quem são.
                        Isso geralmente acontece quando o PIS ou CPF no relógio de ponto é diferente do cadastrado no RH.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Filtrar por PIS..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">PIS / Identificador</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Total de Batidas</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Última Batida</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ação Sugerida</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-4 bg-slate-50/50 h-12"></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Nenhum registro órfão encontrado. Tudo em ordem! 🎉
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => (
                                <tr key={item.pis} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-700">
                                        {item.pis}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            {item.count} batidas
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {format(new Date(item.lastSeen), "dd/MM/yyyy", { locale: ptBR })} às {item.lastTime}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Vincular no RH
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
