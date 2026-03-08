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
        <div className="bg-surface border border-border rounded-[2rem] p-8 relative overflow-hidden h-full group shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Ciclo de Celebrações
            </h4>

            <div className="space-y-4">
                {(birthdays || []).length > 0 ? (
                    birthdays.map((emp, index) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex items-center space-x-4 p-4 bg-surface-secondary rounded-[1.5rem] border border-border group/item hover:bg-surface-hover hover:border-pink-500/20 transition-all duration-300 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 font-black overflow-hidden relative shadow-lg group-hover/item:border-pink-500/50 transition-colors">
                                {emp.photoUrl ? (
                                    <img src={emp.photoUrl} alt={emp.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg leading-none">{emp.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-black text-text-primary uppercase tracking-tighter group-hover/item:text-pink-500 transition-colors">{emp.name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[10px] text-pink-400 font-black uppercase tracking-widest">Dia {emp.day}</span>
                                    <span className="text-[10px] text-text-muted mb-0.5">•</span>
                                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-tighter">Aniversário 🎉</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-text-muted italic">
                        <span className="text-2xl opacity-20 mb-2">🎁</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Sem ciclos para hoje</p>
                    </div>
                )}
            </div>

            {/* Decorative Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
        </div>
    );
}
