'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getEmployees } from '@/modules/personnel/actions'; // Cross-module import (acceptable for "Reporting" views)
import { EmployeeTimeSheetTab } from './EmployeeTimeSheetTab'; // Reuse existing logic

export function TimeTrackingReportsTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    // Initial Load of Employees for Search
    useEffect(() => {
        getEmployees().then(res => {
            if (res.success && res.data) {
                setEmployees(res.data);
            }
        });
    }, []);

    // Filter Logic
    useEffect(() => {
        if (!searchTerm) {
            setFilteredEmployees([]);
            return;
        }
        const lower = searchTerm.toLowerCase();
        setFilteredEmployees(employees.filter(e =>
            e.name.toLowerCase().includes(lower) ||
            e.cpf.includes(searchTerm)
        ).slice(0, 5));
    }, [searchTerm, employees]);

    return (
        <Card className="shadow-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-slate-900 dark:text-white">Relatórios Individuais</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                    Pesquise um colaborador para visualizar e imprimir o espelho de ponto.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">

                {/* Search Area */}
                <div className="relative max-w-lg mb-8">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Buscar Colaborador</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Digite nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!e.target.value) setSelectedEmployee(null);
                            }}
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                        {selectedEmployee && (
                            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedEmployee(null); }} className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {filteredEmployees.length > 0 && !selectedEmployee && (
                        <div className="absolute top-16 left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md z-10 overflow-hidden">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                                    onClick={() => {
                                        setSelectedEmployee(emp);
                                        setSearchTerm(emp.name);
                                        setFilteredEmployees([]);
                                    }}
                                >
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{emp.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{emp.jobTitle} - {emp.department}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Report View */}
                {selectedEmployee ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <div className="w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                                {selectedEmployee.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{selectedEmployee.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployee.jobTitle} | {selectedEmployee.department}</p>
                            </div>
                        </div>

                        {/* Reuse the TimeSheet Tab Logic */}
                        <EmployeeTimeSheetTab employeeId={selectedEmployee.id} />
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-4xl block mb-2 opacity-50">👤</span>
                        <p className="text-slate-500 dark:text-slate-400">Selecione um funcionário para visualizar os registros.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
