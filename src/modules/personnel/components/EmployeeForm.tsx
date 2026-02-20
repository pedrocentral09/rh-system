'use client';

import { useState, useEffect } from 'react';
import { createEmployee, updateEmployee } from '../actions';
import { getCompanies } from '../../configuration/actions/companies';
import { getStores } from '../../configuration/actions/stores';
import { getJobRoles, getSectors } from '../../configuration/actions/auxiliary';
import { getShiftTypes } from '../../scales/actions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, CloudUpload, FileText, Lock, Users, Phone, MapPin, Briefcase, CreditCard, HeartPulse, GraduationCap } from 'lucide-react';
import { uploadEmployeePhoto, uploadEmployeeDocument } from '@/lib/firebase/storage-utils';

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

export function EmployeeForm({ onSuccess, onCancel, initialData, employeeId, defaultTab }: EmployeeFormProps) {
    const [loading, setLoading] = useState(false);
    const [refsLoading, setRefsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab || 'personal');
    const [currentId, setCurrentId] = useState<string | null>(employeeId || null);

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
    const [lastAso, setLastAso] = useState(initialData?.healthData?.lastAsoDate ? safeDate(initialData.healthData.lastAsoDate) : '');
    const [asoPeriodicity, setAsoPeriodicity] = useState(initialData?.healthData?.periodicity || 12);

    const calculateNextAso = () => {
        if (!lastAso) return null;
        const date = new Date(lastAso);
        // Add months
        date.setMonth(date.getMonth() + parseInt(asoPeriodicity));
        return date.toLocaleDateString();
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
            personal: ['name', 'cpf', 'rg', 'dateOfBirth', 'gender', 'maritalStatus', 'email', 'phone', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'],
            address: ['zipCode', 'city', 'state', 'street', 'number', 'neighborhood'],
            contract: ['companyId', 'jobRoleId', 'sectorId', 'storeId', 'hireDate', 'baseSalary', 'workShiftId'],
            bank: ['bankName', 'accountType', 'agency', 'accountNumber', 'pixKey'],
            health: ['asoType', 'lastAsoDate'],
            access: ['accessEmail', 'accessPassword'],
            legal_guardian: isMinor ? ['guardianName', 'guardianCpf', 'guardianPhone', 'guardianRelationship'] : []
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
                }

                toast.success("Dados salvos com sucesso!");

                const visibleTabs = tabs.filter(t => t.id !== 'legal_guardian' || isMinor);
                const currentIndex = visibleTabs.findIndex(t => t.id === activeTab);

                if (currentIndex !== -1 && currentIndex < visibleTabs.length - 1) {
                    const nextTabId = visibleTabs[currentIndex + 1].id;
                    setActiveTab(nextTabId);
                } else if (currentIndex === visibleTabs.length - 1) {
                    setSuccess(true);
                    if (onSuccess) onSuccess();
                }
            } else {
                const msg = typeof result.error === 'string' ? result.error : (result.error?.message || 'Erro técnico ao salvar.');
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Avatar Column */}
                        <div className="md:col-span-3 flex flex-col items-center space-y-3">
                            <div className="relative w-32 h-40 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-indigo-500 transition-colors">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                ) : photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-slate-400 text-center p-2">
                                        <span className="text-2xl block mb-1">📷</span>
                                        <span className="text-xs">Adicionar Foto</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (currentId) {
                                            // Existing employee: Upload immediately and sync with DB
                                            setIsUploading(true);
                                            try {
                                                const url = await uploadEmployeePhoto(file, currentId, employeeName);
                                                setPhotoPreview(url);

                                                // Sync with DB immediately so user doesn't lose the photo if they don't click Save
                                                const formData = new FormData();
                                                formData.append('photoUrl', url);
                                                await updateEmployee(currentId, formData);

                                                toast.success("Foto atualizada e salva!");
                                            } catch (error) {
                                                toast.error("Erro ao subir foto");
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        } else {
                                            // New employee: Save for later and show local preview
                                            setPendingPhotoFile(file);
                                            const localUrl = URL.createObjectURL(file);
                                            setPhotoPreview(localUrl);
                                            toast.info("Foto selecionada. Ela será salva ao finalizar o cadastro.");
                                        }
                                    }}
                                />
                            </div>
                            {/* Hidden input to actually submit the URL string if we were doing it simply */}
                            <input type="hidden" name="photoUrl" value={photoPreview || ''} />
                            <p className="text-xs text-slate-500 text-center">Formato 3x4</p>
                        </div>

                        {/* Fields Column */}
                        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo *</label>
                                <Input
                                    name="name"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="Ex: Pedro Henrique"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">CPF *</label>
                                <Input
                                    name="cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">RG *</label>
                                <Input name="rg" defaultValue={initialData?.rg} placeholder="00.000.000-0" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Data de Nascimento *</label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    value={birthDate}
                                    onChange={handleDateChange}
                                    required
                                    className="calendar-light"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sexo *</label>
                                <select
                                    name="gender"
                                    defaultValue={initialData?.gender || ""}
                                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="MALE">Masculino</option>
                                    <option value="FEMALE">Feminino</option>
                                    <option value="OTHER">Outro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado Civil *</label>
                                <select
                                    name="maritalStatus"
                                    defaultValue={initialData?.maritalStatus || ""}
                                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Solteiro">Solteiro(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viuvo">Viúvo(a)</option>
                                    <option value="UniaoEstavel">União Estável</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contacts */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-slate-800 dark:text-slate-200 font-bold mb-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider text-xs">
                            <span className="mr-2">📞</span> Contatos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Telefone Fixo</label>
                                <Input
                                    name="landline"
                                    value={landline}
                                    onChange={(e) => setLandline(maskLandline(e.target.value))}
                                    placeholder="(00) 0000-0000"
                                    maxLength={14}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Celular *</label>
                                <Input
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">E-mail *</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={personalEmail}
                                    onChange={(e) => {
                                        setPersonalEmail(e.target.value);
                                        setAccessEmail(e.target.value);
                                    }}
                                    placeholder="colaborador@email.com"
                                />
                            </div>
                        </div>

                        {/* Banner Impulso */}
                        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 flex items-center justify-between shadow-lg">
                            <div>
                                <h5 className="text-white font-bold flex items-center">
                                    <span className="bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">🚀</span>
                                    Plataforma Impulso
                                </h5>
                                <p className="text-indigo-100 text-sm mt-1">Cadastre o colaborador na escola de supermercado.</p>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold border-none"
                                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1qSD136wZnuJ8-ZHUb20UwYOxTBxJ5Nw0/edit?gid=1946873591#gid=1946873591', '_blank')}
                            >
                                Acessar Impulso →
                            </Button>
                        </div>
                    </div>

                    {/* Section 3: Emergency Contact */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-slate-800 dark:text-slate-200 font-bold mb-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider text-xs">
                            <span className="mr-2">🚑</span> Contato de Emergência
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nome do Contato *</label>
                                <Input name="emergencyContactName" defaultValue={initialData?.emergencyContactName} placeholder="Nome do familiar/amigo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Telefone de Emergência *</label>
                                <Input name="emergencyContactPhone" defaultValue={initialData?.emergencyContactPhone} placeholder="(00) 00000-0000" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parentesco *</label>
                                <select
                                    name="emergencyContactRelationship"
                                    defaultValue={initialData?.emergencyContactRelationship || ""}
                                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Pai/Mãe">Pai/Mãe</option>
                                    <option value="Cônjuge">Cônjuge</option>
                                    <option value="Filho(a)">Filho(a)</option>
                                    <option value="Irmão(a)">Irmão(a)</option>
                                    <option value="Amigo(a)">Amigo(a)</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'legal_guardian',
            label: '⚠️ Responsável Legal',
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
                        <p className="text-amber-800 text-sm flex items-center">
                            <span className="text-xl mr-2">⚠️</span>
                            <span>Atenção: Preenchimento obrigatório para colaboradores menores de 18 anos.</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nome do Responsável</label>
                            <Input name="guardianName" defaultValue={initialData?.legalGuardian?.name} placeholder="Nome completo do responsável" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">CPF do Responsável</label>
                            <Input name="guardianCpf" defaultValue={initialData?.legalGuardian?.cpf} placeholder="000.000.000-00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">RG do Responsável</label>
                            <Input name="guardianRg" defaultValue={initialData?.legalGuardian?.rg} placeholder="RG" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Telefone do Responsável</label>
                            <Input name="guardianPhone" defaultValue={initialData?.legalGuardian?.phone} placeholder="(00) 00000-0000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parentesco</label>
                            <select
                                name="guardianRelationship"
                                defaultValue={initialData?.legalGuardian?.relationship || ""}
                                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="Mãe">Mãe</option>
                                <option value="Pai">Pai</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'address',
            label: '📍 Endereço',
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">CEP * (Busca Automática)</label>
                            <Input
                                name="zipCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(maskCep(e.target.value))}
                                onBlur={handleZipCodeBlur}
                                placeholder="00000-000"
                                maxLength={9}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                Cidade - UF *
                                {isCepLoading && <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />}
                            </label>
                            <div className="grid grid-cols-12 gap-2">
                                <Input
                                    name="city"
                                    value={addressFields.city}
                                    onChange={(e) => setAddressFields({ ...addressFields, city: e.target.value })}
                                    placeholder="Cidade"
                                    required
                                    className="col-span-10"
                                />
                                <Input
                                    name="state"
                                    value={addressFields.state}
                                    onChange={(e) => setAddressFields({ ...addressFields, state: e.target.value })}
                                    placeholder="UF"
                                    maxLength={2}
                                    required
                                    className="col-span-2 text-center"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Logradouro e Número *</label>
                            <div className="grid grid-cols-12 gap-2">
                                <Input
                                    name="street"
                                    value={addressFields.street}
                                    onChange={(e) => setAddressFields({ ...addressFields, street: e.target.value })}
                                    placeholder="Rua..."
                                    required
                                    className="col-span-9"
                                />
                                <Input
                                    name="number"
                                    value={addressFields.number}
                                    onChange={(e) => setAddressFields({ ...addressFields, number: e.target.value })}
                                    placeholder="Nº"
                                    required
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Complemento</label>
                            <Input
                                name="complement"
                                value={addressFields.complement}
                                onChange={(e) => setAddressFields({ ...addressFields, complement: e.target.value })}
                                placeholder="Apto 101"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Bairro *</label>
                            <Input
                                name="neighborhood"
                                value={addressFields.neighborhood}
                                onChange={(e) => setAddressFields({ ...addressFields, neighborhood: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'contract',
            label: '💼 Profissional',
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

                    {/* Professional Header Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa de Registro *</label>
                            <select
                                name="companyId"
                                defaultValue={initialData?.contract?.companyId || ""}
                                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione a empresa</option>
                                {companiesList.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.tradingName || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Matrícula</label>
                            <Input name="registrationNumber" disabled placeholder="Gerado automaticamente" className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo *</label>
                            <select
                                name="jobRoleId"
                                defaultValue={initialData?.jobRoleId || initialData?.contract?.jobRoleId || ""}
                                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione o cargo</option>
                                {jobRolesList.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Setor *</label>
                            <select
                                name="sectorId"
                                defaultValue={initialData?.contract?.sectorId || ""}
                                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione o setor</option>
                                {sectorsList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Loja *</label>
                            <select
                                name="storeId"
                                defaultValue={initialData?.contract?.storeId || ""}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione</option>
                                {storesList.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.tradingName || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Data de Admissão *</label>
                            <Input
                                name="hireDate"
                                type="date"
                                value={hireDate}
                                onChange={(e) => setHireDate(e.target.value)}
                                required
                                className="calendar-dark"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Salário Base (R$) *</label>
                            <Input name="baseSalary" type="number" step="0.01" defaultValue={initialData?.contract?.baseSalary} placeholder="1621.00" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Turno *</label>
                            <select
                                name="workShiftId"
                                defaultValue={initialData?.contract?.workShiftId || ""}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione o turno</option>
                                {shiftsList.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.startTime} - {s.endTime})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Experience Contract Section */}
                    <div className="border-t border-slate-800 pt-6 mt-6">
                        <h4 className="text-white font-bold mb-6 flex items-center justify-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">
                            <span className="mr-2">📋</span> Contrato de Experiência
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                            <div className="flex items-center space-x-2 pt-3">
                                <input type="checkbox" name="isExperienceContract" defaultChecked={initialData?.contract?.isExperienceContract} id="expContract" className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                <label htmlFor="expContract" className="text-sm text-slate-300">Funcionário em contrato de experiência</label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Duração Inicial (dias)</label>
                                <select
                                    name="experienceDays"
                                    value={expDays}
                                    onChange={(e) => setExpDays(parseInt(e.target.value))}
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value={30}>30 dias</option>
                                    <option value={45}>45 dias</option>
                                    <option value={90}>90 dias</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 pt-3">
                                <input
                                    type="checkbox"
                                    name="isExperienceExtended"
                                    checked={isExtended}
                                    onChange={(e) => setIsExtended(e.target.checked)}
                                    id="expExtended"
                                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <label htmlFor="expExtended" className="text-sm text-slate-300">Contrato foi prorrogado</label>
                            </div>

                            {isExtended && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-medium text-slate-300">Prorrogação (dias)</label>
                                    <select
                                        name="experienceExtensionDays"
                                        value={extDays}
                                        onChange={(e) => setExtDays(parseInt(e.target.value))}
                                        className={`flex h-10 w-full rounded-md border bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${contractEndData?.error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}`}
                                    >
                                        <option value={30}>+ 30 dias</option>
                                        <option value={45}>+ 45 dias</option>
                                        <option value={60}>+ 60 dias</option>
                                    </select>
                                    {contractEndData?.error && (
                                        <p className="text-xs text-red-400 font-medium">⚠️ Total não pode exceder 90 dias!</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Info Banner for Contract End */}
                        <div className={`mt-6 border-l-4 p-3 rounded-r flex items-center text-sm transition-colors ${contractEndData?.error ? 'bg-red-900/20 border-red-500 text-red-200' : 'bg-blue-900/20 border-blue-500 text-blue-200'}`}>
                            <span className="mr-2">📅</span>
                            <strong>Término do Contrato:</strong>
                            <span className="ml-2">
                                {contractEndData?.error
                                    ? "Inválido (Excede 90 dias)"
                                    : (contractEndData?.date || "Defina a data de admissão")}
                            </span>
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
                                    <Input name="cashHandlingBase" type="number" step="0.01" defaultValue={initialData?.contract?.cashHandlingBase} placeholder="10" className="h-8 w-24" />
                                </div>
                            </div>

                            {/* Insalubridade */}
                            <div className="flex items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasInsalubrity" defaultChecked={initialData?.contract?.hasInsalubrity} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Insalubridade</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select className="h-8 rounded md:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                        <option>grau</option>
                                    </select>
                                    <Input name="insalubrityBase" type="number" step="0.01" defaultValue={initialData?.contract?.insalubrityBase} placeholder="20" className="h-8 w-24" />
                                </div>
                            </div>

                            {/* Periculosidade */}
                            <div className="flex items-center p-3 border border-slate-800 rounded-md bg-slate-900/30 hover:border-slate-700 transition-colors">
                                <div className="flex items-center flex-1">
                                    <input type="checkbox" name="hasDangerousness" defaultChecked={initialData?.contract?.hasDangerousness} className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" />
                                    <label className="text-sm text-slate-300">Periculosidade</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select className="h-8 rounded md:w-20 bg-slate-950 border border-slate-700 text-xs text-slate-400">
                                        <option>% Por</option>
                                    </select>
                                    <Input name="dangerousnessBase" type="number" step="0.01" defaultValue={initialData?.contract?.dangerousnessBase} placeholder="30" className="h-8 w-24" />
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
                                    <Input name="trustPositionBase" type="number" step="0.01" defaultValue={initialData?.contract?.trustPositionBase} placeholder="40" className="h-8 w-24" />
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
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm text-slate-400 mb-6 text-center italic">Informe os dados para pagamento de salário.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Banco *</label>
                            <Input name="bankName" defaultValue={initialData?.bankData?.bankName} placeholder="Ex: Nubank, Itaú..." required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipo de Conta *</label>
                            <select
                                name="accountType"
                                defaultValue={initialData?.bankData?.accountType || ""}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="Corrente">Conta Corrente</option>
                                <option value="Poupanca">Conta Poupança</option>
                                <option value="Salario">Conta Salário</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Agência *</label>
                            <Input name="agency" defaultValue={initialData?.bankData?.agency} placeholder="0000" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Número da Conta *</label>
                            <Input name="accountNumber" defaultValue={initialData?.bankData?.accountNumber} placeholder="00000-0" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Chave PIX *</label>
                            <Input name="pixKey" defaultValue={initialData?.bankData?.pixKey} placeholder="CPF, Email ou Aleatória" required />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'benefits',
            label: '🎁 Benefícios',
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-white font-bold mb-6 text-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">Benefícios do Colaborador</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between border border-slate-800 p-3 rounded-md bg-slate-900/50">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🚌</span>
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="hasTransportVoucher"
                                            defaultChecked={initialData?.contract?.hasTransportVoucher}
                                            id="vt-toggle"
                                            className="mr-2 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                        />
                                        <label htmlFor="vt-toggle" className="text-sm font-medium text-slate-200 cursor-pointer">
                                            Ativar Vale Transporte (6%)
                                        </label>
                                    </div>
                                    <span className="text-xs text-slate-500 ml-6">
                                        O desconto de 6% será aplicado automaticamente.
                                        <a href="/portal/benefits/transport" target="_blank" className="text-indigo-400 hover:text-indigo-300 ml-1 hover:underline">
                                            Configurar rotas →
                                        </a>
                                    </span>
                                </div>
                            </div>
                            {/* Hidden input to keep compatibility if backend expects a value, though now we use boolean */}
                            <input type="hidden" name="transportVoucherValue" value="0" />
                        </div>

                        <div className="flex items-center justify-between border border-slate-800 p-3 rounded-md bg-slate-900/50">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🛒</span>
                                <label className="text-sm text-slate-200">Vale Alimentação (VA)</label>
                            </div>
                            <Input name="mealVoucherValue" type="number" step="0.01" defaultValue={initialData?.contract?.mealVoucherValue} placeholder="Valor Mensal (R$)" className="w-40" />
                        </div>

                        <div className="flex items-center justify-between border border-slate-800 p-3 rounded-md bg-slate-900/50">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🍽️</span>
                                <label className="text-sm text-slate-200">Vale Refeição (VR)</label>
                            </div>
                            <Input name="foodVoucherValue" type="number" step="0.01" defaultValue={initialData?.contract?.foodVoucherValue} placeholder="Valor Mensal (R$)" className="w-40" />
                        </div>
                        <div className="flex items-center justify-between border border-slate-800 p-3 rounded-md bg-slate-900/50">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                    <input type="checkbox" name="hasFamilySalary" defaultChecked={initialData?.contract?.hasFamilySalary} id="familySalary" className="mr-3 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="text-xl mr-2">👨‍👩‍👧</span>
                                    <label htmlFor="familySalary" className="text-sm text-slate-200 cursor-pointer">Salário Família</label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-400">Qtd. Dependentes:</span>
                                <Input name="familySalaryDependents" type="number" defaultValue={initialData?.contract?.familySalaryDependents || 0} className="w-20" />
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Outros Benefícios</label>
                            <textarea name="otherBenefits" defaultValue={initialData?.contract?.otherBenefits} className="flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" placeholder="Plano de saúde, seguro de vida, etc."></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">💰 Bônus Mensal (R$)</label>
                            <Input name="monthlyBonus" type="number" step="0.01" defaultValue={initialData?.contract?.monthlyBonus} placeholder="Valor adicional ao salário" />
                            <p className="text-xs text-slate-500">Este valor será somado ao salário base.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'health',
            label: '🩺 Saúde (ASO)',
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-white font-bold mb-6 flex items-center justify-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">
                        🩺 Atestado de Saúde Ocupacional (ASO)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipo do ASO</label>
                            <select
                                name="asoType"
                                defaultValue={initialData?.healthData?.asoType || "Admissional"}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <option value="Admissional">Admissional</option>
                                <option value="Periodico">Periódico</option>
                                <option value="Retorno">Retorno ao Trabalho</option>
                                <option value="Demissional">Demissional</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Data do Último ASO *</label>
                            <Input
                                name="lastAsoDate"
                                type="date"
                                value={lastAso}
                                onChange={(e) => setLastAso(e.target.value)}
                                className="calendar-dark"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Periodicidade (meses)</label>
                            <select
                                name="asoPeriodicity"
                                value={asoPeriodicity}
                                onChange={(e) => setAsoPeriodicity(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <option value="6">6 meses</option>
                                <option value="12">12 meses (1 ano)</option>
                                <option value="24">24 meses (2 anos)</option>
                            </select>
                        </div>

                        {/* Next Exam Prediction Display */}
                        <div className="md:col-span-2 bg-indigo-900/20 border border-indigo-500/30 p-3 rounded flex items-center justify-between">
                            <div className="flex items-center text-indigo-200 text-sm">
                                <span className="mr-2 text-lg">📅</span>
                                <span><strong>Próximo Exame Previsto:</strong></span>
                            </div>
                            <span className="text-white font-bold bg-indigo-600/50 px-3 py-1 rounded">
                                {nextAsoDate || "Defina a data do último exame"}
                            </span>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Observações Médicas</label>
                            <textarea name="asoObservations" defaultValue={initialData?.healthData?.observations} className="flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" placeholder="Restrições, aptidões especiais..."></textarea>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'documents',
            label: '📂 Documentos',
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-white font-bold mb-6 text-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">Documentação Complementar</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">PIS/PASEP</label>
                            <Input
                                name="pis"
                                value={pis}
                                onChange={(e) => setPis(maskPIS(e.target.value))}
                                placeholder="000.00000.00-0"
                                maxLength={14}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">CTPS (Número/Série)</label>
                            <Input
                                name="ctps"
                                value={ctps}
                                onChange={(e) => setCtps(maskCTPS(e.target.value))}
                                placeholder="1234567 000-0"
                                maxLength={12}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Título de Eleitor</label>
                            <Input name="voterTitle" defaultValue={initialData?.voterTitle} placeholder="0000 0000 0000" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {docCategories.map(cat => (
                            <div key={cat.id} className="p-4 border border-slate-800 rounded-lg bg-slate-900/50 hover:border-indigo-500/50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium flex items-center">
                                        <span className="mr-2">{cat.icon}</span> {cat.label}
                                    </h5>
                                    <span className="text-xs text-slate-500">{uploadedFiles.filter(f => f.type === cat.label).length} arquivos</span>
                                </div>
                                <div className="space-y-2 mb-3">
                                    {uploadedFiles.filter(f => f.type === cat.label).map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-800 p-2 rounded">
                                            <span className="text-slate-300 truncate max-w-[150px]">{file.fileName}</span>
                                            <div className="flex space-x-2">
                                                <a href={file.fileUrl} target="_blank" className="text-indigo-400 hover:underline">Ver</a>
                                                <button type="button" onClick={() => removeFile(uploadedFiles.indexOf(file))} className="text-red-400">Excluir</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative border border-dashed border-slate-700 rounded p-2 text-center hover:bg-slate-800 cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileSelect(e, cat.label)}
                                        disabled={isUploading}
                                    />
                                    <p className="text-[10px] text-slate-500 flex items-center justify-center">
                                        <CloudUpload className="w-3 h-3 mr-1" /> Carregar {cat.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'access',
            label: '🔐 Acesso',
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-white font-bold mb-6 text-center border-b border-slate-800 pb-2 uppercase tracking-wider text-xs">Credenciais de Acesso ao Portal</h3>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                        <p className="text-sm text-slate-400 mb-6">
                            Crie um usuário para que este colaborador possa acessar o sistema (Portal do Colaborador).
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email de Acesso *</label>
                                <Input
                                    name="accessEmail"
                                    value={accessEmail}
                                    onChange={(e) => setAccessEmail(e.target.value)}
                                    placeholder="email@empresa.com.br"
                                    className="bg-slate-950 border-slate-700 text-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Senha Inicial *</label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="accessPassword"
                                        name="accessPassword"
                                        type="text"
                                        placeholder="••••••••"
                                        className="bg-slate-950 border-slate-700"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => {
                                            const pass = Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 100);
                                            const el = document.getElementById('accessPassword') as HTMLInputElement;
                                            if (el) el.value = pass;
                                            toast.success("Senha gerada!");
                                        }}
                                    >
                                        Gerar
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nível de Permissão</label>
                                <select
                                    name="accessRole"
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="EMPLOYEE">Colaborador (Padrão)</option>
                                    <option value="HR">RH / Gestor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-md flex items-start">
                            <span className="text-indigo-400 mr-3 mt-0.5">ℹ️</span>
                            <p className="text-indigo-200 text-sm">
                                O colaborador receberá um email de boas-vindas com as instruções de primeiro acesso.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="w-full">
            {success && (
                <div className="bg-green-900/30 border border-green-800 text-green-400 p-4 rounded-md mb-6 flex items-center">
                    <span className="mr-2">✅</span> {employeeId ? 'Funcionário atualizado!' : 'Funcionário cadastrado!'}
                </div>
            )}
            {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-md mb-6">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full">

                {refsLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-500 font-medium">Carregando formulário...</p>
                    </div>
                ) : (
                    <Tabs
                        tabs={tabs.filter(t => t.id !== 'legal_guardian' || isMinor)}
                        value={activeTab}
                        onValueChange={setActiveTab}
                    />
                )}

                <div className="mt-8 pt-6 flex justify-center items-center space-x-4 border-t border-slate-200 dark:border-slate-800">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-8">
                            Cancelar
                        </Button>
                    )}

                    {activeTab !== 'personal' && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                const idx = tabs.findIndex(t => t.id === activeTab);
                                if (idx > 0) setActiveTab(tabs[idx - 1].id);
                            }}
                            className="text-slate-500 hover:text-white"
                        >
                            ← Voltar
                        </Button>
                    )}
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={handleSaveStep}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-10 shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? 'Salvando...' : (activeTab === tabs[tabs.length - 1].id ? 'Finalizar Cadastro' : 'Salvar e Próxima Aba →')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
