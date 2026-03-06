'use client';

import { LogOut, User, Bell } from 'lucide-react';
import { logoutAction } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';

export function PortalHeader({ employeeName }: { employeeName: string }) {
    return (
        <header className="md:hidden sticky top-4 left-4 right-4 z-50 px-4">
            <div className="bg-[#161B29]/95 backdrop-blur-3xl border border-white/10 h-16 rounded-[24px] px-5 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 p-1.5 border border-white/10">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain brightness-150 contrast-125" />
                    </div>
                    <h1 className="text-[10px] font-[1000] text-white uppercase tracking-[0.2em] leading-none">
                        Portal <span className="text-brand-orange">Família</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-[11px] font-[1000] shadow-2xl">
                        {employeeName.charAt(0)}
                    </div>

                    <form action={logoutAction}>
                        <button type="submit" className="p-2 text-slate-300 hover:text-rose-400 transition-all active:scale-95 bg-white/5 rounded-xl border border-white/5">
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
