'use client';

import { useState, useEffect } from 'react';
import { createEmployee, updateEmployee, deleteEmployeeHealthRecord } from '../actions';
import { getCompanies } from '../../configuration/actions/companies';
import { getStores } from '../../configuration/actions/stores';
import { getJobRoles, getSectors } from '../../configuration/actions/auxiliary';
import { getShiftTypes } from '../../scales/actions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CloudUpload, FileText, Lock, Users, Phone, MapPin, Briefcase, CreditCard, HeartPulse, GraduationCap, CheckCircle2, ArrowRightCircle, ChevronLeft, Calendar as CalendarIcon, User, Home, Building2, Banknote, ShieldPlus, FolderOpen, Key, Star, Plus, X, Trash2 } from 'lucide-react';
import { uploadEmployeePhoto, uploadEmployeeDocument } from '@/lib/firebase/storage-utils';
import { formatSafeDate, parseSafeDate } from '@/shared/utils/date-utils';
import { useHorizontalScroll } from '@/shared/hooks/use-horizontal-scroll';

interface EmployeeFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: any;
    employeeId?: string;
    defaultTab?: string;
}

// Mask Utility Functions
const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCep = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
};

const maskPIS = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{5})(\d)/, '$1.$2')
        .replace(/(\d{2})(\d)/, '$1-$2')
        .replace(/(-\d{1})\d+?$/, '$1');
};

const maskCTPS = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{7})(\d)/, '$1 $2')
        .replace(/(\s\d{3})(\d)/, '$1-$2')
        .replace(/(-\d{1})\d+?$/, '$1');
};

const maskLandline = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCurrency = (value: string | number) => {
    if (value === undefined || value === null || value === '') return '';
    let strValue = String(value);
    if (typeof value === 'number') {
        strValue = value.toFixed(2).replace('.', '');
    }
    const numbers = strValue.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
};

export function EmployeeForm({ onSuccess, onCancel, initialData, employeeId, defaultTab }: EmployeeFormProps) {
    const [loading, setLoading] = useState(false);
    const [refsLoading, setRefsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab || 'personal');
    const [currentId, setCurrentId] = useState<string | null>(employeeId || null);
    const { scrollRef, onMouseMove, onMouseLeave } = useHorizontalScroll();

    // Form States for masked inputs
    const [cpf, setCpf] = useState(initialData?.cpf || '');
    const [employeeName, setEmployeeName] = useState(initialData?.name || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [landline, setLandline] = useState(initialData?.landline || '');
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
    const [zipCode, setZipCode] = useState(initialData?.address?.zipCode || '');
    const [addressFields, setAddressFields] = useState({
        street: initialData?.address?.street || '',
        number: initialData?.address?.number || '',
        complement: initialData?.address?.complement || '',
        neighborhood: initialData?.address?.neighborhood || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || ''
    });
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

    // Sync email to accessEmail
    const [personalEmail, setPersonalEmail] = useState(initialData?.email || '');
    const [accessEmail, setAccessEmail] = useState(initialData?.email || '');

    const [pis, setPis] = useState(initialData?.pis || '');
    const [ctps, setCtps] = useState(initialData?.ctps || '');

    const [companiesList, setCompaniesList] = useState<any[]>([]);
    const [storesList, setStoresList] = useState<any[]>([]);
    const [jobRolesList, setJobRolesList] = useState<any[]>([]);
    const [sectorsList, setSectorsList] = useState<any[]>([]);
    const [shiftsList, setShiftsList] = useState<any[]>([]);

    useEffect(() => {
        const loadRefs = async () => {
            try {
                console.log('Loading references...');
                const [compRes, storeRes, roleRes, sectorRes, shiftRes] = await Promise.all([
                    getCompanies(),
                    getStores(),
                    getJobRoles(),
                    getSectors(),
                    getShiftTypes()
                ]);

                console.log('Refs loaded:', { compRes, storeRes, roleRes, sectorRes, shiftRes });

                if (compRes.success) setCompaniesList(compRes.data || []);
                if (storeRes.success) setStoresList(storeRes.data || []);
                if (roleRes.success) setJobRolesList(roleRes.data || []);
                if (sectorRes.success) setSectorsList(sectorRes.data || []);
                if (shiftRes.success) setShiftsList(shiftRes.data || []);
            } catch (error) {
                console.error('Error loading refs:', error);
                toast.error('Erro ao carregar dados do formulário');
            } finally {
                setRefsLoading(false);
            }
        };
        loadRefs();
    }, []);

    // Documents State
    const [uploadedFiles, setUploadedFiles] = useState<any[]>(initialData?.documents || []);
    const [activeDocTab, setActiveDocTab] = useState("personal_docs");

    const docCategories = [
        { id: 'personal_docs', label: 'Pessoais', icon: '👤' },
        { id: 'contract_docs', label: 'Contratuais', icon: '📝' },
        { id: 'benefit_docs', label: 'Benefícios', icon: '🎫' },
        { id: 'disciplinary_docs', label: 'Disciplinares', icon: '⚠️' },
        { id: 'pcf_docs', label: 'PCF (Provas)', icon: '⚖️' },
        { id: 'other_docs', label: 'Outros', icon: '📂' },
    ];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!currentId) {
            toast.error("Salve os dados básicos antes de enviar documentos.");
            return;
        }

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file =>
                uploadEmployeeDocument(file, currentId, employeeName, category)
            );

            const uploadedResults = await Promise.all(uploadPromises);
            setUploadedFiles(prev => [...prev, ...uploadedResults]);
            toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Falha ao enviar arquivos para o Firebase.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Filter files by current active category for display
    const currentCategoryFiles = uploadedFiles.filter(f => f.type === activeDocTab);

    const calculateAge = (dateString: string) => {
        if (!dateString) return 20;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Helper to safety get date string YYYY-MM-DD
    const safeDate = (date: any) => {
        if (!date) return '';
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch { return ''; }
    };

    const initialDob = safeDate(initialData?.dateOfBirth);
    const [birthDate, setBirthDate] = useState(initialDob);
    const [isMinor, setIsMinor] = useState(false); // Default to false to avoid hydration mismatch

    useEffect(() => {
        // Set actual minor status after mount
        if (initialDob) {
            setIsMinor(calculateAge(initialDob) < 18);
        }
    }, [initialDob]);

    const [maritalStatus, setMaritalStatus] = useState(initialData?.maritalStatus || "");
    const [hasDependents, setHasDependents] = useState(initialData?.dependents?.length > 0 || initialData?.contract?.familySalaryDependents > 0 || false);
    const [dependents, setDependents] = useState<any[]>(initialData?.dependents || []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setBirthDate(newDate);

        if (newDate) {
            const age = calculateAge(newDate);
            const minor = age < 18;

            if (minor && !isMinor) {
                // Alert user about the new requirement
                toast.warning("⚠️ ATENÇÃO: Colaborador menor de idade!\n\nÉ obrigatório o preenchimento da aba 'Responsável Legal'.", {
                    duration: 6000
                });
            }
            setIsMinor(minor);
        } else {
            setIsMinor(false);
        }
    };

    const handleMaritalStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setMaritalStatus(value);
        if (value === 'Casado') {
            toast.info("Aba 'Dados do Cônjuge' habilitada.");
        }
    };

    const handleHasDependentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setHasDependents(checked);
        if (checked) {
            toast.info("Aba 'Dependentes' habilitada.");
            if (dependents.length === 0) {
                addDependent();
            }
        }
    };

    const addDependent = () => {
        setDependents([...dependents, { name: '', cpf: '', rg: '', birthDate: '', relationship: '' }]);
    };

    const removeDependent = (index: number) => {
        setDependents(dependents.filter((_, i) => i !== index));
    };

    const updateDependent = (index: number, field: string, value: string) => {
        const newDeps = [...dependents];
        newDeps[index] = { ...newDeps[index], [field]: value };
        setDependents(newDeps);
    };

    // --- Contract Logic ---
    const [hireDate, setHireDate] = useState(initialData?.hireDate ? safeDate(initialData.hireDate) : '');
    const [expDays, setExpDays] = useState(initialData?.contract?.experienceDays || 45);
    const [isExtended, setIsExtended] = useState(initialData?.contract?.isExperienceExtended || false);
    const [extDays, setExtDays] = useState(initialData?.contract?.experienceExtensionDays || 45);

    const calculateContractEnd = () => {
        if (!hireDate) return null;
        const start = new Date(hireDate);
        const totalDays = expDays + (isExtended ? extDays : 0);

        // Validation for max 90 days
        if (totalDays > 90) {
            return { date: null, error: true };
        }

        const end = new Date(start);
        end.setDate(end.getDate() + totalDays);
        return { date: end.toLocaleDateString(), error: false };
    };

    const contractEndData = calculateContractEnd();

    // --- ASO Logic ---
    const latestAsoRecord = initialData?.healthRecords?.[0];
    const [asoType, setAsoType] = useState(latestAsoRecord ? "Periodico" : "Admissional");
    const [targetRoleId, setTargetRoleId] = useState('');
    const [lastAso, setLastAso] = useState('');
    const [asoPeriodicity, setAsoPeriodicity] = useState(latestAsoRecord?.periodicity || 12);
    const [asoFileUrl, setAsoFileUrl] = useState<string | null>(null);

    const calculateNextAso = () => {
        const baseDate = lastAso ? new Date(lastAso) : (latestAsoRecord?.lastAsoDate ? new Date(latestAsoRecord.lastAsoDate) : null);
        if (!baseDate) return null;

        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + parseInt(String(asoPeriodicity)));
        return nextDate.toLocaleDateString();
    };

    const nextAsoDate = calculateNextAso();

    const handleZipCodeBlur = async () => {
        const cleanCep = zipCode.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            setIsCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setAddressFields(prev => ({
                        ...prev,
                        street: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        city: data.localidade || '',
                        state: data.uf || ''
                    }));
                    toast.success("Endereço encontrado!");
                } else {
                    toast.error("CEP não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
                toast.error("Falha ao buscar CEP. Verifique sua conexão.");
            } finally {
                setIsCepLoading(false);
            }
        }
    };



    async function handleSaveStep(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {
        if (event.type === 'submit') event.preventDefault();

        const form = (event.currentTarget as any).form || (event.currentTarget.tagName === 'FORM' ? event.currentTarget : null);
        if (!form) return;

        const formData = new FormData(form);

        // --- Checkbox Persistence Logic ---
        // Explicitly handle all known checkboxes across all tabs to ensure 'false' is sent when unchecked.
        const allCheckboxFields = [
            'isExperienceContract', 'isExperienceExtended', 'hasCashHandling',
            'hasInsalubrity', 'hasDangerousness', 'hasTrustPosition',
            'hasTransportVoucher', 'hasFamilySalary'
        ];

        allCheckboxFields.forEach(field => {
            const element = form.querySelector(`input[name="${field}"]`) as HTMLInputElement;
            if (element) {
                formData.set(field, String(element.checked));
            }
        });

        // --- PIX Key Mandatory Check ---
        if (activeTab === 'bank' && !formData.get('pixKey')) {
            toast.error("A Chave PIX é obrigatória.");
            return;
        }

        const tabRequiredFields: Record<string, string[]> = {
            personal: ['name', 'cpf', 'rg', 'dateOfBirth', 'gender', 'maritalStatus', 'phone'],
            address: ['zipCode', 'city', 'state', 'street', 'number', 'neighborhood'],
            contract: ['companyId', 'jobRoleId', 'sectorId', 'storeId', 'hireDate', 'baseSalary', 'workShiftId'],
            bank: ['bankName', 'accountType', 'agency', 'accountNumber', 'pixKey'],
            health: asoType === 'MudancaFuncao' ? ['asoType', 'lastAsoDate', 'newRoleId'] : ['asoType', 'lastAsoDate'],
            access: ['accessEmail', 'accessPassword'],
            legal_guardian: isMinor ? ['guardianName', 'guardianCpf', 'guardianRg', 'guardianPhone', 'guardianRelationship'] : [],
            spouse: maritalStatus === 'Casado' ? ['spouseName'] : []
        };

        const missingFields = tabRequiredFields[activeTab]?.filter(field => !formData.get(field));

        if (missingFields?.length) {
            toast.error(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (uploadedFiles.length > 0) {
                formData.append('documents', JSON.stringify(uploadedFiles));
            }

            // Sync emails if we are in access tab
            if (activeTab === 'access' && accessEmail) {
                formData.set('email', accessEmail);
            }

            if (hasDependents && dependents.length > 0) {
                formData.set('dependents', JSON.stringify(dependents));
            }

            // --- CRITICAL FIX: Only send data from the active tab (+ identity) to prevent FK violations ---
            // If we are on 'personal' or 'address', we should NOT be sending 'jobRoleId' if it's not yet filled.
            // However, since we use native FormData, it gets everything. 
            // We will filter it here or rely on the Service fix. To be safe, let's filter:
            if (currentId && (activeTab === 'personal' || activeTab === 'address')) {
                const fieldsToRemove = ['jobRoleId', 'sectorId', 'companyId', 'storeId', 'workShiftId'];
                fieldsToRemove.forEach(f => {
                    if (!formData.get(f)) formData.delete(f);
                });
            }

            let result;
            if (currentId) {
                result = await updateEmployee(currentId, formData);
            } else {
                result = await createEmployee(formData);
            }

            if (result.success) {
                if (!currentId && result.data?.id) {
                    const newId = result.data.id;
                    setCurrentId(newId);

                    // Handle pending photo upload if this was a new creation
                    if (pendingPhotoFile) {
                        try {
                            const url = await uploadEmployeePhoto(pendingPhotoFile, newId, employeeName);
                            const photoFormData = new FormData();
                            photoFormData.append('photoUrl', url);
                            await updateEmployee(newId, photoFormData);
                            setPhotoPreview(url);
                            setPendingPhotoFile(null);
                        } catch (err) {
                            console.error("Failed to upload pending photo:", err);
                        }
                    }

                    // NEW: If we have a generated PIN, show it to the admin
                    if (result.data.generatedPin) {
                        toast.success(`Colaborador cadastrado! PIN de acesso inicial: ${result.data.generatedPin}`, {
                            duration: 10000,
                            description: "IMPORTANTE: Anote este PIN e entregue ao colaborador. Ele será solicitado no primeiro acesso."
                        });
                    } else {
                        toast.success("Dados salvos com sucesso!");
                    }
                } else {
                    toast.success("Dados salvos com sucesso!");
                }

                const currentIndex = visibleTabs.findIndex(t => t.id === activeTab);

                if (currentIndex !== -1 && currentIndex < visibleTabs.length - 1) {
                    const nextTabId = visibleTabs[currentIndex + 1].id;
                    setActiveTab(nextTabId);
                } else if (currentIndex === visibleTabs.length - 1) {
                    setSuccess(true);
                    if (onSuccess) onSuccess();
                }
            } else {
                // Prioritize result.message which contains the friendly message from the Service Layer
                const msg = result.message || (typeof result.error === 'string' ? result.error : (result.error?.message || 'Erro técnico ao salvar.'));
                setError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            console.error('Fatal crash in handleSaveStep:', err);
            toast.error(`Erro crítico: ${err.message || 'Desconhecido'}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await handleSaveStep(event);
    }

    const tabs = [
        {
            id: 'personal',
            label: '👤 Dados Pessoais',
            content: (
                <div className="space-y-6 md:space-y-12">
                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                        {/* Avatar Column */}
                        <div className="lg:col-span-3 flex flex-col items-center space-y-4">
                            <div className="relative w-40 h-52 bg-white/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                                ) : photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-slate-500 text-center p-4">
                                        <span className="text-3xl block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">📷</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">ADICIONAR<br />FOTOGRAFIA</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    disabled={isUploading}
                                    onClick={(e) => (e.currentTarget.value = '')}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (currentId) {
                                            setIsUploading(true);
                                            try {
                                                const url = await uploadEmployeePhoto(file, currentId, employeeName);
                                                setPhotoPreview(url);

                                                const formData = new FormData();
                                                formData.append('photoUrl', url);
                                                await updateEmployee(currentId, formData);

                                                toast.success("Fotografia atualizada com sucesso");
                                            } catch (error) {
                                                toast.error("Falha no upload da imagem");
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        } else {
                                            setPendingPhotoFile(file);
                                            const localUrl = URL.createObjectURL(file);
                                            setPhotoPreview(localUrl);
                                            toast.info("Imagem registrada. Confirmação pendente de salvamento.");
                                        }
                                    }}
                                />
                            </div>
                            <input type="hidden" name="photoUrl" value={photoPreview || ''} />
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mt-2">Padrão 3x4 Recomendado</p>
                        </div>

                        {/* Fields Column */}
                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nome Completo do Ativo *</label>
                                <Input
                                    name="name"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="NOME COMPLETO OFICIAL"
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Protocolo Fiscal (CPF) *</label>
                                <Input
                                    name="cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identidade Civil (RG) *</label>
                                <Input
                                    name="rg"
                                    defaultValue={initialData?.rg}
                                    placeholder="00.000.000-0"
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data de Nascimento *</label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    value={birthDate}
                                    onChange={handleDateChange}
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/50 text-white fill-white calendar-light"
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Sexo Biológico *</label>
                                <select
                                    name="gender"
                                    defaultValue={initialData?.gender || ""}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                    required
                                >
                                    <option value="" className="bg-[#0A0F1C]">SELECIONAR...</option>
                                    <option value="MALE" className="bg-[#0A0F1C]">Masculino</option>
                                    <option value="FEMALE" className="bg-[#0A0F1C]">Feminino</option>
                                    <option value="OTHER" className="bg-[#0A0F1C]">Outro</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Status Civil *</label>
                                    <select
                                        name="maritalStatus"
                                        value={maritalStatus}
                                        onChange={handleMaritalStatusChange}
                                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                    >
                                        <option value="" className="bg-[#0A0F1C]">SELECIONAR...</option>
                                        <option value="Solteiro" className="bg-[#0A0F1C]">Solteiro(a)</option>
                                        <option value="Casado" className="bg-[#0A0F1C]">Casado(a)</option>
                                        <option value="Divorciado" className="bg-[#0A0F1C]">Divorciado(a)</option>
                                        <option value="Viuvo" className="bg-[#0A0F1C]">Viúvo(a)</option>
                                        <option value="UniaoEstavel" className="bg-[#0A0F1C]">União Estável</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 px-6 rounded-2xl border border-white/5 h-14">
                                    <input
                                        type="checkbox"
                                        id="hasDependents"
                                        checked={hasDependents}
                                        onChange={handleHasDependentsChange}
                                        className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-indigo-500 focus:ring-0"
                                    />
                                    <label htmlFor="hasDependents" className="text-[10px] font-black text-white uppercase tracking-widest cursor-pointer">
                                        Declara Dependentes
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contacts */}
                    <div className="pt-8 mt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-px bg-sky-500/30" />
                            Matriz de Comunicação
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Linha Fixa</label>
                                <Input
                                    name="landline"
                                    value={landline}
                                    onChange={(e) => setLandline(maskLandline(e.target.value))}
                                    placeholder="(00) 0000-0000"
                                    maxLength={14}
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-sky-500/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal Móvel *</label>
                                <Input
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-sky-500/30"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Endereço Eletrônico Primário</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={personalEmail}
                                    onChange={(e) => {
                                        setPersonalEmail(e.target.value);
                                        setAccessEmail(e.target.value);
                                    }}
                                    placeholder="NOME@DOMINIO.COM"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-sky-500/30"
                                />
                            </div>
                        </div>

                        {/* Banner Impulso */}
                        <div className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 flex items-center justify-between shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                            <div className="relative z-10">
                                <h5 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="text-xl">🚀</span>
                                    PLATAFORMA IMPULSO
                                </h5>
                                <p className="text-indigo-200/60 text-[10px] font-medium tracking-widest mt-2 uppercase">Cadastre o colaborador na escola de supermercado.</p>
                            </div>
                            <button
                                type="button"
                                className="relative z-10 h-12 px-6 rounded-xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1qSD136wZnuJ8-ZHUb20UwYOxTBxJ5Nw0/edit?gid=1946873591#gid=1946873591', '_blank')}
                            >
                                ACESSAR PLATAFORMA
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Emergency Contact */}
                    <div className="pt-8 mt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-px bg-rose-500/30" />
                            Protocolo de Segurança Crítica (Emergência)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identidade do Guardião</label>
                                <Input
                                    name="emergencyContactName"
                                    defaultValue={initialData?.emergencyContactName}
                                    placeholder="NOME DO PORTA-VOZ DE EMERGÊNCIA"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-rose-500/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal de Urgência</label>
                                <Input
                                    name="emergencyContactPhone"
                                    defaultValue={initialData?.emergencyContactPhone}
                                    placeholder="(00) 00000-0000"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-rose-500/30"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nível de Vínculo</label>
                                <select
                                    name="emergencyContactRelationship"
                                    defaultValue={initialData?.emergencyContactRelationship || ""}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-rose-500/30"
                                >
                                    <option value="" className="bg-[#0A0F1C]">SELECIONAR...</option>
                                    <option value="Pai/Mãe" className="bg-[#0A0F1C]">Ascendente (Pai/Mãe)</option>
                                    <option value="Cônjuge" className="bg-[#0A0F1C]">Parceiro(a) Oficial</option>
                                    <option value="Filho(a)" className="bg-[#0A0F1C]">Descendente (Filho/a)</option>
                                    <option value="Irmão(a)" className="bg-[#0A0F1C]">Colateral (Irmão/a)</option>
                                    <option value="Amigo(a)" className="bg-[#0A0F1C]">Terceiro de Confiança</option>
                                    <option value="Outro" className="bg-[#0A0F1C]">Registro Diverso</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'legal_guardian',
            label: '⚠️ Controle Tutelar',
            content: (
                <div className="space-y-10">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-amber-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
                            <span className="text-xl">⚠️</span>
                            CLÁUSULA DE MENORIDADE
                        </h4>
                        <p className="text-amber-200/60 text-xs font-medium leading-relaxed max-w-2xl uppercase tracking-tighter">
                            Aviso Restrito: O preenchimento da hierarquia civil é compulsório para operacionais registrados sem maioridade plena (18 anos) no ato da admissão.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Pessoa Física Tutelar</label>
                            <Input
                                name="guardianName"
                                defaultValue={initialData?.legalGuardian?.name}
                                placeholder="NOME DO RESPONSÁVEL"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-amber-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Protocolo Fiscal Tutelar (CPF)</label>
                            <Input
                                name="guardianCpf"
                                defaultValue={initialData?.legalGuardian?.cpf}
                                placeholder="000.000.000-00"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-amber-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registro Civil Tutelar (RG)</label>
                            <Input
                                name="guardianRg"
                                defaultValue={initialData?.legalGuardian?.rg}
                                placeholder="IDENTIDADE CIVIL"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-amber-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal de Contato Tutelar</label>
                            <Input
                                name="guardianPhone"
                                defaultValue={initialData?.legalGuardian?.phone}
                                placeholder="(00) 00000-0000"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-amber-500/30"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Natureza Legal do Vínculo</label>
                            <select
                                name="guardianRelationship"
                                defaultValue={initialData?.legalGuardian?.relationship || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-amber-500/30"
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONAR...</option>
                                <option value="Mãe" className="bg-[#0A0F1C]">Tutoria Materna</option>
                                <option value="Pai" className="bg-[#0A0F1C]">Tutoria Paterna</option>
                                <option value="Tutor" className="bg-[#0A0F1C]">Nomeação Judicial</option>
                                <option value="Outro" className="bg-[#0A0F1C]">Estrutura Diversa</option>
                            </select>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'spouse',
            label: '💍 Vínculo Matrimonial',
            content: (
                <div className="space-y-10">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">💍</span>
                            DADOS CONJUGAIS
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identidade do Cônjuge</label>
                            <Input
                                name="spouseName"
                                defaultValue={initialData?.spouse?.name}
                                placeholder="NOME DO PARCEIRO OFICIAL"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-indigo-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registro Fiscal (CPF)</label>
                            <Input
                                name="spouseCpf"
                                defaultValue={initialData?.spouse?.cpf}
                                placeholder="000.000.000-00"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registro Civil (RG)</label>
                            <Input
                                name="spouseRg"
                                defaultValue={initialData?.spouse?.rg}
                                placeholder="IDENTIDADE CIVIL"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-indigo-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data de Nascimento Originária</label>
                            <Input
                                name="spouseBirthDate"
                                type="date"
                                defaultValue={safeDate(initialData?.spouse?.birthDate)}
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest text-white fill-white focus:border-indigo-500/30 calendar-light"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal de Comunicação</label>
                            <Input
                                name="spousePhone"
                                defaultValue={initialData?.spouse?.phone}
                                placeholder="(00) 00000-0000"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/30"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dependents',
            label: '👨‍👩‍👧‍👦 Matriz de Dependentes',
            content: (
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Controle de Beneficiários</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Acrescente instâncias dependentes habilitadas</p>
                        </div>
                        <button
                            type="button"
                            onClick={addDependent}
                            className="h-14 px-8 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(99,102,241,0.2)] shrink-0 group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            AUTORIZAR INSERÇÃO
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {dependents.map((dep, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-8 border border-white/5 rounded-[2rem] bg-white/[0.02] relative group hover:border-indigo-500/30 transition-all shadow-xl"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeDependent(index)}
                                        className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-90 z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative mt-4 md:mt-0">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificação Plena</label>
                                            <Input
                                                value={dep.name}
                                                onChange={(e) => updateDependent(index, 'name', e.target.value)}
                                                placeholder="NOME DO DEPENDENTE"
                                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-indigo-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Elo Familiar</label>
                                            <select
                                                value={dep.relationship}
                                                onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                            >
                                                <option value="" className="bg-[#0A0F1C]">SELECIONAR...</option>
                                                <option value="Filho(a)" className="bg-[#0A0F1C]">Criança/Adolescente (Filho)</option>
                                                <option value="Enteado(a)" className="bg-[#0A0F1C]">Criança/Adolescente (Enteado)</option>
                                                <option value="Pai/Mãe" className="bg-[#0A0F1C]">Progenitor(a)</option>
                                                <option value="Outro" className="bg-[#0A0F1C]">Relação Excepcional</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registro Vitalício (Nascimento)</label>
                                            <Input
                                                type="date"
                                                value={dep.birthDate ? safeDate(dep.birthDate) : ''}
                                                onChange={(e) => updateDependent(index, 'birthDate', e.target.value)}
                                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest text-white fill-white focus:border-indigo-500/50 calendar-light"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Protocolo ID (Situação Legal)</label>
                                            <Input
                                                value={dep.cpf}
                                                onChange={(e) => updateDependent(index, 'cpf', e.target.value)}
                                                placeholder="000.000.000-00 (OPCIONAL INFRA 12 ANOS)"
                                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {dependents.length === 0 && (
                            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                                <Users className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nenhuma entidade vinculada registrada</p>
                                <button type="button" onClick={addDependent} className="mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-300 transition-colors bg-indigo-500/10 px-6 py-3 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 shadow-xl">
                                    Iniciar Novo Vínculo Diferenciado →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 'address',
            label: '📍 Localização Residencial',
            content: (
                <div className="space-y-6 md:space-y-10">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-emerald-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">📍</span>
                            DADOS DE MORADIA
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Código Postal (CEP) *</label>
                            <div className="relative">
                                <Input
                                    name="zipCode"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(maskCep(e.target.value))}
                                    onBlur={handleZipCodeBlur}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest focus:border-emerald-500/30"
                                />
                                {isCepLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                                Município e Estado *
                            </label>
                            <div className="grid grid-cols-12 gap-4">
                                <Input
                                    name="city"
                                    value={addressFields.city}
                                    onChange={(e) => setAddressFields({ ...addressFields, city: e.target.value })}
                                    placeholder="CIDADE"
                                    required
                                    className="col-span-9 h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                                />
                                <Input
                                    name="state"
                                    value={addressFields.state}
                                    onChange={(e) => setAddressFields({ ...addressFields, state: e.target.value })}
                                    placeholder="UF"
                                    maxLength={2}
                                    required
                                    className="col-span-3 h-14 bg-white/5 border-white/5 rounded-2xl px-0 text-center text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Endereço Principal e Numeração *</label>
                            <div className="grid grid-cols-12 gap-4">
                                <Input
                                    name="street"
                                    value={addressFields.street}
                                    onChange={(e) => setAddressFields({ ...addressFields, street: e.target.value })}
                                    placeholder="NOME DO LOGRADOURO..."
                                    required
                                    className="col-span-9 h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                                />
                                <Input
                                    name="number"
                                    value={addressFields.number}
                                    onChange={(e) => setAddressFields({ ...addressFields, number: e.target.value })}
                                    placeholder="Nº"
                                    required
                                    className="col-span-3 h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Informação Adicional (Complemento)</label>
                            <Input
                                name="complement"
                                value={addressFields.complement}
                                onChange={(e) => setAddressFields({ ...addressFields, complement: e.target.value })}
                                placeholder="BLOCO, APTO, QUADRA..."
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Setor/Bairro *</label>
                            <Input
                                name="neighborhood"
                                value={addressFields.neighborhood}
                                onChange={(e) => setAddressFields({ ...addressFields, neighborhood: e.target.value })}
                                placeholder="NOME DO BAIRRO"
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-emerald-500/30"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'contract',
            label: '💼 Vínculo Empregatício',
            content: (
                <div className="space-y-6 md:space-y-10">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-indigo-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">🏢</span>
                            DADOS CONTRATUAIS
                        </h4>
                    </div>

                    {/* Professional Header Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Unidade Contratante *</label>
                            <select
                                name="companyId"
                                defaultValue={initialData?.contract?.companyId || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE A EMPRESA...</option>
                                {companiesList.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#0A0F1C]">
                                        {c.tradingName || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificação Interna (Matrícula)</label>
                            <Input
                                name="registrationNumber"
                                disabled
                                placeholder="GERAÇÃO AUTOMÁTICA VIA SISTEMA"
                                className="h-14 bg-white/[0.02] border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase cursor-not-allowed opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Posição Hierárquica (Cargo) *</label>
                            <select
                                name="jobRoleId"
                                defaultValue={initialData?.jobRoleId || initialData?.contract?.jobRoleId || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE O CARGO...</option>
                                {jobRolesList.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#0A0F1C]">{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Departamento Alocado *</label>
                            <select
                                name="sectorId"
                                defaultValue={initialData?.contract?.sectorId || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE O SETOR...</option>
                                {sectorsList.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#0A0F1C]">{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Unidade de Lotação (Loja) *</label>
                            <select
                                name="storeId"
                                defaultValue={initialData?.contract?.storeId || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE A UNIDADE...</option>
                                {storesList.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#0A0F1C]">
                                        {s.tradingName || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data Oficial de Admissão *</label>
                            <Input
                                name="hireDate"
                                type="date"
                                value={hireDate}
                                onChange={(e) => setHireDate(e.target.value)}
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest text-white fill-white focus:border-indigo-500/50 calendar-light"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Remuneração Base (R$) *</label>
                            <Input
                                name="baseSalary"
                                type="text"
                                defaultValue={initialData?.contract?.baseSalary ? maskCurrency(initialData.contract.baseSalary) : ''}
                                onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                placeholder="R$ 1.621,00"
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Escala de Trabalho *</label>
                            <select
                                name="workShiftId"
                                defaultValue={initialData?.contract?.workShiftId || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE O TURNO...</option>
                                {shiftsList.map((s: any) => (
                                    <option key={s.id} value={s.id} className="bg-[#0A0F1C]">
                                        {s.name} ({s.startTime} AS {s.endTime})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Experience Contract Section */}
                    <div className="pt-8 mt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-px bg-amber-500/30" />
                            Regime de Experiência Probatória
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="flex items-center gap-4 bg-white/5 px-6 rounded-2xl border border-white/5 h-14 col-span-1 md:col-span-2 lg:col-span-1">
                                <input
                                    type="checkbox"
                                    name="isExperienceContract"
                                    defaultChecked={initialData?.contract?.isExperienceContract}
                                    id="expContract"
                                    className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="expContract" className="text-[10px] font-black text-white uppercase tracking-widest cursor-pointer">
                                    Ativar Regime de Experiência
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Ciclo Primário (Dias)</label>
                                <select
                                    name="experienceDays"
                                    value={expDays}
                                    onChange={(e) => setExpDays(parseInt(e.target.value))}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-indigo-500/50"
                                >
                                    <option value={30} className="bg-[#0A0F1C]">30 DIAS CORRIDOS</option>
                                    <option value={45} className="bg-[#0A0F1C]">45 DIAS CORRIDOS</option>
                                    <option value={90} className="bg-[#0A0F1C]">90 DIAS CORRIDOS</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 px-6 rounded-2xl border border-white/5 h-14 col-span-1 md:col-span-2 lg:col-span-1">
                                <input
                                    type="checkbox"
                                    name="isExperienceExtended"
                                    checked={isExtended}
                                    onChange={(e) => setIsExtended(e.target.checked)}
                                    id="expExtended"
                                    className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="expExtended" className="text-[10px] font-black text-white uppercase tracking-widest cursor-pointer">
                                    Prorrogar Vínculo (Extensão)
                                </label>
                            </div>

                            {isExtended && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Prorrogação (Dias)</label>
                                    <select
                                        name="experienceExtensionDays"
                                        value={extDays}
                                        onChange={(e) => setExtDays(parseInt(e.target.value))}
                                        className={`w-full h-14 bg-white/5 border rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none ${contractEndData?.error ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-indigo-500/50'}`}
                                    >
                                        <option value={30} className="bg-[#0A0F1C]">+ 30 DIAS CORRIDOS</option>
                                        <option value={45} className="bg-[#0A0F1C]">+ 45 DIAS CORRIDOS</option>
                                        <option value={60} className="bg-[#0A0F1C]">+ 60 DIAS CORRIDOS</option>
                                    </select>
                                    {contractEndData?.error && (
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2 ml-4 flex items-center gap-2">
                                            <X className="w-3 h-3" /> VIOLAÇÃO: MÁXIMO DE 90 DIAS EXCEDIDO
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Info Banner for Contract End */}
                        <div className={`mt-8 border backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 transition-all duration-300 ${contractEndData?.error ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}>
                            <span className="text-2xl">{contractEndData?.error ? '🛑' : '⏳'}</span>
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                                    DATA LIMITE DO CONTRATO
                                </h5>
                                <p className="text-lg font-bold tracking-tight">
                                    {contractEndData?.error
                                        ? "CONFLITO TEMPORAL DETECTADO"
                                        : (contractEndData?.date || "PENDENTE DE DATA INICIAL")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Benefits Section - Matching the Image List Style */}
                    <div className="border-t border-slate-800 pt-6 mt-6">
                        <h4 className="text-white font-bold mb-6 text-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">Adicionais e Benefícios</h4>

                        <div className="space-y-3">
                            {/* Quebra de Caixa */}
                            <div className="flex items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasCashHandling" defaultChecked={initialData?.contract?.hasCashHandling} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Quebra de Caixa</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select className="h-8 rounded md:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                        <option>R$ Fixo</option>
                                    </select>
                                    <Input
                                        name="cashHandlingBase"
                                        type="text"
                                        defaultValue={initialData?.contract?.cashHandlingBase ? maskCurrency(initialData.contract.cashHandlingBase) : ''}
                                        onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                        placeholder="R$ 10,00"
                                        className="h-8 w-24"
                                    />
                                </div>
                            </div>

                            {/* Insalubridade */}
                            <div className="flex flex-col sm:flex-row sm:items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors gap-3">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasInsalubrity" defaultChecked={initialData?.contract?.hasInsalubrity} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Insalubridade</label>
                                </div>
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <select className="h-8 rounded w-24 sm:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                        <option>grau</option>
                                    </select>
                                    <Input
                                        name="insalubrityBase"
                                        type="text"
                                        defaultValue={initialData?.contract?.insalubrityBase ? maskCurrency(initialData.contract.insalubrityBase) : ''}
                                        onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                        placeholder="R$ 20,00"
                                        className="h-8 flex-1 sm:w-24"
                                    />
                                </div>
                            </div>

                            {/* Periculosidade */}
                            <div className="flex flex-col sm:flex-row sm:items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors gap-3">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasDangerousness" defaultChecked={initialData?.contract?.hasDangerousness} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Periculosidade</label>
                                </div>
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <select className="h-8 rounded w-24 sm:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                    </select>
                                    <Input
                                        name="dangerousnessBase"
                                        type="text"
                                        defaultValue={initialData?.contract?.dangerousnessBase ? maskCurrency(initialData.contract.dangerousnessBase) : ''}
                                        onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                        placeholder="R$ 30,00"
                                        className="h-8 flex-1 sm:w-24"
                                    />
                                </div>
                            </div>

                            {/* Cargo de Confiança */}
                            <div className="flex items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasTrustPosition" defaultChecked={initialData?.contract?.hasTrustPosition} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Cargo Confiança</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select className="h-8 rounded md:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                    </select>
                                    <Input
                                        name="trustPositionBase"
                                        type="text"
                                        defaultValue={initialData?.contract?.trustPositionBase ? maskCurrency(initialData.contract.trustPositionBase) : ''}
                                        onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                        placeholder="R$ 40,00"
                                        className="h-8 w-24"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'bank',
            label: '💰 Dados Bancários',
            content: (
                <div className="space-y-6 md:space-y-10">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-rose-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">💰</span>
                            INFORMAÇÕES FINANCEIRAS
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Instituição Financeira *</label>
                            <Input
                                name="bankName"
                                defaultValue={initialData?.bankData?.bankName}
                                placeholder="EX: NUBANK, ITAÚ..."
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-rose-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nomenclatura da Conta *</label>
                            <select
                                name="accountType"
                                defaultValue={initialData?.bankData?.accountType || ""}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-rose-500/50"
                                required
                            >
                                <option value="" className="bg-[#0A0F1C]">SELECIONE A MODALIDADE...</option>
                                <option value="Corrente" className="bg-[#0A0F1C]">CONTA CORRENTE</option>
                                <option value="Poupanca" className="bg-[#0A0F1C]">CONTA POUPANÇA</option>
                                <option value="Salario" className="bg-[#0A0F1C]">CONTA SALÁRIO</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Código da Agência *</label>
                            <Input
                                name="agency"
                                defaultValue={initialData?.bankData?.agency}
                                placeholder="0000"
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-rose-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificação da Conta *</label>
                            <Input
                                name="accountNumber"
                                defaultValue={initialData?.bankData?.accountNumber}
                                placeholder="00000-0"
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-rose-500/30"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Credencial Transacional (Chave PIX) *</label>
                            <Input
                                name="pixKey"
                                defaultValue={initialData?.bankData?.pixKey}
                                placeholder="CPF, EMAIL OU CHAVE ALEATÓRIA"
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-rose-500/30"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'benefits',
            label: '🎁 Benefícios',
            content: (
                <div className="space-y-10">
                    <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-fuchsia-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">🎁</span>
                            PACOTE DE INCENTIVOS
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl gap-6 hover:border-fuchsia-500/30 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🚌</div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="hasTransportVoucher"
                                            defaultChecked={initialData?.contract?.hasTransportVoucher}
                                            id="vt-toggle"
                                            className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-fuchsia-500 focus:ring-0 cursor-pointer"
                                        />
                                        <label htmlFor="vt-toggle" className="text-[11px] font-black text-white uppercase tracking-widest cursor-pointer">
                                            Vale Transporte (Retenção 6%)
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                                        <a href="/portal/benefits/transport" target="_blank" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors ml-1">
                                            ATRIBUIÇÃO DE ROTA →
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <input type="hidden" name="transportVoucherValue" value="0" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-fuchsia-500/30 transition-colors space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🛒</div>
                                    <label className="text-[11px] font-black text-white uppercase tracking-widest">Vale Alimentação (VA)</label>
                                </div>
                                <Input
                                    name="mealVoucherValue"
                                    type="text"
                                    defaultValue={initialData?.contract?.mealVoucherValue ? maskCurrency(initialData.contract.mealVoucherValue) : ''}
                                    onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                    placeholder="R$ 0,00"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-fuchsia-500/30 w-full"
                                />
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-fuchsia-500/30 transition-colors space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🍽️</div>
                                    <label className="text-[11px] font-black text-white uppercase tracking-widest">Vale Refeição (VR)</label>
                                </div>
                                <Input
                                    name="foodVoucherValue"
                                    type="text"
                                    defaultValue={initialData?.contract?.foodVoucherValue ? maskCurrency(initialData.contract.foodVoucherValue) : ''}
                                    onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                    placeholder="R$ 0,00"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-fuchsia-500/30 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl gap-6 hover:border-fuchsia-500/30 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">👨‍👩‍👧</div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="hasFamilySalary"
                                        defaultChecked={initialData?.contract?.hasFamilySalary}
                                        id="familySalary"
                                        className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-fuchsia-500 focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="familySalary" className="text-[11px] font-black text-white uppercase tracking-widest cursor-pointer">Abono Familiar</label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 w-full lg:w-auto bg-white/5 p-2 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Nº BENEFICIÁRIOS:</span>
                                <Input
                                    name="familySalaryDependents"
                                    type="number"
                                    defaultValue={initialData?.contract?.familySalaryDependents || 0}
                                    className="h-10 w-20 bg-white/10 border-transparent rounded-xl text-center text-[12px] font-black"
                                />
                            </div>
                        </div>
                    </div>


                    <div className="pt-8 mt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-px bg-amber-500/30" />
                            Adicionais Remuneratórios
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Atributos Extraordinários</label>
                                <textarea
                                    name="otherBenefits"
                                    defaultValue={initialData?.contract?.otherBenefits}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-[11px] font-black text-white uppercase tracking-widest focus:border-amber-500/50 min-h-[140px] resize-none"
                                    placeholder="ESPECIFICAR PLANOS DE SAÚDE, SEGUROS OU SUBSÍDIOS ADICIONAIS..."></textarea>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Gratificação Recorrente (R$)</label>
                                <Input
                                    name="monthlyBonus"
                                    type="text"
                                    defaultValue={initialData?.contract?.monthlyBonus ? maskCurrency(initialData.contract.monthlyBonus) : ''}
                                    onChange={(e) => { e.target.value = maskCurrency(e.target.value); }}
                                    placeholder="R$ 0,00"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-amber-500/30"
                                />
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <p className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest leading-relaxed">
                                        ESTE MONTANTE SERÁ INTEGRADO DIRETAMENTE AO SALÁRIO BASE DURANTE O CÁLCULO MENSAL DA FOLHA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'health',
            label: '🩺 Saúde (ASO)',
            content: (
                <div className="space-y-10">
                    <div className="bg-teal-500/10 border border-teal-500/20 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">🩺</span>
                            LANÇAR NOVO EXAME OCUPACIONAL (ASO)
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Classificação do Exame</label>
                            <select
                                name="asoType"
                                value={asoType}
                                onChange={(e) => setAsoType(e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-teal-500/50"
                            >
                                <option value="Admissional" className="bg-[#0A0F1C]">ADMISSIONAL</option>
                                <option value="Periodico" className="bg-[#0A0F1C]">PERIÓDICO</option>
                                <option value="Retorno" className="bg-[#0A0F1C]">RETORNO AO TRABALHO</option>
                                <option value="MudancaFuncao" className="bg-[#0A0F1C]">MUDANÇA DE FUNÇÃO</option>
                                <option value="Demissional" className="bg-[#0A0F1C]">DEMISSIONAL</option>
                            </select>
                        </div>
                        {asoType === 'MudancaFuncao' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-4">Nova Função (Designação)</label>
                                <select
                                    name="newRoleId"
                                    value={targetRoleId}
                                    onChange={(e) => setTargetRoleId(e.target.value)}
                                    className="w-full h-14 bg-white/5 border border-rose-500/30 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-rose-500"
                                >
                                    <option value="" className="bg-[#0A0F1C]">SELECIONE A NOVA FUNÇÃO...</option>
                                    {jobRolesList.map(role => (
                                        <option key={role.id} value={role.id} className="bg-[#0A0F1C]">{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data do Exame *</label>
                            <Input
                                name="lastAsoDate"
                                type="date"
                                value={lastAso}
                                onChange={(e) => setLastAso(e.target.value)}
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest text-white fill-white focus:border-teal-500/50 calendar-light"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Próximo Vencimento (Meses)</label>
                            <select
                                name="asoPeriodicity"
                                value={asoPeriodicity}
                                onChange={(e) => setAsoPeriodicity(e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest transition-all cursor-pointer appearance-none outline-none focus:border-teal-500/50"
                            >
                                <option value="6" className="bg-[#0A0F1C]">SEMESTRAL (06 MESES)</option>
                                <option value="12" className="bg-[#0A0F1C]">ANUAL (12 MESES)</option>
                                <option value="24" className="bg-[#0A0F1C]">BIENAL (24 MESES)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block mb-2">Upload do Certificado (Opcional)</label>
                            <div className="relative group/aso">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="aso-upload"
                                    accept="application/pdf,image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file && currentId) {
                                            setIsUploading(true);
                                            try {
                                                const res = await uploadEmployeeDocument(file, currentId, employeeName, 'health');
                                                setAsoFileUrl(res.fileUrl);
                                                toast.success("Documento do ASO anexado!");
                                            } catch (err) {
                                                toast.error("Erro ao subir documento");
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="aso-upload"
                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer group-hover/aso:border-teal-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                            <CloudUpload className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                            {asoFileUrl ? "DOCUMENTO ANEXADO" : "CLIQUE PARA ANEXAR O PDF/FOTO"}
                                        </span>
                                    </div>
                                    {asoFileUrl && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                </label>
                                <input type="hidden" name="asoFileUrl" value={asoFileUrl || ''} />
                            </div>
                        </div>

                        {/* Next Exam Prediction Display */}
                        <div className="md:col-span-2 bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-teal-500 uppercase tracking-widest">
                                        PROXIMA RENOVAÇÃO ESTIMADA
                                    </h5>
                                    <p className="text-sm font-bold text-white mt-1">
                                        {nextAsoDate || "AGUARDANDO DEFINIÇÃO DE DATA BASE"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Parecer e Restrições Clínicas</label>
                            <textarea
                                name="asoObservations"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-[11px] font-black text-white uppercase tracking-widest focus:border-teal-500/50 min-h-[140px] resize-none"
                                placeholder="DESCREVER AVALIAÇÃO DE APTIDÃO E POTENCIAIS LIMITAÇÕES FÍSICAS..."></textarea>
                        </div>
                    </div>

                    {/* ASO HISTORY SECTION */}
                    {initialData?.healthRecords?.length > 0 && (
                        <div className="pt-10 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Histórico de Exames Ocupacionais</h4>

                            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-[#0A0F1C]/50 shadow-inner">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo de Exame</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Data Realização</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Validade</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Atributos</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Doc.</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {initialData.healthRecords.map((record: any) => (
                                            <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex flex-shrink-0 items-center justify-center text-lg shadow-inner ring-1 ring-teal-500/30">
                                                            {record.asoType === 'Admissional' ? '🆕' : record.asoType === 'MudancaFuncao' ? '🔄' : record.asoType === 'Demissional' ? '🚫' : '📅'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{record.asoType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(record.lastAsoDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest py-1 px-3 bg-teal-500/10 rounded-full border border-teal-500/20">{record.periodicity} MESES</span>
                                                </td>
                                                <td className="p-5 text-center max-w-[200px]">
                                                    {record.observations ? (
                                                        <p className="text-[9px] text-slate-400 font-medium truncate" title={record.observations}>{record.observations}</p>
                                                    ) : <span className="text-slate-600">—</span>}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center">
                                                        {record.fileUrl ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(record.fileUrl, '_blank')}
                                                                className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-lg border border-teal-500/20 scale-95 hover:scale-105"
                                                                title="Visualizar Anexo"
                                                            >
                                                                📄
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-600 text-[9px] uppercase font-bold tracking-widest opacity-50">S/ ANEXO</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right w-12">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (confirm('Tem certeza que deseja apagar este registro de saúde? Esta ação não pode ser desfeita.')) {
                                                                const loadingToast = toast.loading("Removendo registro de ASO...");
                                                                try {
                                                                    const res = await deleteEmployeeHealthRecord(record.id);
                                                                    if (res.success) {
                                                                        toast.success("Registro removido com sucesso!", { id: loadingToast });
                                                                        if (onSuccess) onSuccess(); // Refresh data via callback
                                                                    } else {
                                                                        toast.error(res.error || "Erro ao remover registro", { id: loadingToast });
                                                                    }
                                                                } catch (error) {
                                                                    toast.error("Falha na comunicação com o servidor", { id: loadingToast });
                                                                }
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-400/50 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 mx-auto"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'documents',
            label: '📂 Documentos',
            content: (
                <div className="space-y-6 md:space-y-10">
                    <div className="bg-sky-500/10 border border-sky-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-sky-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">🏛️</span>
                            CONTRATO CORPORATIVO
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Inscrição Social (PIS/PASEP)</label>
                            <Input
                                name="pis"
                                value={pis}
                                onChange={(e) => setPis(maskPIS(e.target.value))}
                                placeholder="000.00000.00-0"
                                maxLength={14}
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-sky-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registro Trabalhista (CTPS)</label>
                            <Input
                                name="ctps"
                                value={ctps}
                                onChange={(e) => setCtps(maskCTPS(e.target.value))}
                                placeholder="1234567 000-0"
                                maxLength={12}
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-sky-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificação Eleitoral</label>
                            <Input
                                name="voterTitle"
                                defaultValue={initialData?.voterTitle}
                                placeholder="0000 0000 0000"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[11px] font-black tracking-widest uppercase focus:border-sky-500/30"
                            />
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-px bg-sky-500/30" />
                            Anexos Digitais
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {docCategories.map(cat => (
                                <div key={cat.id} className="p-6 border border-white/5 rounded-[2rem] bg-white/[0.02] hover:border-sky-500/30 transition-all group">
                                    <div className="mt-8 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pb-10">
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-xl opacity-80">{cat.icon}</span> {cat.label}
                                        </h5>
                                        <span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-[9px] font-black">
                                            {uploadedFiles.filter(f => f.type === cat.label).length} ITEM(S)
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {uploadedFiles.filter(f => f.type === cat.label).map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs bg-white/5 border border-white/10 p-3 rounded-xl hover:border-sky-500/50 transition-colors">
                                                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px] uppercase">{file.fileName}</span>
                                                <div className="flex space-x-3">
                                                    <a href={file.fileUrl} target="_blank" className="text-sky-400 hover:text-sky-300 font-bold uppercase text-[9px] tracking-widest">VISUALIZAR</a>
                                                    <button type="button" onClick={() => removeFile(uploadedFiles.indexOf(file))} className="text-rose-400 hover:text-rose-300 font-bold uppercase text-[9px] tracking-widest">REVOGAR</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <label className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors block ${isUploading ? 'border-sky-500/30 bg-sky-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                                        <input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            onClick={(e) => (e.currentTarget.value = '')}
                                            onChange={(e) => handleFileSelect(e, cat.label)}
                                            disabled={isUploading}
                                        />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 group-hover:text-slate-300 transition-colors">
                                            <CloudUpload className="w-4 h-4" />
                                            {isUploading ? 'PROCESSANDO...' : 'INSERIR DOCUMENTO'}
                                        </p>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'access',
            label: '🔐 Portal do Colaborador',
            content: (
                <div className="space-y-10">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="text-xl">🔐</span>
                            CREDENCIAIS DE SISTEMA
                        </h4>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-8 border-b border-white/5">
                            <div className="bg-orange-500/20 border border-orange-500/30 p-4 rounded-2xl shrink-0">
                                <Lock className="h-8 w-8 text-orange-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Protocolo Autenticação (CPF + PIN)</h4>
                                <p className="text-[11px] font-bold text-slate-500 uppercase mt-2 leading-relaxed max-w-2xl">
                                    O ACESSO AO PORTAL É RESTRITO E MONITORADO. UTILIZA-SE CRUZAMENTO DE DADOS ENTRE CPF OFICIAL E UMA CHAVE NUMÉRICA PESSOAL INTRANSFERÍVEL.
                                </p>
                            </div>
                        </div>

                        {!currentId ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4">
                                    <span className="text-2xl">💡</span>
                                    <p className="text-[11px] font-black text-orange-200/80 uppercase tracking-widest leading-loose">
                                        AO CONCLUIR O REGISTRO DESTE COLABORADOR, A PLATAFORMA SINTETIZARÁ UMA CHAVE PIN DE 6 DÍGITOS.
                                        ESTA CREDENCIAL SERÁ EXIBIDA UNICAMENTE NA TELA DE CONFIRMAÇÃO PARA REPASSE AO USUÁRIO FINAL.
                                    </p>
                                </div>
                                <p className="text-[10px] text-center font-black text-slate-600 uppercase tracking-[0.3em]">
                                    EXIGÊNCIA DE RENOVAÇÃO DA CHAVE APÓS O PRIMEIRO LOGIN ESTABELECIDA.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8 flex flex-col items-center justify-center py-6">
                                <p className="text-[11px] text-center font-black text-slate-400 uppercase tracking-widest max-w-xl leading-loose">
                                    VÍNCULO ATIVO. CASO HAJA COMPROMETIMENTO DA CREDENCIAL OU BLOQUEIO POR FALHAS SUCESSIVAS, ACESSE O PAINEL DE CONTROLE SECUNDÁRIO PARA RESET.
                                </p>

                                <div className="inline-flex flex-col items-center p-8 bg-black/40 border border-orange-500/40 rounded-[2rem] shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                                    <ShieldPlus className="w-12 h-12 text-orange-500 mb-4 opacity-80" />
                                    <p className="text-[9px] text-orange-500/70 uppercase font-black tracking-[0.4em] mb-2">STATUS DA CREDENCIAL</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <p className="text-sm font-black text-white tracking-widest">SISTEMA AUTORIZADO</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ];

    const visibleTabs = tabs.filter(t => {
        if (t.id === 'legal_guardian') return isMinor;
        if (t.id === 'spouse') return maritalStatus === 'Casado';
        if (t.id === 'dependents') return hasDependents;
        return true;
    });

    return (
        <div className="bg-[#0A0F1C]/95 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-full">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

            <div className="relative z-10 flex flex-col flex-1 min-h-0">
                {/* Premium Navigation Header */}
                <div className="border-b border-white/5 bg-white/[0.02] px-4 md:px-8 pt-6 md:pt-8 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                {currentId ? 'Modificar Perfil' : 'Novo Recrutamento'}
                                <span className="hidden sm:inline-block text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full tracking-[0.2em] ml-2 border border-indigo-500/20">
                                    HUMAN CAPITAL • 2026
                                </span>
                            </h2>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 ml-1">Terminal de Controle de Ativos e Talentos</p>
                        </div>
                        {currentId && (
                            <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <User className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Matriz de Dados</p>
                                    <p className="text-[11px] font-black text-white uppercase mt-1 truncate max-w-[200px]">{employeeName || 'CONFIGURANDO...'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-6 custom-scrollbar-horizontal no-scrollbar px-2 scroll-smooth touch-pan-x"
                        ref={scrollRef}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                    >
                        {visibleTabs.map((tab) => {
                            const isTabActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap group ${isTabActive
                                        ? 'text-black'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`transition-transform duration-500 group-hover:scale-110 ${isTabActive ? 'scale-110 z-10' : 'opacity-50'}`}>
                                        {tab.id === 'personal' && <User className="w-4 h-4" />}
                                        {tab.id === 'legal_guardian' && <ShieldPlus className="w-4 h-4" />}
                                        {tab.id === 'spouse' && <HeartPulse className="w-4 h-4" />}
                                        {tab.id === 'dependents' && <Users className="w-4 h-4" />}
                                        {tab.id === 'address' && <Home className="w-4 h-4" />}
                                        {tab.id === 'contract' && <Building2 className="w-4 h-4" />}
                                        {tab.id === 'bank' && <Banknote className="w-4 h-4" />}
                                        {tab.id === 'benefits' && <Star className="w-4 h-4" />}
                                        {tab.id === 'health' && <Activity className="w-4 h-4" />}
                                        {tab.id === 'documents' && <FolderOpen className="w-4 h-4" />}
                                        {tab.id === 'access' && <Key className="w-4 h-4" />}
                                    </span>
                                    <span className={isTabActive ? 'z-10' : ''}>{tab.label.split(' ').slice(1).join(' ')}</span>
                                    {isTabActive && (
                                        <motion.div
                                            layoutId="activeTabBadge"
                                            className="absolute inset-0 bg-white rounded-2xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0 bg-transparent">
                    <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 custom-scrollbar-vertical no-scrollbar scroll-smooth">
                        <AnimatePresence mode="wait">
                            {refsLoading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[400px] flex flex-col items-center justify-center space-y-8"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">Criptografando Túnel</h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Sincronizando registros da rede corporativa...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                    className="min-h-0"
                                >
                                    {visibleTabs.find(t => t.id === activeTab)?.content}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Premium Footer Actions */}
                    <div className="border-t border-white/5 bg-white/[0.01] p-10 backdrop-blur-3xl">
                        <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-6 max-w-4xl mx-auto">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full sm:w-auto h-16 px-10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancelar Operação
                                </button>
                            )}

                            {activeTab !== 'personal' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = visibleTabs.findIndex(t => t.id === activeTab);
                                        if (currentIndex > 0) setActiveTab(visibleTabs[currentIndex - 1].id);
                                    }}
                                    className="w-full sm:w-auto h-16 px-10 rounded-2xl border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    VOLTAR
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSaveStep}
                                className="w-full sm:w-auto sm:min-w-[320px] h-14 md:h-16 px-8 md:px-12 rounded-2xl bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SINCRONIZANDO...
                                    </>
                                ) : (
                                    <>
                                        {activeTab === visibleTabs[visibleTabs.length - 1].id ? 'FINALIZAR PROTOCOLO ADMISSIONAL' : 'AVANÇAR PARA PRÓXIMA ETAPA'}
                                        <ArrowRightCircle className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">Segurança nível militar • RH SYNC 2.0</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Float Notifications */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_20px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 backdrop-blur-xl border border-white/20"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Ação Executada com Sucesso
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_20px_40px_rgba(244,63,94,0.3)] flex items-center gap-3 backdrop-blur-xl border border-white/20"
                    >
                        <span className="text-lg">⚠️</span>
                        Falha no Protocolo: {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
