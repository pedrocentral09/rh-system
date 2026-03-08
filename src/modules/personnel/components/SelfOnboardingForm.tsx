'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import {
    User, MapPin, Briefcase, CreditCard,
    Users, Camera, CheckCircle2, ChevronRight,
    ChevronLeft, Loader2, Sparkles, Heart,
    Info, InfoIcon
} from 'lucide-react';
import { submitSelfOnboarding } from '../actions/employees';
import { uploadEmployeeDocument, uploadEmployeePhoto } from '@/lib/firebase/storage-utils';
import { processDocumentWithAI } from '../actions/document-ai';

interface SelfOnboardingFormProps {
    employee: any;
}

// Mask Utility Functions
const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
const maskCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');

export function SelfOnboardingForm({ employee }: SelfOnboardingFormProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        rg: '',
        cpf: employee.cpf || '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'Corrente',
        pixKey: '',
        spouseName: '',
        spouseCpf: '',
        spouseBirthDate: '',
        dependents: [] as any[],
        guardianName: '',
        guardianCpf: '',
        documents: [] as any[],
        photoUrl: '',
        previews: {} as Record<string, string>
    });

    const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});

    const [isMinor, setIsMinor] = useState(false);
    const [isMarried, setIsMarried] = useState(false);
    const [hasDependents, setHasDependents] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        // Strict validation per step
        if (step === 1) {
            if (!formData.name) {
                toast.error('Informe seu nome completo para continuar');
                return;
            }
        }
        if (step === 2) {
            if (!formData.dateOfBirth || !formData.phone || !formData.email || !formData.maritalStatus || !formData.emergencyContactName || !formData.emergencyContactPhone) {
                toast.error('Preencha todos os dados de contato obrigatórios');
                return;
            }
        }
        if (step === 3) {
            if (!formData.zipCode || !formData.number || !formData.street || !formData.neighborhood || !formData.city || !formData.state) {
                toast.error('Preencha o endereço completo');
                return;
            }
        }
        if (step === 4) {
            // Note: Dependents step is technically step 4 now (0-indexed, wait, dependents step is currently under step === 3 in UI, but technically it was duplicated, I will fix the UI step map later)
            // But validation logic will be simpler: Let's assume Family step validation
            if (isMarried && (!formData.spouseName || !formData.spouseCpf)) {
                toast.error('Preencha os dados do cônjuge');
                return;
            }
            if (isMinor && (!formData.guardianName || !formData.guardianCpf)) {
                toast.error('Preencha os dados do responsável legal');
                return;
            }
            let validDeps = true;
            for (const dep of formData.dependents) {
                if (!dep.name || !dep.cpf || !dep.birthDate) {
                    validDeps = false;
                }
            }
            if (!validDeps) {
                toast.error('Preencha todos os dados dos dependentes, ou remova os campos vazios');
                return;
            }
        }
        if (step === 5) {
            // Financeiro
            if (!formData.bankName || !formData.agency || !formData.accountNumber || !formData.pixKey) {
                toast.error('Preencha todos os dados bancários');
                return;
            }
        }
        if (step === 6) {
            // Documentos
            if (!formData.photoUrl) {
                toast.error('A foto de perfil é obrigatória. Capture ou anexe uma foto.');
                return;
            }
            if (!formData.documents.some(d => d.type === 'IDENTIDADE_FRENTE')) {
                toast.error('A foto do RG ou CNH é obrigatória.');
                return;
            }
            if (!formData.documents.some(d => d.type === 'ENDERECO')) {
                toast.error('O Comprovante de Residência é obrigatório.');
                return;
            }
        }

        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await submitSelfOnboarding(employee.id, formData);
            if (result.success) {
                setIsCompleted(true);
                toast.success('Cadastro enviado com sucesso!');
            } else {
                toast.error(result.message || 'Erro ao enviar cadastro');
            }
        } catch (error) {
            toast.error('Erro de conexão ao enviar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCEP = async (cep: string) => {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length === 8) {
            setLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        zipCode: cep,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (error) {
                console.error('Error fetching CEP:', error);
            } finally {
                setLoading(false);
            }
        } else {
            updateField('zipCode', cep);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview immediately
        const localUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            previews: { ...prev.previews, [type]: localUrl }
        }));

        setUploadingSlots(prev => ({ ...prev, [type]: true }));
        try {
            console.log(`Uploading ${type}...`, file.name);
            if (type === 'PROFILE') {
                const url = await uploadEmployeePhoto(file, employee.id, formData.name || 'Nova_Foto');
                setFormData(prev => ({ ...prev, photoUrl: url }));
                toast.success('Foto de perfil salva!');
            } else {
                const doc = await uploadEmployeeDocument(file, employee.id, formData.name || 'Doc', type);
                setFormData(prev => {
                    const filtered = prev.documents.filter(d => d.type !== type);
                    return {
                        ...prev,
                        documents: [...filtered, doc]
                    };
                });
                toast.success('Documento sincronizado!');

                // AI MAGIC: Process with Gemini if it's Identity or Address
                if (type === 'IDENTIDADE_FRENTE' || type === 'ENDERECO') {
                    toast('✨ Inteligência Artificial analisando...', {
                        description: 'Estamos extraindo dados do seu documento automaticamente.'
                    });

                    const aiResult = await processDocumentWithAI(doc.fileUrl, type as any);

                    if (aiResult.success && aiResult.data) {
                        const data = aiResult.data;
                        toast.success('✨ Dados extraídos com sucesso!');

                        setFormData(prev => {
                            const updates: any = { ...prev };

                            if (type === 'IDENTIDADE_FRENTE') {
                                if (data.name && !prev.name) updates.name = data.name;
                                if (data.rg && !prev.rg) updates.rg = data.rg;
                                if (data.birthDate && !prev.dateOfBirth) updates.dateOfBirth = data.birthDate;
                                if (data.cpf && !prev.cpf) updates.cpf = data.cpf;
                            } else if (type === 'ENDERECO') {
                                if (data.street) updates.street = data.street;
                                if (data.number) updates.number = data.number;
                                if (data.neighborhood) updates.neighborhood = data.neighborhood;
                                if (data.city) updates.city = data.city;
                                if (data.state) updates.state = data.state;
                                if (data.zipCode) updates.zipCode = data.zipCode;
                            }

                            return updates;
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error('Falha ao processar arquivo. Verifique sua conexão.');
            // Clear preview on failure
            setFormData(prev => {
                const newPreviews = { ...prev.previews };
                delete newPreviews[type];
                return { ...prev, previews: newPreviews };
            });
        } finally {
            setUploadingSlots(prev => ({ ...prev, [type]: false }));
            e.target.value = '';
        }
    };

    const steps = [
        { title: 'Início', icon: <Sparkles className="h-5 w-5" /> }, // 0
        { title: 'Identificação', icon: <User className="h-5 w-5" /> }, // 1
        { title: 'Contato', icon: <MapPin className="h-5 w-5" /> }, // 2
        { title: 'Residência', icon: <MapPin className="h-5 w-5" /> }, // 3
        { title: 'Família', icon: <Heart className="h-5 w-5" /> }, // 4
        { title: 'Financeiro', icon: <CreditCard className="h-5 w-5" /> }, // 5
        { title: 'Documentos', icon: <Camera className="h-5 w-5" /> }, // 6
        { title: 'Finalizar', icon: <CheckCircle2 className="h-5 w-5" /> }, // 7
    ];

    if (isCompleted) {
        return (
            <div className="text-center space-y-8 pt-12 animate-in fade-in zoom-in duration-700">
                <div className="h-28 w-28 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,120,0,0.2)] border border-brand-orange/20">
                    <CheckCircle2 className="h-14 w-14 text-brand-orange" />
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic">Tudo pronto! 🚀</h1>
                <p className="text-text-muted max-w-sm mx-auto leading-relaxed font-bold uppercase text-[11px] tracking-widest opacity-80">
                    Seus dados foram sincronizados com sucesso. Nossa inteligência de RH irá analisar os protocolos e notificaremos você em breve.
                </p>
                <div className="pt-10">
                    <Button variant="outline" className="h-14 px-10 border-border text-text-muted hover:text-text-primary rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => window.close()}>
                        Encerrar Protocolo
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="relative">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-orange block">Status do Protocolo</span>
                        <span className="text-sm font-black text-text-primary uppercase tracking-tighter">{steps[step].title}</span>
                    </div>
                    <span className="text-[14px] font-black text-brand-orange tabular-nums">{step + 1}<span className="text-text-muted opacity-30 mx-1">/</span>{steps.length}</span>
                </div>
                <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden border border-border shadow-inner">
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-orange to-orange-400 shadow-[0_0_15px_rgba(255,120,0,0.5)]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 0 && (
                        <div className="space-y-12 py-8 flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-brand-orange/20 blur-[60px] rounded-full" />
                                <div className="relative h-28 w-28 bg-gradient-to-tr from-brand-orange to-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-12 border-2 border-white/20">
                                    <Sparkles className="h-14 w-14 text-white animate-pulse" />
                                </div>
                            </motion.div>

                            <div className="space-y-4 max-w-lg">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter leading-none uppercase italic"
                                >
                                    BEM-VINDO À SUA <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-400">NOVA JORNADA.</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] px-4 opacity-80 italic"
                                >
                                    Ficamos honrados em ter você no time. Vamos configurar seu acesso e documentos de forma rápida, segura e 100% digital.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full"
                            >
                                {[
                                    { title: '100% Digital', desc: 'Sem papelada', icon: <Camera className="h-4 w-4" /> },
                                    { title: 'Segurança', desc: 'Dados protegidos', icon: <CheckCircle2 className="h-4 w-4" /> },
                                    { title: 'Rápido', desc: 'Em 5 minutos', icon: <Sparkles className="h-4 w-4" /> }
                                ].map((box, i) => (
                                    <div key={i} className="bg-surface-secondary border border-border rounded-2xl p-6 shadow-lg group hover:border-brand-orange/30 transition-all">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                                                {box.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">{box.title}</p>
                                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-tighter opacity-70">{box.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="w-full pt-4"
                            >
                                <Button
                                    size="lg"
                                    onClick={handleNext}
                                    className="w-full py-10 text-xl font-black uppercase tracking-widest bg-brand-orange hover:bg-orange-600 text-white rounded-2xl shadow-[0_20px_40px_rgba(255,120,0,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-black/20"
                                >
                                    Iniciar Minha Jornada
                                    <ChevronRight className="ml-2 h-6 w-6" />
                                </Button>
                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-[0.3em] mt-8 opacity-70">
                                    Protocolo de Segurança Ativo • 256-bit SSL
                                </p>
                            </motion.div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic">Quem é você?</h2>
                                <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-80">Precisamos do seu nome completo para registro oficial em sistema.</p>
                            </div>

                            <Card className="bg-surface-secondary border-border rounded-[2.5rem] shadow-xl overflow-hidden">
                                <CardContent className="pt-12 pb-12 space-y-8">
                                    <div className="space-y-4">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-2">NOME COMPLETO *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value.toUpperCase())}
                                            placeholder="Ex: JOÃO DA SILVA SANTOS"
                                            className="bg-surface border-border text-xl font-black h-20 px-8 rounded-2xl focus:ring-brand-orange/20 focus:border-brand-orange/40 uppercase tracking-tight shadow-inner"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <Label htmlFor="rg" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-2">REGISTRO GERAL (RG) *</Label>
                                        <Input
                                            id="rg"
                                            value={formData.rg}
                                            onChange={(e) => updateField('rg', e.target.value.toUpperCase())}
                                            placeholder="APENAS NÚMEROS E LETRAS"
                                            className="bg-surface border-border text-xl font-black h-20 px-8 rounded-2xl focus:ring-brand-orange/20 focus:border-brand-orange/40 uppercase tracking-tight shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2 opacity-70">CPF CONFIRMADO PELO PROTOCOLO</Label>
                                        <div className="bg-surface border border-border p-8 rounded-2xl flex items-center justify-between group shadow-inner">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-sm">
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <span className="font-mono text-2xl font-black text-text-primary tracking-[0.1em]">{maskCPF(employee.cpf)}</span>
                                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-1 italic">Verificação Concluída ✓</p>
                                                </div>
                                            </div>
                                            <div className="px-5 py-2 bg-surface-secondary border border-border rounded-lg text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-80">
                                                BLOQUEADO PARA EDIÇÃO
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-6 flex gap-5 shadow-sm">
                                <InfoIcon className="h-6 w-6 text-brand-blue shrink-0 mt-1" />
                                <p className="text-[11px] text-brand-blue font-black uppercase tracking-widest leading-relaxed italic opacity-80">
                                    ATENÇÃO: Use seu nome exatamente como consta em sua documentação oficial (RG ou CNH) para validação sistêmica imediata.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic">Dados de Contato</h2>
                                <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-80">Como podemos sincronizar nossas comunicações com você?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Card className="bg-surface-secondary border-border rounded-[2.5rem] shadow-xl overflow-hidden">
                                    <CardContent className="p-10 space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">DATA DE NASCIMENTO *</Label>
                                            <Input
                                                type="date"
                                                className="bg-surface border-border h-16 rounded-2xl text-lg font-black text-text-primary focus:ring-brand-blue/20 shadow-inner"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateField('dateOfBirth', val);
                                                    const age = new Date().getFullYear() - new Date(val).getFullYear();
                                                    setIsMinor(age < 18);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">CELULAR (PARA WHATSAPP) *</Label>
                                            <Input
                                                className="bg-surface border-border h-16 rounded-2xl text-lg font-black text-text-primary focus:ring-brand-blue/20 shadow-inner"
                                                placeholder="(00) 00000-0000"
                                                value={formData.phone}
                                                onChange={(e) => updateField('phone', maskPhone(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">E-MAIL INSTITUCIONAL/PESSOAL *</Label>
                                            <Input
                                                type="email"
                                                className="bg-surface border-border h-16 rounded-2xl text-lg font-black text-text-primary focus:ring-brand-blue/20 shadow-inner lowercase"
                                                placeholder="seu@exemplo.com"
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">ESTADO CIVIL / CONDIÇÃO *</Label>
                                            <select
                                                className="w-full h-16 bg-surface border border-border rounded-2xl px-6 text-lg font-black text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/20 appearance-none shadow-inner uppercase tracking-widest"
                                                value={formData.maritalStatus}
                                                onChange={(e) => {
                                                    updateField('maritalStatus', e.target.value);
                                                    setIsMarried(e.target.value === 'Casado' || e.target.value === 'Uniâo Estável');
                                                }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Solteiro">Solteiro(a)</option>
                                                <option value="Casado">Casado(a)</option>
                                                <option value="Uniâo Estável">União Estável</option>
                                                <option value="Divorciado">Divorciado(a)</option>
                                                <option value="Viuvo">Viúvo(a)</option>
                                            </select>
                                        </div>
                                        <div className="py-2"><hr className="border-border opacity-50" /></div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-2">NOME DO CONTATO DE EMERGÊNCIA *</Label>
                                            <Input
                                                className="bg-surface border-border h-16 rounded-2xl text-lg font-black text-text-primary focus:ring-brand-orange/20 shadow-inner uppercase"
                                                placeholder="Ex: MARIA (MÃE)"
                                                value={formData.emergencyContactName}
                                                onChange={(e) => updateField('emergencyContactName', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-2">TELEFONE DE EMERGÊNCIA *</Label>
                                            <Input
                                                className="bg-surface border-border h-16 rounded-2xl text-lg font-black text-text-primary focus:ring-brand-orange/20 shadow-inner"
                                                placeholder="(00) 00000-0000"
                                                value={formData.emergencyContactPhone}
                                                onChange={(e) => updateField('emergencyContactPhone', maskPhone(e.target.value))}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic text-center">Local de Residência</h2>
                                <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-80 text-center">Informe seu endereço atual para composição logística do contrato.</p>
                            </div>

                            <Card className="bg-surface-secondary border-border rounded-[2.5rem] shadow-xl overflow-hidden p-4">
                                <CardContent className="space-y-8 pt-8 uppercase font-black">
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="col-span-3 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">CÓDIGO POSTAL (CEP) *</Label>
                                            <Input
                                                className="bg-surface border-border h-20 rounded-2xl text-2xl font-black text-text-primary focus:ring-brand-blue/20 shadow-inner placeholder:text-text-muted/20"
                                                placeholder="00000-000"
                                                value={formData.zipCode}
                                                onChange={(e) => handleCEP(maskCEP(e.target.value))}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">LOGRADOURO (RUA/AV)</Label>
                                            <Input className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary" value={formData.street} onChange={e => updateField('street', e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="col-span-1 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">NÚMERO</Label>
                                            <Input className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary text-center" value={formData.number} onChange={e => updateField('number', e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="col-span-3 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">BAIRRO / DISTRITO</Label>
                                            <Input className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary" value={formData.neighborhood} onChange={e => updateField('neighborhood', e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="col-span-2 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">CIDADE</Label>
                                            <Input className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary" value={formData.city} onChange={e => updateField('city', e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="col-span-1 space-y-4">
                                            <Label className="text-[10px] text-text-secondary tracking-[0.2em] ml-2">UF</Label>
                                            <Input className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary text-center" value={formData.state} onChange={e => updateField('state', e.target.value.toUpperCase())} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Dados dos Dependentes</h2>
                            <p className="text-text-secondary text-sm italic opacity-80">Opcional: Informe dados de cônjuge ou filhos para salário-família e benefícios.</p>

                            {(isMarried || isMinor) && (
                                <Card className="bg-brand-orange/5 border-brand-orange/10 rounded-[2rem] shadow-xl overflow-hidden">
                                    <CardContent className="p-10 space-y-8">
                                        {isMarried && (
                                            <div className="space-y-6">
                                                <h3 className="font-black text-brand-orange uppercase tracking-widest flex items-center gap-3 italic">💍 Núcleo Conjugal</h3>
                                                <div className="space-y-4">
                                                    <Input placeholder="NOME DO CÔNJUGE" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary uppercase shadow-inner" value={formData.spouseName} onChange={e => updateField('spouseName', e.target.value.toUpperCase())} />
                                                    <Input placeholder="CPF DO CÔNJUGE" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary shadow-inner" value={formData.spouseCpf} onChange={e => updateField('spouseCpf', maskCPF(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                        {isMinor && (
                                            <div className="space-y-6 pt-8 border-t border-brand-orange/10">
                                                <h3 className="font-black text-brand-orange uppercase tracking-widest flex items-center gap-3 italic">⚠️ Tutela / Responsável</h3>
                                                <div className="space-y-4">
                                                    <Input placeholder="NOME DO RESPONSÁVEL" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary uppercase shadow-inner" value={formData.guardianName} onChange={e => updateField('guardianName', e.target.value.toUpperCase())} />
                                                    <Input placeholder="CPF DO RESPONSÁVEL" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary shadow-inner" value={formData.guardianCpf} onChange={e => updateField('guardianCpf', maskCPF(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-6">
                                <h3 className="font-black text-text-primary uppercase tracking-widest italic ml-2">Filhos / Outros Dependentes</h3>
                                {formData.dependents.map((dep, idx) => (
                                    <div key={idx} className="bg-surface border border-border p-8 rounded-[2rem] relative shadow-xl animate-in slide-in-from-top-4">
                                        <button
                                            className="absolute top-6 right-6 h-8 w-8 bg-brand-orange/10 rounded-full text-brand-orange hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center font-black"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                dependents: prev.dependents.filter((_, i) => i !== idx)
                                            }))}
                                        >✕</button>
                                        <div className="space-y-6">
                                            <Input placeholder="NOME COMPLETO DO DEPENDENTE" className="bg-surface-secondary border-border h-16 rounded-2xl font-black text-text-primary uppercase shadow-inner" value={dep.name} onChange={e => {
                                                const newDeps = [...formData.dependents];
                                                newDeps[idx].name = e.target.value.toUpperCase();
                                                updateField('dependents', newDeps);
                                            }} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input placeholder="CPF" className="bg-surface-secondary border-border h-16 rounded-2xl font-black text-text-primary shadow-inner" value={dep.cpf} onChange={e => {
                                                    const newDeps = [...formData.dependents];
                                                    newDeps[idx].cpf = maskCPF(e.target.value);
                                                    updateField('dependents', newDeps);
                                                }} />
                                                <Input type="date" className="bg-surface-secondary border-border h-16 rounded-2xl font-black text-text-primary shadow-inner" value={dep.birthDate} onChange={e => {
                                                    const newDeps = [...formData.dependents];
                                                    newDeps[idx].birthDate = e.target.value;
                                                    updateField('dependents', newDeps);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-2 border-dashed border-border bg-surface-secondary/50 text-text-secondary h-24 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:border-brand-orange/50 hover:bg-brand-orange/5 hover:text-brand-orange transition-all"
                                    onClick={() => updateField('dependents', [...formData.dependents, { name: '', cpf: '', birthDate: '', relationship: 'Filho(a)' }])}
                                >
                                    + Adicionar Novo Dependente
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic">Dados Bancários</h2>
                                <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-80">Onde você deseja receber seu salário e benefícios?</p>
                            </div>

                            <Card className="bg-surface-secondary border-border rounded-[2.5rem] shadow-xl overflow-hidden">
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">INSTITUIÇÃO BANCÁRIA *</Label>
                                        <Input placeholder="Ex: ITAÚ, BRADESCO, NUBANK" className="bg-surface border-border h-20 rounded-2xl text-xl font-black text-text-primary px-8 focus:ring-brand-blue/20 shadow-inner uppercase tracking-tight" value={formData.bankName} onChange={e => updateField('bankName', e.target.value.toUpperCase())} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">AGÊNCIA</Label>
                                            <Input placeholder="0000" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary px-6 shadow-inner" value={formData.agency} onChange={e => updateField('agency', e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-2">NÚMERO DA CONTA</Label>
                                            <Input placeholder="00000-0" className="bg-surface border-border h-16 rounded-2xl font-black text-text-primary px-6 shadow-inner" value={formData.accountNumber} onChange={e => updateField('accountNumber', e.target.value.toUpperCase())} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-2">CHAVE PIX PARA RECEBIMENTO *</Label>
                                        <Input placeholder="CPF, E-MAIL OU CELULAR" className="bg-brand-orange/5 border-brand-orange/30 h-20 rounded-2xl text-xl font-black text-brand-orange px-8 shadow-inner focus:ring-brand-orange/20" value={formData.pixKey} onChange={e => updateField('pixKey', e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Fotos dos Documentos</h2>
                            <p className="text-text-secondary text-sm opacity-80">Tire uma foto legível de cada documento solicitado. Use o botão 📷 para capturar ou selecionar da galeria.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Profile Photo */}
                                <div className="space-y-4">
                                    <Label className="text-text-primary font-black uppercase text-[10px] tracking-widest ml-2">FOTOGRAFIA DO PERFIL (3X4)</Label>
                                    <div className="h-64 bg-surface border-2 border-dashed border-border rounded-[2rem] flex items-center justify-center relative overflow-hidden group shadow-inner">
                                        {uploadingSlots['PROFILE'] ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
                                                <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Sincronizando...</span>
                                            </div>
                                        ) : (formData.previews['PROFILE'] || formData.photoUrl) ? (
                                            <img src={formData.previews['PROFILE'] || formData.photoUrl} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Preview" />
                                        ) : (
                                            <div className="text-center p-8">
                                                <div className="h-16 w-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-orange/20">
                                                    <Camera className="h-8 w-8 text-brand-orange" />
                                                </div>
                                                <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Capturar Foto em Tempo Real</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onClick={(e) => (e.currentTarget.value = '')}
                                            onChange={e => handleFileUpload(e, 'PROFILE')}
                                            disabled={uploadingSlots['PROFILE']}
                                        />
                                        {(formData.photoUrl || formData.previews['PROFILE']) && !uploadingSlots['PROFILE'] && (
                                            <div className="absolute inset-0 bg-brand-blue/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-widest pointer-events-none backdrop-blur-sm">
                                                <Camera className="h-8 w-8 mb-3" />
                                                Substituir Imagem
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RG/CNH Front */}
                                <div className="space-y-4">
                                    <Label className="text-text-primary font-black uppercase text-[10px] tracking-widest ml-2">DOCUMENTO DE IDENTIDADE (FRENTE)</Label>
                                    <div className={`h-64 rounded-[2rem] border-2 border-dashed flex items-center justify-center relative overflow-hidden group transition-all shadow-inner ${formData.documents.find(d => d.type === 'IDENTIDADE_FRENTE') ? 'border-emerald-500/50 bg-emerald-500/5' : 'bg-surface border-border'}`}>
                                        {uploadingSlots['IDENTIDADE_FRENTE'] ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
                                                <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Sincronizando...</span>
                                            </div>
                                        ) : (formData.previews['IDENTIDADE_FRENTE'] || formData.documents.find(d => d.type === 'IDENTIDADE_FRENTE')) ? (
                                            <div className="relative w-full h-full group">
                                                <img src={formData.previews['IDENTIDADE_FRENTE'] || formData.documents.find(d => d.type === 'IDENTIDADE_FRENTE').fileUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="RG" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                    </div>
                                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-4">Protocolo Confirmado</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8">
                                                <div className="h-16 w-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                                                    <Camera className="h-8 w-8 text-brand-blue" />
                                                </div>
                                                <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Digitalizar Frente</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onClick={(e) => (e.currentTarget.value = '')}
                                            onChange={e => handleFileUpload(e, 'IDENTIDADE_FRENTE')}
                                            disabled={uploadingSlots['IDENTIDADE_FRENTE']}
                                        />
                                    </div>
                                </div>

                                {/* DOCUMENTO DE IDENTIDADE (VERSO) */}
                                <div className="space-y-4">
                                    <Label className="text-text-primary font-black uppercase text-[10px] tracking-widest ml-2">DOCUMENTO DE IDENTIDADE (VERSO)</Label>
                                    <div className={`h-64 rounded-[2rem] border-2 border-dashed flex items-center justify-center relative overflow-hidden group transition-all shadow-inner ${formData.documents.find(d => d.type === 'IDENTIDADE_VERSO') ? 'border-emerald-500/50 bg-emerald-500/5' : 'bg-surface border-border'}`}>
                                        {uploadingSlots['IDENTIDADE_VERSO'] ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
                                                <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Sincronizando...</span>
                                            </div>
                                        ) : (formData.previews['IDENTIDADE_VERSO'] || formData.documents.find(d => d.type === 'IDENTIDADE_VERSO')) ? (
                                            <div className="relative w-full h-full group">
                                                <img src={formData.previews['IDENTIDADE_VERSO'] || formData.documents.find(d => d.type === 'IDENTIDADE_VERSO').fileUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="RG" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                    </div>
                                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-4">Protocolo Confirmado</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8">
                                                <div className="h-16 w-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                                                    <Camera className="h-8 w-8 text-brand-blue" />
                                                </div>
                                                <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Digitalizar VersO</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onClick={(e) => (e.currentTarget.value = '')}
                                            onChange={e => handleFileUpload(e, 'IDENTIDADE_VERSO')}
                                            disabled={uploadingSlots['IDENTIDADE_VERSO']}
                                        />
                                    </div>
                                </div>

                                {/* Comp Residência */}
                                <div className="space-y-4">
                                    <Label className="text-text-primary font-black uppercase text-[10px] tracking-widest ml-2">COMPROVANTE DE RESIDÊNCIA</Label>
                                    <div className={`h-64 rounded-[2rem] border-2 border-dashed flex items-center justify-center relative overflow-hidden group transition-all shadow-inner ${formData.documents.find(d => d.type === 'ENDERECO') ? 'border-emerald-500/50 bg-emerald-500/5' : 'bg-surface border-border'}`}>
                                        {uploadingSlots['ENDERECO'] ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
                                                <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">Sincronizando...</span>
                                            </div>
                                        ) : (formData.previews['ENDERECO'] || formData.documents.find(d => d.type === 'ENDERECO')) ? (
                                            <div className="relative w-full h-full group">
                                                <img src={formData.previews['ENDERECO'] || formData.documents.find(d => d.type === 'ENDERECO').fileUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Comprovante de Residência" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                    </div>
                                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-4">Protocolo Confirmado</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8">
                                                <div className="h-16 w-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                                                    <Camera className="h-8 w-8 text-brand-blue" />
                                                </div>
                                                <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Digitalizar Comprovante</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onClick={(e) => (e.currentTarget.value = '')}
                                            onChange={e => handleFileUpload(e, 'ENDERECO')}
                                            disabled={uploadingSlots['ENDERECO']}
                                        />
                                    </div>
                                </div>

                                {/* Outros / CTPS */}
                                <div className="space-y-4 col-span-full">
                                    <Label className="text-text-primary font-black uppercase text-[10px] tracking-widest ml-2">CARTEIRA DE TRABALHO / OUTROS DOCUMENTOS</Label>
                                    <div className={`h-48 rounded-[2rem] border-2 border-dashed flex items-center justify-center relative overflow-hidden group transition-all shadow-inner ${formData.documents.some(d => d.type === 'OUTROS') ? 'border-brand-orange/40 bg-brand-orange/5' : 'bg-surface border-border'}`}>
                                        <div className="text-center p-8">
                                            <div className="h-16 w-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-orange/20">
                                                <Camera className="h-8 w-8 text-brand-orange" />
                                            </div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black italic">
                                                {formData.documents.filter(d => d.type === 'OUTROS').length} documento(s) capturado(s)
                                            </span>
                                            <p className="text-[9px] text-text-secondary opacity-60 font-black uppercase tracking-widest mt-2">+ Adicionar Documentação Adicional</p>
                                        </div>
                                        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, 'OUTROS')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="space-y-12 py-8">
                            <div className="text-center space-y-4">
                                <div className="h-28 w-28 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,120,0,0.1)] border border-brand-orange/20 animate-bounce">
                                    <CheckCircle2 className="h-14 w-14 text-brand-orange" />
                                </div>
                                <h2 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic">Protocolo Final</h2>
                                <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.2em] max-w-sm mx-auto opacity-80">
                                    Confirme seus dados antes da transmissão criptografada para nossa central de inteligência.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { label: 'Identificação', status: formData.name ? 'CONCLUÍDO' : 'PENDENTE', icon: <User className="h-4 w-4" /> },
                                    { label: 'Logística de Endereço', status: formData.street ? 'CONCLUÍDO' : 'PENDENTE', icon: <MapPin className="h-4 w-4" /> },
                                    { label: 'Financeiro (PIX)', status: formData.pixKey ? 'CONCLUÍDO' : 'PENDENTE', icon: <CreditCard className="h-4 w-4" /> },
                                    { label: 'Dossiê Documental', status: `${formData.documents.length} ANEXOS`, icon: <Camera className="h-4 w-4" /> }
                                ].map((item, i) => (
                                    <div key={i} className="bg-surface-secondary border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                                                {item.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{item.label}</span>
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${item.status === 'PENDENTE' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'} italic`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-[2rem] p-8 flex gap-6 italic">
                                <Sparkles className="h-8 w-8 text-brand-orange shrink-0 animate-pulse" />
                                <p className="text-[11px] text-brand-orange font-black uppercase tracking-widest leading-relaxed opacity-80">
                                    Ao finalizar, nossa equipe receberá seus dados instantaneamente. Certifique-se de que todas as fotos de documentos estão nítidas para evitar a recusa do protocolo.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="flex flex-col sm:flex-row gap-4 pt-12 pb-12 border-t border-border/50">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={loading || step === 0}
                    className="flex-1 py-10 h-auto font-black uppercase tracking-widest text-[10px] text-text-secondary hover:bg-surface-secondary rounded-[2rem] border border-transparent hover:border-border transition-all flex items-center justify-center"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Retroceder Passo
                </Button>

                {step > 0 && (
                    <Button
                        onClick={step === (steps.length - 1) ? handleSubmit : handleNext}
                        disabled={loading || Object.keys(uploadingSlots).some(k => uploadingSlots[k])}
                        className={`flex-[2] py-10 h-auto font-black uppercase tracking-widest text-[12px] rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-black/20 flex items-center justify-center ${step === steps.length - 1 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-brand-orange hover:bg-orange-600 text-white'}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>SINCRONIZANDO DADOS...</span>
                            </div>
                        ) : step === steps.length - 1 ? (
                            <div className="flex items-center gap-2">
                                FINALIZAR MEU PROTOCOLO 🚀
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                CONTINUAR JORNADA
                                <ChevronRight className="h-6 w-6" />
                            </div>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
