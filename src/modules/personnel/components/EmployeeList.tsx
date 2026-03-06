'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEmployees, terminateEmployee } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EmployeeDetailsModal } from './EmployeeDetailsModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmployeeEditModal } from './EmployeeEditModal';
import EmployeeTransferModal from './EmployeeTransferModal';
import { EmployeeTimeTrackingModal } from './EmployeeTimeTrackingModal';
import { VacationModal } from './VacationModal';
import { MobileEmployeeCard } from './MobileEmployeeCard';
import { ExportButton } from '@/shared/components/ui/export-button';
import { exportToExcel, exportToPDF, formatDateForExport } from '@/shared/utils/export-utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
interface EmployeeListProps {
    refreshTrigger?: number;
}

export function EmployeeList({ refreshTrigger }: EmployeeListProps) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [transferringEmployee, setTransferringEmployee] = useState<any>(null);
    const [timeTrackingEmployee, setTimeTrackingEmployee] = useState<any>(null);
    const [vacationEmployee, setVacationEmployee] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'approval'>('active');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Filters
    const [filterStore, setFilterStore] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [filterSector, setFilterSector] = useState('');

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
                setError(result.message || 'Erro ao carregar colaboradores');
            }
        } catch (e: any) {
            console.error('Fetch error:', e);
            setError(e.message || 'Erro de conexão ao buscar colaboradores');
        }
        setLoading(false);
    };

    const searchParams = useSearchParams();

    useEffect(() => {
        loadEmployees();
    }, [refreshTrigger]);

    // Handle initial navigation from Dashboard
    useEffect(() => {
        if (!loading && employees.length > 0) {
            const empId = searchParams.get('id');
            const tabParam = searchParams.get('tab');
            const modeParam = searchParams.get('mode');

            if (empId) {
                const targetEmp = employees.find(e => e.id === empId);
                if (targetEmp) {
                    if (modeParam === 'edit') {
                        setEditingEmployee(targetEmp);
                    } else {
                        setSelectedEmployee(targetEmp);
                    }
                    // The tab handling will be done via props passed to the modals
                }
            }
        }
    }, [loading, employees, searchParams]);

    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            'ACTIVE': 'Ativo',
            'INACTIVE': 'Inativo',
            'TERMINATED': 'Desligado',
            'WAITING_ONBOARDING': 'Aguardando Cadastro',
            'PENDING_APPROVAL': 'Pendente de Aprovação'
        };
        return map[status] || status;
    };

    const filteredEmployees = employees.filter(emp => {
        // Text Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            emp.name.toLowerCase().includes(searchLower) ||
            (emp.cpf || '').includes(searchTerm) ||
            (emp.contract?.sectorDef?.name || emp.department || "").toLowerCase().includes(searchLower) ||
            emp.jobTitle?.toLowerCase().includes(searchLower)
        );

        // Dropdown Filters
        // Note: 'store' and 'registrationCompany' are likely in emp.contract. The action `getEmployees` needs to include contract.
        // Assuming flatten data or specific fields. Let's check `getEmployees` in actions.
        // If contract is nested, we access via `emp.contract?.store`.
        // Let's assume generic access for now and fix if needed based on action return type.

        const matchesStore = !filterStore || emp.contract?.store?.name === filterStore;
        const matchesCompany = !filterCompany || emp.contract?.company?.name === filterCompany;
        const matchesSector = !filterSector || (emp.contract?.sectorDef?.name || emp.department) === filterSector;

        let matchesStatus = false;
        if (activeTab === 'active') {
            matchesStatus = emp.status === 'ACTIVE';
        } else if (activeTab === 'approval') {
            matchesStatus = emp.status === 'PENDING_APPROVAL' || emp.status === 'WAITING_ONBOARDING';
        } else {
            matchesStatus = emp.status === 'INACTIVE' || emp.status === 'TERMINATED';
        }

        return matchesSearch && matchesStatus && matchesStore && matchesCompany && matchesSector;
    });

    // Sort by name
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    // Extract Unique Options for Dropdowns
    const uniqueStores = Array.from(new Set(employees.map(e => e.contract?.store?.name).filter(Boolean)));
    const uniqueCompanies = Array.from(new Set(employees.map(e => e.contract?.company?.name).filter(Boolean)));
    const uniqueSectors = Array.from(new Set(employees.map(e => e.contract?.sectorDef?.name || e.department).filter(Boolean)));

    const handleExportExcel = () => {
        const exportData = filteredEmployees.map(emp => ({
            'Nome': emp.name,
            'CPF': emp.cpf || '-',
            'Cargo': emp.jobTitle || '-',
            'Setor': emp.contract?.sectorDef?.name || emp.department || '-',
            'Loja': emp.contract?.store?.name || emp.contract?.store || '-',
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
            setor: emp.contract?.sectorDef?.name || emp.department || '-',
            loja: emp.contract?.store?.name || emp.contract?.store || '-',
            status: translateStatus(emp.status)
        }));

        const columns = [
            { header: 'Nome', dataKey: 'nome' as const },
            { header: 'CPF', dataKey: 'cpf' as const },
            { header: 'Cargo', dataKey: 'cargo' as const },
            { header: 'Setor', dataKey: 'setor' as const },
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats Summary or Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Quadro de <span className="text-brand-orange">Colaboradores</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão Estratégica de Capital Humano</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <ExportButton
                        data={filteredEmployees}
                        filename="funcionarios"
                        onExportExcel={handleExportExcel}
                        onExportPDF={handleExportPDF}
                    />

                    <div className="bg-[#0A0F1C] border border-white/5 p-1 rounded-2xl flex items-center gap-1">
                        {[
                            { id: 'active', label: 'Ativos', color: 'brand-orange', count: employees.filter(e => e.status === 'ACTIVE').length },
                            { id: 'approval', label: 'Pendentes', color: 'amber-500', count: employees.filter(e => e.status === 'PENDING_APPROVAL' || e.status === 'WAITING_ONBOARDING').length },
                            { id: 'inactive', label: 'Egressos', color: 'slate-500', count: employees.filter(e => e.status === 'TERMINATED' || e.status === 'INACTIVE').length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative ${activeTab === tab.id
                                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md bg-${tab.color}/20 text-white/80 text-[8px]`}>{tab.count}</span>
                                </span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-orange rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Filter Bar */}
            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-orange transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            placeholder="PESQUISAR POR NOME OU CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black text-white uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-brand-orange/30 focus:bg-white/10 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-white transition-all"
                            value={filterStore}
                            onChange={e => setFilterStore(e.target.value)}
                        >
                            <option value="" className="bg-[#0A0F1C]">Todas as Lojas</option>
                            {uniqueStores.map((s: any) => <option key={s} value={s} className="bg-[#0A0F1C]">{s}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-white transition-all"
                            value={filterCompany}
                            onChange={e => setFilterCompany(e.target.value)}
                        >
                            <option value="" className="bg-[#0A0F1C]">Empresas: Geral</option>
                            {uniqueCompanies.map((c: any) => <option key={c} value={c} className="bg-[#0A0F1C]">{c}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        {(filterStore || filterCompany || filterSector || searchTerm) ? (
                            <button
                                onClick={() => { setFilterStore(''); setFilterCompany(''); setFilterSector(''); setSearchTerm(''); }}
                                className="w-full h-full bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                                Limpar Filtros
                            </button>
                        ) : (
                            <select
                                className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-white transition-all"
                                value={filterSector}
                                onChange={e => setFilterSector(e.target.value)}
                            >
                                <option value="" className="bg-[#0A0F1C]">Setores: Todos</option>
                                {uniqueSectors.map((s: any) => <option key={s} value={s} className="bg-[#0A0F1C]">{s}</option>)}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* List Containers */}
            <div className="relative min-h-[400px]">
                {/* Mobile View */}
                <div className="lg:hidden space-y-4">
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
                </div>

                {/* Desktop View Table */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-12 px-8 mb-4">
                        <div
                            className="col-span-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] cursor-pointer hover:text-brand-orange transition-colors"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            Colaborador {sortOrder === 'asc' ? '↑' : '↓'}
                        </div>
                        <div className="col-span-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Alocação / Unidade</div>
                        <div className="col-span-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Cargo Estratégico</div>
                        <div className="col-span-1 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Status</div>
                        <div className="col-span-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Controle</div>
                    </div>

                    <div className="space-y-3">
                        {sortedEmployees.map((emp, i) => (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => setSelectedEmployee(emp)}
                                className={`grid grid-cols-12 items-center px-8 py-5 bg-[#0A0F1C] border border-white/5 rounded-[1.5rem] hover:border-brand-orange/30 hover:scale-[1.01] hover:bg-white/[0.02] transition-all duration-300 group cursor-pointer relative overflow-hidden ${emp.isIncomplete ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500/50' : ''}`}
                            >
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group-hover:border-brand-orange/40 transition-colors">
                                        {emp.photoUrl ? (
                                            <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-black text-slate-500 group-hover:text-brand-orange transition-colors">{emp.name.charAt(0)}</span>
                                        )}
                                        {emp.isIncomplete && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0A0F1C]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-white uppercase tracking-tight group-hover:text-brand-orange transition-colors">{emp.name}</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{emp.cpf || 'Documento não informado'}</p>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-tighter">{emp.contract?.store?.name || 'Não alocado'}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{emp.contract?.sectorDef?.name || emp.department || 'Setor geral'}</p>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-[11px] font-black text-brand-orange uppercase tracking-tighter">{emp.jobTitle || emp.jobRole?.name || 'Posto indefinido'}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Desde {emp.contract?.admissionDate ? new Date(emp.contract.admissionDate).toLocaleDateString('pt-BR') : '--/--/--'}</p>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        emp.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            emp.status === 'WAITING_ONBOARDING' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                                'bg-slate-500/10 text-slate-500 border-white/5'
                                        }`}>
                                        {translateStatus(emp.status)}
                                    </span>
                                </div>

                                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-brand-orange hover:text-white transition-all shadow-lg" title="Editar">✏️</button>
                                    <button onClick={(e) => { e.stopPropagation(); setTransferringEmployee(emp); }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-brand-orange hover:text-white transition-all shadow-lg" title="Transferir">🚚</button>
                                    <button onClick={(e) => { e.stopPropagation(); setTimeTrackingEmployee(emp); }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-brand-orange hover:text-white transition-all shadow-lg" title="Ponto">⏰</button>
                                    <button onClick={(e) => { e.stopPropagation(); setVacationEmployee(emp); }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-sky-500 hover:text-white transition-all shadow-lg" title="Férias">🏖️</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {sortedEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum registro localizado</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <EmployeeDetailsModal
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                onSuccess={loadEmployees}
                employee={selectedEmployee}
                defaultTab={searchParams.get('tab') || undefined}
            />

            <EmployeeEditModal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                employee={editingEmployee}
                defaultTab={searchParams.get('tab') || undefined}
                onSuccess={() => {
                    setEditingEmployee(null);
                    loadEmployees();
                }}
            />

            {transferringEmployee && (
                <EmployeeTransferModal
                    isOpen={!!transferringEmployee}
                    onClose={() => setTransferringEmployee(null)}
                    employee={transferringEmployee}
                    onSuccess={() => {
                        setTransferringEmployee(null);
                        loadEmployees();
                    }}
                />
            )}

            {timeTrackingEmployee && (
                <EmployeeTimeTrackingModal
                    isOpen={!!timeTrackingEmployee}
                    onClose={() => setTimeTrackingEmployee(null)}
                    employee={timeTrackingEmployee}
                />
            )}

            {vacationEmployee && (
                <VacationModal
                    isOpen={!!vacationEmployee}
                    onClose={() => setVacationEmployee(null)}
                    employeeId={vacationEmployee?.id}
                    employeeName={vacationEmployee?.name}
                />
            )}
        </div>
    );
}
