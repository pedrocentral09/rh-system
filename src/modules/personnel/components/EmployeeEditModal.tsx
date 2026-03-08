import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, User } from 'lucide-react';
import { EmployeeForm } from './EmployeeForm';
import { getEmployee } from '../actions';

interface EmployeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any;
    defaultTab?: string;
}

export function EmployeeEditModal({ isOpen, onClose, onSuccess, employee, defaultTab }: EmployeeEditModalProps) {
    const [fullEmployee, setFullEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && employee?.id) {
            setLoading(true);
            getEmployee(employee.id)
                .then(result => {
                    if (result.success) {
                        setFullEmployee(result.data);
                    } else {
                        console.error("Failed to load full employee details");
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setFullEmployee(null);
        }
    }, [isOpen, employee]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-7xl max-h-[95vh] flex flex-col"
            >
                {/* Close Button UI */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-text-primary/5 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all group backdrop-blur-xl"
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar rounded-[2.5rem]">
                    {loading ? (
                        <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] border border-border p-32 flex flex-col items-center justify-center space-y-8 shadow-2xl">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-text-primary/5 border-t-brand-orange animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <User className="w-8 h-8 text-brand-orange animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-[0.3em]">Recuperando Dossiê</h3>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-3 opacity-60">Sincronizando registros biométricos e contratuais...</p>
                            </div>
                        </div>
                    ) : (
                        fullEmployee && (
                            <EmployeeForm
                                initialData={fullEmployee}
                                employeeId={fullEmployee.id}
                                onSuccess={() => {
                                    onSuccess();
                                    onClose();
                                }}
                                onCancel={onClose}
                                defaultTab={defaultTab}
                            />
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
}
