import { Modal } from '@/shared/components/ui/modal';
import { EmployeeTimeSheetTab } from '@/modules/time-tracking/components/EmployeeTimeSheetTab';
import { Clock, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmployeeTimeTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export function EmployeeTimeTrackingModal({ isOpen, onClose, employee }: EmployeeTimeTrackingModalProps) {
    if (!employee) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader
            width="6xl"
        >
            <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

                {/* Header */}
                <div className="shrink-0 bg-surface/50 border-b border-border/60 px-10 py-8 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-blue group-hover:bg-brand-blue/80 transition-colors" />
                                <Clock className="h-8 w-8 text-white relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight italic leading-none">
                                    Controle de <span className="text-brand-blue">Ponto</span>
                                </h2>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mt-2 opacity-80">Matriz de Frequência & Produtividade</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-surface-secondary border border-border px-8 py-4 rounded-[1.5rem] shadow-inner">
                            <Timer className="w-5 h-5 text-brand-blue" />
                            <div>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none opacity-80">Colaborador em Foco</p>
                                <p className="text-sm font-black text-text-primary uppercase mt-1 italic">{employee.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <EmployeeTimeSheetTab employeeId={employee.id} />
                    </motion.div>
                </div>
            </div>
        </Modal>
    );
}
