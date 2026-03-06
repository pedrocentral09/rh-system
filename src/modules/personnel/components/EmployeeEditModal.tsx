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
                className="relative w-full max-w-[1200px] max-h-[95vh] overflow-hidden"
            >
                {/* Close Button UI */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="overflow-y-auto max-h-[95vh] custom-scrollbar no-scrollbar">
                    {loading ? (
                        <div className="bg-[#0A0F1C]/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-32 flex flex-col items-center justify-center space-y-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <User className="w-8 h-8 text-indigo-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">Recuperando Registro</h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Acessando banco de dados seguro...</p>
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
