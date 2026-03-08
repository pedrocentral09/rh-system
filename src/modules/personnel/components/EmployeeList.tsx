'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEmployees, terminateEmployee, deleteEmployee, resetOnboarding } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EmployeeDetailsModal } from './EmployeeDetailsModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmployeeEditModal } from './EmployeeEditModal';
import EmployeeTransferModal from './EmployeeTransferModal';
import { EmployeeTimeTrackingModal } from './EmployeeTimeTrackingModal';
import { VacationModal } from './VacationModal';
import { EmployeeTerminationModal } from './EmployeeTerminationModal';
import { EmployeeRehireModal } from './EmployeeRehireModal';
import { EmployeeCreateModal } from './EmployeeCreateModal';
import { EmployeeOnboardingRequestModal } from './EmployeeOnboardingRequestModal';
import { MinimumWageUpdateButton } from './MinimumWageUpdateButton';
import { MobileEmployeeCard } from './MobileEmployeeCard';
import { ExportButton } from '@/shared/components/ui/export-button';
import { exportToExcel, exportToPDF, formatDateForExport } from '@/shared/utils/export-utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Briefcase, Calendar, CheckCircle2, AlertCircle, Clock, Trash2, RefreshCw, ChevronRight, User, Truck, Palmtree, Ban, RotateCcw, UserPlus, Link, Pencil } from 'lucide-react';

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
    const [terminatingEmployee, setTerminatingEmployee] = useState<any>(null);
    const [rehiringEmployee, setRehiringEmployee] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isOnboardingRequestOpen, setIsOnboardingRequestOpen] = useState(false);
    const [vacationModalTab, setVacationModalTab] = useState<'vacations' | 'atestados'>('vacations');
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
            <div className="h-12 bg-text-primary/5 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-text-primary/5 rounded-lg animate-pulse"></div>
        </div>
    );



    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats Summary or Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Quadro de <span className="text-brand-orange">Colaboradores</span></h2>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.3em] opacity-80">Gestão Estratégica de Capital Humano & Talento</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <MinimumWageUpdateButton />

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-orange/20 flex items-center gap-3 border-b-4 border-black/20"
                    >
                        <UserPlus className="h-5 w-5" />
                        Adicionar Colaborador
                    </button>



                    <button
                        onClick={() => setIsOnboardingRequestOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-surface transition-all shadow-md flex items-center gap-3 border-b-4 border-black/5"
                    >
                        <Link className="h-5 w-5 text-brand-orange" />
                        Autocadastro Digital
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <ExportButton
                        data={filteredEmployees}
                        filename="funcionarios"
                        onExportExcel={handleExportExcel}
                        onExportPDF={handleExportPDF}
                    />

                    <div className="bg-surface-secondary/50 backdrop-blur-md border border-border p-1.5 rounded-[1.5rem] flex items-center gap-1 shadow-inner">
                        {[
                            { id: 'active', label: 'Efetivos', color: 'brand-orange', count: employees.filter(e => e.status === 'ACTIVE').length },
                            { id: 'approval', label: 'Pendentes', color: 'brand-blue', count: employees.filter(e => e.status === 'PENDING_APPROVAL' || e.status === 'WAITING_ONBOARDING').length },
                            { id: 'inactive', label: 'Egressos', color: 'text-muted', count: employees.filter(e => e.status === 'TERMINATED' || e.status === 'INACTIVE').length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative ${activeTab === tab.id
                                    ? 'bg-surface text-text-primary shadow-xl ring-1 ring-border'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/40'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    {tab.label}
                                    <span className={`px-2 py-0.5 rounded-lg font-black bg-brand-orange/10 text-brand-orange text-[9px] min-w-[20px] shadow-inner`}>
                                        {tab.count}
                                    </span>
                                </span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTabList" className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-orange rounded-full z-10" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Filter Bar */}
            <div className="bg-surface-secondary/30 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-orange/10 transition-all duration-1000" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative">
                    <div className="lg:col-span-2 relative group-filter">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within/filter:text-brand-orange transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Pesquise por nome, CPF ou cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border-border h-16 rounded-2xl pl-14 text-sm font-black text-text-primary uppercase tracking-widest focus:ring-brand-orange/20 shadow-inner group-hover/filter:border-brand-orange/30 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-surface border border-border h-16 rounded-2xl px-6 text-[10px] font-black text-text-secondary uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-text-primary transition-all shadow-inner"
                            value={filterStore}
                            onChange={e => setFilterStore(e.target.value)}
                        >
                            <option value="">Todas as Unidades</option>
                            {uniqueStores.map((s: any) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.div>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-surface border border-border h-16 rounded-2xl px-6 text-[10px] font-black text-text-secondary uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-text-primary transition-all shadow-inner"
                            value={filterCompany}
                            onChange={e => setFilterCompany(e.target.value)}
                        >
                            <option value="">Múltiplas Empresas</option>
                            {uniqueCompanies.map((c: any) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>↓</motion.div>
                        </div>
                    </div>

                    <div className="relative">
                        {(filterStore || filterCompany || filterSector || searchTerm) ? (
                            <Button
                                onClick={() => { setFilterStore(''); setFilterCompany(''); setFilterSector(''); setSearchTerm(''); }}
                                size="lg"
                                variant="destructive"
                                className="w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Resetar Filtros
                            </Button>
                        ) : (
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-surface border border-border h-16 rounded-2xl px-6 text-[10px] font-black text-text-secondary uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 focus:text-text-primary transition-all shadow-inner"
                                    value={filterSector}
                                    onChange={e => setFilterSector(e.target.value)}
                                >
                                    <option value="">Divisões / Setores</option>
                                    {uniqueSectors.map((s: any) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>↓</motion.div>
                                </div>
                            </div>
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
                            onVacation={(e) => { e.stopPropagation(); setVacationEmployee(emp); setVacationModalTab('vacations'); }}
                            translateStatus={translateStatus}
                        />
                    ))}
                </div>

                {/* Desktop View Table */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-12 px-8 mb-4">
                        <div
                            className="col-span-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] cursor-pointer hover:text-brand-orange transition-colors"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            Colaborador {sortOrder === 'asc' ? '↑' : '↓'}
                        </div>
                        <div className="col-span-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Alocação / Unidade</div>
                        <div className="col-span-2 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Cargo Estratégico</div>
                        <div className="col-span-1 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-center">Status</div>
                        <div className="col-span-2 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Controle</div>
                    </div>

                    <div className="space-y-4">
                        {sortedEmployees.map((emp, i) => (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => setSelectedEmployee(emp)}
                                className={`grid grid-cols-12 items-center px-10 py-6 bg-surface-secondary/40 backdrop-blur-sm border border-border/60 rounded-[2.5rem] hover:border-brand-orange/40 hover:scale-[1.01] hover:bg-surface transition-all duration-500 group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-orange/5 ${emp.isIncomplete ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-brand-orange animate-pulse' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-brand-orange/[0.02] to-brand-orange/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="col-span-4 flex items-center gap-6 relative">
                                    <div className="relative group/photo shrink-0">
                                        <div className="w-14 h-14 bg-surface rounded-[1.25rem] border border-border flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:border-brand-orange/50 shadow-inner group-hover:shadow-2xl">
                                            {emp.photoUrl ? (
                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <User className="h-6 w-6 text-text-secondary group-hover:text-brand-orange transition-colors" />
                                            )}

                                            {/* Status Dots */}
                                            <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                                                {emp.isIncomplete && <div className="w-3.5 h-3.5 bg-brand-orange rounded-full border-2 border-surface shadow-lg" title="Cadastro Incompleto" />}

                                                {(() => {
                                                    const latestAso = emp.healthRecords?.[0];
                                                    if (!latestAso) return <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-surface shadow-lg" title="Sem ASO" />;

                                                    const expirationDate = new Date(latestAso.date);
                                                    expirationDate.setMonth(expirationDate.getMonth() + (latestAso.periodicity || 12));
                                                    const isExpired = expirationDate < new Date();

                                                    if (isExpired) return <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-surface shadow-lg animate-pulse" title="ASO Vencido" />;

                                                    const in30Days = new Date();
                                                    in30Days.setDate(in30Days.getDate() + 30);
                                                    if (expirationDate < in30Days) return <div className="w-3.5 h-3.5 bg-brand-orange rounded-full border-2 border-surface shadow-lg" title="ASO a vencer" />;

                                                    return <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface shadow-lg" title="ASO OK" />;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">{emp.name}</h4>
                                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mt-1 opacity-80">
                                            CPF {emp.cpf || 'Não Identificado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-3 relative">
                                    <div className="flex items-center gap-3 text-text-secondary group-hover:text-text-primary transition-colors">
                                        <Building2 className="h-4 w-4 opacity-70" />
                                        <p className="text-[11px] font-black uppercase tracking-tighter truncate">{emp.contract?.store?.name || 'Não alocado'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 opacity-80">
                                        <MapPin className="h-3 w-3 opacity-70" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest truncate">{emp.contract?.sectorDef?.name || emp.department || 'Setor geral'}</p>
                                    </div>
                                </div>

                                <div className="col-span-2 relative">
                                    <div className="flex items-center gap-3 text-brand-orange">
                                        <Briefcase className="h-4 w-4 opacity-80" />
                                        <p className="text-[11px] font-black uppercase tracking-tighter truncate">{emp.jobTitle || emp.jobRole?.name || 'Posto indefinido'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 opacity-80">
                                        <Calendar className="h-3 w-3 opacity-60 text-text-secondary" />
                                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Adm. {emp.contract?.admissionDate ? new Date(emp.contract.admissionDate).toLocaleDateString('pt-BR') : '--/--/--'}</p>
                                    </div>
                                </div>

                                <div className="col-span-1 flex justify-center relative">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 group-hover:shadow-md ${emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        emp.status === 'PENDING_APPROVAL' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                                            emp.status === 'WAITING_ONBOARDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                'bg-surface-secondary text-text-secondary border-border'
                                        }`}>
                                        {translateStatus(emp.status)}
                                    </span>
                                </div>

                                <div className="col-span-2 flex justify-end gap-3 opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 relative">
                                    {(emp.status === 'PENDING_APPROVAL' || emp.status === 'WAITING_ONBOARDING') && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                toast('🗑️ Protocolo de Exclusão', {
                                                    description: `Deseja realmente remover o registro de ${emp.name}?`,
                                                    action: {
                                                        label: 'Remover',
                                                        onClick: async () => {
                                                            const res = await deleteEmployee(emp.id);
                                                            if (res.success) {
                                                                toast.success('Registro removido');
                                                                loadEmployees();
                                                            } else {
                                                                toast.error(res.message);
                                                            }
                                                        }
                                                    }
                                                });
                                            }}
                                            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}

                                    {emp.status === 'PENDING_APPROVAL' && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                toast('🔄 Reset de Onboarding', {
                                                    description: `O colaborador ${emp.name} precisará preencher todos os dados novamente. Confirmar?`,
                                                    action: {
                                                        label: 'Resetar',
                                                        onClick: async () => {
                                                            const res = await resetOnboarding(emp.id);
                                                            if (res.success) {
                                                                toast.success('Onboarding reiniciado');
                                                                loadEmployees();
                                                            } else {
                                                                toast.error(res.message);
                                                            }
                                                        }
                                                    }
                                                });
                                            }}
                                            className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-amber-500/10"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                    )}

                                    {emp.status === 'ACTIVE' && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTransferringEmployee(emp); }}
                                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-xl hover:scale-110"
                                                title="Transferir Colaborador"
                                            >
                                                <Truck className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setVacationEmployee(emp); }}
                                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:scale-110"
                                                title="Gestão de Férias"
                                            >
                                                <Palmtree className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTerminatingEmployee(emp); }}
                                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl hover:scale-110"
                                                title="Iniciar Desligamento"
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}

                                    {(emp.status === 'TERMINATED' || emp.status === 'INACTIVE') && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setRehiringEmployee(emp); }}
                                            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:scale-110"
                                            title="Recontratar Colaborador"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); }} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all shadow-xl hover:scale-110" title="Editar Dossiê"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setTimeTrackingEmployee(emp); }} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:bg-text-primary hover:text-white transition-all shadow-xl hover:scale-110" title="Cartão de Ponto"><Clock className="h-4 w-4" /></button>
                                    <div className="w-8 flex items-center justify-center text-text-muted/20 group-hover:text-brand-orange transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {sortedEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                        <div className="w-20 h-20 rounded-full bg-text-primary/5 border border-border flex items-center justify-center mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Nenhum registro localizado</p>
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
                    defaultTab={vacationModalTab}
                />
            )}

            {terminatingEmployee && (
                <EmployeeTerminationModal
                    isOpen={!!terminatingEmployee}
                    onClose={() => setTerminatingEmployee(null)}
                    employee={terminatingEmployee}
                    onSuccess={() => {
                        setTerminatingEmployee(null);
                        loadEmployees();
                    }}
                />
            )}

            {rehiringEmployee && (
                <EmployeeRehireModal
                    isOpen={!!rehiringEmployee}
                    onClose={() => setRehiringEmployee(null)}
                    employee={rehiringEmployee}
                    onSuccess={() => {
                        setRehiringEmployee(null);
                        loadEmployees();
                    }}
                />
            )}

            <EmployeeCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    loadEmployees();
                }}
            />



            <EmployeeOnboardingRequestModal
                isOpen={isOnboardingRequestOpen}
                onClose={() => setIsOnboardingRequestOpen(false)}
                onSuccess={loadEmployees}
            />
        </div>
    );
}
