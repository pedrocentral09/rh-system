'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { getEmployees, terminateEmployee } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EmployeeDetailsModal } from './EmployeeDetailsModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmployeeEditModal } from './EmployeeEditModal';
import { EmployeeTransferModal } from './EmployeeTransferModal';
import { EmployeeTimeTrackingModal } from './EmployeeTimeTrackingModal';
import { VacationModal } from './VacationModal';
import { MobileEmployeeCard } from './MobileEmployeeCard';
import { ExportButton } from '@/shared/components/ui/export-button';
import { exportToExcel, exportToPDF, formatDateForExport } from '@/shared/utils/export-utils';

/*
Vacation Improvements:
- [x] Create dedicated "Vacation Dashboard" page `/dashboard/vacations`
- [x] Add link to Sidebar
- [x] Fix `getAllVacations` missing export
- [x] Fix `checkVacationRights` logic (include today)
- [x] Implement Auto-Sync on Dashboard Load
- [ ] Trigger Vacation Rights calculation on Employee Admission (`createEmployee`)
- [ ] Implement `VacationCalendar` component for Dashboard
- [ ] (Optional) Generate Vacation Notice PDF
*/
export function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [transferringEmployee, setTransferringEmployee] = useState<any>(null);
    const [timeTrackingEmployee, setTimeTrackingEmployee] = useState<any>(null);
    const [vacationEmployee, setVacationEmployee] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    // Filters
    const [filterStore, setFilterStore] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [filterDept, setFilterDept] = useState('');

    const [error, setError] = useState<string | null>(null);

    const loadEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getEmployees();
            if (result.success) {
                console.log('Employees loaded:', result.data?.length);
                setEmployees(result.data || []);
            } else {
                console.error(result.error);
                setError(result.error?.message || 'Erro ao carregar colaboradores');
            }
        } catch (e: any) {
            console.error('Fetch error:', e);
            setError(e.message || 'Erro de conexão ao buscar colaboradores');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            'ACTIVE': 'Ativo',
            'INACTIVE': 'Inativo',
            'TERMINATED': 'Desligado',
        };
        return map[status] || status;
    };

    const filteredEmployees = employees.filter(emp => {
        // Text Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            emp.name.toLowerCase().includes(searchLower) ||
            emp.cpf.includes(searchTerm) ||
            emp.department?.toLowerCase().includes(searchLower) ||
            emp.jobTitle?.toLowerCase().includes(searchLower)
        );

        // Dropdown Filters
        // Note: 'store' and 'registrationCompany' are likely in emp.contract. The action `getEmployees` needs to include contract.
        // Assuming flatten data or specific fields. Let's check `getEmployees` in actions.
        // If contract is nested, we access via `emp.contract?.store`.
        // Let's assume generic access for now and fix if needed based on action return type.

        const matchesStore = !filterStore || emp.contract?.store?.name === filterStore;
        const matchesCompany = !filterCompany || emp.contract?.company?.name === filterCompany;
        const matchesDept = !filterDept || emp.department === filterDept;

        const matchesStatus = activeTab === 'active' ? emp.status === 'ACTIVE' : emp.status !== 'ACTIVE';

        return matchesSearch && matchesStatus && matchesStore && matchesCompany && matchesDept;
    });

    // Extract Unique Options for Dropdowns
    const uniqueStores = Array.from(new Set(employees.map(e => e.contract?.store?.name).filter(Boolean)));
    const uniqueCompanies = Array.from(new Set(employees.map(e => e.contract?.company?.name).filter(Boolean)));
    const uniqueDepts = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

    const handleExportExcel = () => {
        const exportData = filteredEmployees.map(emp => ({
            'Nome': emp.name,
            'CPF': emp.cpf || '-',
            'Cargo': emp.jobTitle || '-',
            'Departamento': emp.department || '-',
            'Loja': emp.contract?.store || '-',
            'Status': translateStatus(emp.status),
            'Admissão': emp.contract?.admissionDate ? formatDateForExport(emp.contract.admissionDate) : '-'
        }));
        exportToExcel(exportData, `funcionarios_${new Date().toISOString().split('T')[0]}`, 'Funcionários');
    };

    const handleExportPDF = () => {
        const exportData = filteredEmployees.map(emp => ({
            nome: emp.name,
            cpf: emp.cpf || '-',
            cargo: emp.jobTitle || '-',
            departamento: emp.department || '-',
            loja: emp.contract?.store || '-',
            status: translateStatus(emp.status)
        }));

        const columns = [
            { header: 'Nome', dataKey: 'nome' as const },
            { header: 'CPF', dataKey: 'cpf' as const },
            { header: 'Cargo', dataKey: 'cargo' as const },
            { header: 'Departamento', dataKey: 'departamento' as const },
            { header: 'Loja', dataKey: 'loja' as const },
            { header: 'Status', dataKey: 'status' as const }
        ];

        exportToPDF(exportData, columns, 'Listagem de Funcionários', `funcionarios_${new Date().toISOString().split('T')[0]}`);
    };

    if (loading) return (
        <div className="space-y-4">
            <div className="h-12 bg-slate-900 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-slate-900 rounded-lg animate-pulse"></div>
        </div>
    );



    return (
        <>
            <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 sm:p-6 flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">Colaboradores</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Gerencie o quadro de funcionários.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExportButton
                                data={filteredEmployees}
                                filename="funcionarios"
                                onExportExcel={handleExportExcel}
                                onExportPDF={handleExportPDF}
                            />
                            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'active'
                                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    Ativos
                                </button>
                                <button
                                    onClick={() => setActiveTab('inactive')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'inactive'
                                        ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    Inativos
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            placeholder="🔍 Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm h-9 text-slate-900 dark:text-slate-100"
                        />
                        {/* Filters could be hidden in a collapsible on mobile to save space, keeping simple for now */}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <select
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                            value={filterStore}
                            onChange={e => setFilterStore(e.target.value)}
                        >
                            <option value="">Lojas: Todas</option>
                            {uniqueStores.map((s: any) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                            value={filterCompany}
                            onChange={e => setFilterCompany(e.target.value)}
                        >
                            <option value="">Empresas: Todas</option>
                            {uniqueCompanies.map((c: any) => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                        >
                            <option value="">Dept: Todos</option>
                            {uniqueDepts.map((d: any) => <option key={d} value={d}>{d}</option>)}
                        </select>

                        {(filterStore || filterCompany || filterDept || searchTerm) && (
                            <button
                                onClick={() => { setFilterStore(''); setFilterCompany(''); setFilterDept(''); setSearchTerm(''); }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium text-center sm:text-left flex items-center justify-center sm:justify-start"
                            >
                                🗑️ Limpar
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 m-4">
                        <p className="font-bold">Erro ao carregar colaboradores:</p>
                        <p>{error}</p>
                    </div>
                )}

                <CardContent className="p-0">
                    {/* Mobile View (Cards) */}
                    <div className="block sm:hidden p-4 bg-slate-50 dark:bg-slate-900 min-h-[300px]">
                        {filteredEmployees.map(emp => (
                            <MobileEmployeeCard
                                key={emp.id}
                                employee={emp}
                                onClick={() => setSelectedEmployee(emp)}
                                onEdit={(e) => { e.stopPropagation(); setEditingEmployee(emp); }}
                                onTransfer={(e) => { e.stopPropagation(); setTransferringEmployee(emp); }}
                                onTimeTracking={(e) => { e.stopPropagation(); setTimeTrackingEmployee(emp); }}
                                onVacation={(e) => { e.stopPropagation(); setVacationEmployee(emp); }}
                                translateStatus={translateStatus}
                            />
                        ))}
                        {filteredEmployees.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">Nenhum funcionário encontrado.</div>
                        )}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[35%]">Nome</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Depto</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Cargo</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {emp.photoUrl ? (
                                                    <img src={emp.photoUrl} alt="" className="w-8 h-8 rounded-full mr-3 object-cover border border-slate-200 dark:border-slate-600" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 text-xs font-bold text-slate-500 dark:text-slate-300">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.name}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">CPF: {emp.cpf}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">{emp.department}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">{emp.jobTitle}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase rounded-full 
                          ${emp.status === 'ACTIVE' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-600'}`}>
                                                {translateStatus(emp.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">
                                            <div className="flex justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); }}>✏️</Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); setTransferringEmployee(emp); }}>🚚</Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); setTimeTrackingEmployee(emp); }}>⏰</Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-sky-400 hover:text-sky-600 dark:hover:text-sky-400" onClick={(e) => { e.stopPropagation(); setVacationEmployee(emp); }}>🏖️</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center">
                                            <span className="text-4xl mb-2">🔍</span>
                                            {searchTerm ? 'Nenhum funcionário encontrado para sua busca.' : 'Nenhum funcionário cadastrado.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <EmployeeDetailsModal
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                employee={selectedEmployee}
            />

            <EmployeeEditModal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                employee={editingEmployee}
                onSuccess={() => {
                    setEditingEmployee(null);
                    window.location.reload();
                }}
            />

            <EmployeeTransferModal
                isOpen={!!transferringEmployee}
                onClose={() => setTransferringEmployee(null)}
                employee={transferringEmployee}
                onSuccess={() => {
                    setTransferringEmployee(null);
                    window.location.reload();
                }}
            />

            <EmployeeTimeTrackingModal
                isOpen={!!timeTrackingEmployee}
                onClose={() => setTimeTrackingEmployee(null)}
                employee={timeTrackingEmployee}
            />

            <VacationModal
                isOpen={!!vacationEmployee}
                onClose={() => setVacationEmployee(null)}
                employeeId={vacationEmployee?.id}
                employeeName={vacationEmployee?.name}
            />
        </>
    );
}
