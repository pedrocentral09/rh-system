'use client';

import { motion } from 'framer-motion';

interface BirthdayEmployee {
    id: string;
    name: string;
    photoUrl?: string | null;
    day: number;
}

interface BirthdayMuralProps {
    birthdays: BirthdayEmployee[];
}

export function BirthdayMural({ birthdays }: BirthdayMuralProps) {
    return (
        <div className="bg-surface border border-white/5 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden h-full group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/[0.03] blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-pink-500/[0.02] blur-[80px] rounded-full" />

            <div className="flex justify-between items-center mb-8 relative z-10">
                <h4 className="text-[10px] font-[1000] text-pink-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                    Celebrações
                </h4>
                <div className="bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full text-[9px] font-[1000] uppercase tracking-widest border border-pink-500/20">
                    PRÓXIMOS 30 DIAS
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {(birthdays || []).length > 0 ? (
                    birthdays.map((emp, index) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: "circOut" }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center space-x-5 p-5 bg-surface-secondary/40 backdrop-blur-sm rounded-[1.8rem] border border-white/5 group/item transition-all duration-500 hover:border-pink-500/30 hover:bg-surface hover:shadow-2xl hover:shadow-pink-500/5"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 font-black overflow-hidden relative shadow-inner group-hover/item:border-pink-500/50 transition-all duration-700 group-hover:rotate-3">
                                {emp.photoUrl ? (
                                    <img src={emp.photoUrl} alt={emp.name} className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                ) : (
                                    <span className="text-xl leading-none italic font-[1000]">{emp.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-[1000] text-text-primary uppercase tracking-tight truncate group-hover/item:text-pink-500 transition-colors duration-500 italic">{emp.name}</p>
                                <div className="flex items-center gap-2 mt-1.5 px-2 py-0.5 bg-pink-500/5 rounded-full w-fit border border-pink-500/10 opacity-70 group-hover/item:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-pink-400 font-black uppercase tracking-widest">Dia {emp.day}</span>
                                    <div className="w-1 h-1 rounded-full bg-pink-400/50" />
                                    <span className="text-[9px] text-pink-300 font-black uppercase tracking-tighter">ANIVERSÁRIO 🎉</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-pink-500/40"><path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="3" /></svg>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-text-muted gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                            <span className="text-3xl grayscale opacity-20">🎁</span>
                        </div>
                        <p className="text-[10px] font-[1000] uppercase tracking-[0.4em] opacity-40">Ciclo Concluído</p>
                    </div>
                )}
            </div>

            {/* Decorative Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
        </div>
    );
}
