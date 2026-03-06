'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
    FileText,
    Search,
    Download,
    Eye,
    Lock,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    Briefcase,
    User,
    Stamp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function PortalDocumentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const docs = [
        { id: 1, name: 'Contrato de Trabalho', type: 'Contratual', date: '2024-01-15', status: 'Assinado' },
        { id: 2, name: 'RG / CNH', type: 'Pessoal', date: '2024-01-10', status: 'Validado' },
        { id: 3, name: 'Comprovante de Residência', type: 'Pessoal', date: '2025-02-20', status: 'Validado' },
        { id: 4, name: 'Termo de Confidencialidade', type: 'Contratual', date: '2024-01-15', status: 'Assinado' },
    ];

    const filteredDocs = docs.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Security Badge */}
            <div className="flex flex-col gap-6">
                <Card className="bg-white/[0.05] border border-white/10 rounded-[40px] overflow-hidden relative backdrop-blur-3xl shadow-2xl">
                    <CardContent className="p-8 text-white relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-4 bg-brand-orange/20 rounded-2xl backdrop-blur-md border border-brand-orange/30">
                                <ShieldCheck className="h-7 w-7 text-brand-orange" />
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-[1000] text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Ambiente Seguro</Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Carteira Digital</p>
                            <h3 className="text-4xl font-[1000] tracking-tighter text-white uppercase italic">Meus <span className="text-brand-blue">Documentos</span></h3>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-blue rounded-full blur-[120px] opacity-10" />
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar por nome ou tipo..."
                    className="w-full pl-14 pr-8 py-5 bg-white/[0.05] border border-white/10 rounded-[28px] text-sm font-bold text-white focus:ring-4 ring-white/10 backdrop-blur-xl transition-all outline-none placeholder:text-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Documents List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Arquivos Digitais</h3>
                    <div className="h-px bg-white/5 flex-1 mx-6" />
                </div>

                <div className="space-y-4">
                    {filteredDocs.length === 0 ? (
                        <div className="text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10 backdrop-blur-2xl">
                            <FileText className="h-12 w-12 text-white/10 mx-auto mb-4" />
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Nenhum registro</p>
                        </div>
                    ) : (
                        filteredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white/[0.04] border border-white/10 rounded-[32px] p-5 flex items-center justify-between backdrop-blur-2xl transition-all group hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-white/5 text-slate-400 rounded-[22px] flex items-center justify-center transition-all group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                        {doc.type === 'Contratual' ? <Stamp className="h-7 w-7" /> : <User className="h-7 w-7" />}
                                    </div>
                                    <div>
                                        <h4 className="font-[1000] text-white leading-none mb-2 uppercase text-xs tracking-widest">{doc.name}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400">
                                                {doc.type}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] text-slate-500 font-[1000] uppercase tracking-tighter">Validado</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                                        <Eye className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-brand-blue/10 text-blue-400 hover:text-white hover:bg-brand-blue transition-all border border-blue-400/20">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[36px] p-8 backdrop-blur-2xl shadow-xl flex items-start gap-4">
                <div className="p-3 bg-brand-blue/10 rounded-2xl text-blue-400 border border-blue-400/20 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-[1000] text-xs uppercase tracking-[0.2em] text-white mb-2 underline decoration-brand-orange decoration-2 underline-offset-4">Dúvidas com os arquivos?</h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed tracking-tight">
                        Se algum dado estiver incorreto ou faltante, procure o <span className="text-white">RH da sua unidade</span> imediatamente para atualização cadastral e revalidação dos documentos.
                    </p>
                </div>
            </div>
        </div>
    );
}
