'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getEmployees } from '@/modules/personnel/actions'; // Cross-module import (acceptable for "Reporting" views)
import { EmployeeTimeSheetTab } from './EmployeeTimeSheetTab'; // Reuse existing logic

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User } from 'lucide-react';

export function TimeTrackingReportsTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    useEffect(() => {
        getEmployees().then(res => {
            if (res.success && res.data) {
                setEmployees(res.data);
            }
        });
    }, []);

    useEffect(() => {
        if (!searchTerm || selectedEmployee) {
            setFilteredEmployees([]);
            return;
        }
        const lower = searchTerm.toLowerCase();
        setFilteredEmployees(employees.filter(e =>
            e.name.toLowerCase().includes(lower) ||
            e.cpf.includes(searchTerm)
        ).slice(0, 5));
    }, [searchTerm, employees, selectedEmployee]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Search Header */}
            <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Auditória Individual</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Extração de Espelhos de Ponto e Histórico de Jornada</p>
                    </div>

                    <div className="relative max-w-2xl">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/60 group-focus-within:text-brand-orange transition-colors" />
                            <input
                                type="text"
                                placeholder="DIGITE NOME OU CPF DO COLABORADOR..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (!e.target.value) setSelectedEmployee(null);
                                }}
                                className="h-16 w-full bg-text-primary/5 border border-border rounded-2xl pl-16 pr-16 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all shadow-inner appearance-none placeholder:text-text-muted/40"
                            />
                            {selectedEmployee && (
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedEmployee(null); }}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-text-primary/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Dropdown */}
                        <AnimatePresence>
                            {filteredEmployees.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-20 left-0 w-full bg-surface border border-border shadow-2xl rounded-3xl z-50 overflow-hidden divide-y divide-border"
                                >
                                    {filteredEmployees.map(emp => (
                                        <div
                                            key={emp.id}
                                            className="p-6 hover:bg-text-primary/5 cursor-pointer transition-all flex items-center gap-4 group"
                                            onClick={() => {
                                                setSelectedEmployee(emp);
                                                setSearchTerm(emp.name);
                                                setFilteredEmployees([]);
                                            }}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-[12px] font-black text-text-muted group-hover:text-brand-orange transition-colors">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors">{emp.name}</p>
                                                <p className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mt-0.5">{emp.jobTitle} | {emp.department}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="relative">
                {selectedEmployee ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-6 p-8 bg-brand-orange/5 border border-brand-orange/10 rounded-[2rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange text-2xl font-black">
                                {selectedEmployee.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none mb-2">{selectedEmployee.name}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{selectedEmployee.jobTitle}</span>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">{selectedEmployee.department}</span>
                                </div>
                            </div>
                        </div>

                        <EmployeeTimeSheetTab employeeId={selectedEmployee.id} />
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-text-muted/40 bg-text-primary/2 rounded-[3.5rem] border border-border border-dashed">
                        <div className="w-20 h-20 bg-text-primary/5 rounded-full flex items-center justify-center mb-6 border border-border">
                            <User className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] italic text-center">Inicie uma Busca para Gerar Relatórios</p>
                    </div>
                )}
            </div>
        </div>
    );
}
