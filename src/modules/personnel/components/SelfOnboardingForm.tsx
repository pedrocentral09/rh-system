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
        photoUrl: ''
    });

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

        setLoading(true);
        try {
            if (type === 'PROFILE') {
                const url = await uploadEmployeePhoto(file, employee.id, formData.name || 'Nova_Foto');
                updateField('photoUrl', url);
                toast.success('Foto de perfil salva!');
            } else {
                const doc = await uploadEmployeeDocument(file, employee.id, formData.name || 'Doc', type);
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents, doc]
                }));
                toast.success('Documento enviado!');
            }
        } catch (err) {
            toast.error('Falha no upload');
        } finally {
            setLoading(false);
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
            <div className="text-center space-y-6 pt-12 animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 bg-[#FF7800]/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-[#FF7800]/10">
                    <CheckCircle2 className="h-12 w-12 text-[#FF7800]" />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Tudo pronto!</h1>
                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Seus dados foram enviados com sucesso. Nossa equipe de RH irá analisar os documentos e entraremos em contato em breve.
                </p>
                <div className="pt-8">
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" onClick={() => window.close()}>
                        Fechar Janela
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF7800]">PASSO {step + 1} DE {steps.length}</span>
                    <span className="text-sm font-medium text-slate-400">{steps[step].title}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#FF7800] to-orange-400"
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
                                <div className="absolute inset-0 bg-[#FF7800]/20 blur-[60px] rounded-full" />
                                <div className="relative h-24 w-24 bg-gradient-to-tr from-[#FF7800] to-orange-400 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-12">
                                    <Sparkles className="h-12 w-12 text-white animate-pulse" />
                                </div>
                            </motion.div>

                            <div className="space-y-4 max-w-lg">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none"
                                >
                                    BEM-VINDO À SUA <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7800] to-orange-400">NOVA JORNADA.</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg text-slate-400 font-medium px-4"
                                >
                                    Ficamos honrados em ter você no time. Vamos configurar seu acesso e documentos de forma rápida e segura.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
                            >
                                {[
                                    { title: '100% Digital', desc: 'Sem papelada', icon: <Camera className="h-4 w-4" /> },
                                    { title: 'Segurança', desc: 'Dados protegidos', icon: <CheckCircle2 className="h-4 w-4" /> },
                                    { title: 'Rápido', desc: 'Em 5 minutos', icon: <Sparkles className="h-4 w-4" /> }
                                ].map((box, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 bg-[#FF7800]/10 rounded-lg flex items-center justify-center text-[#FF7800]">
                                                {box.icon}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{box.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">{box.desc}</p>
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
                                    className="w-full py-8 text-xl font-black uppercase tracking-tighter bg-[#FF7800] hover:bg-orange-600 text-white rounded-2xl shadow-[0_0_40px_rgba(255,120,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Iniciar Minha Jornada
                                    <ChevronRight className="ml-2 h-6 w-6" />
                                </Button>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6">
                                    Conectado via Protocolo Seguro SSL
                                </p>
                            </motion.div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Quem é você?</h2>
                                <p className="text-slate-400 font-medium">Precisamos do seu nome completo para registro oficial.</p>
                            </div>

                            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-3xl overflow-hidden rounded-[2rem]">
                                <CardContent className="pt-10 pb-10 space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#FF7800] ml-1">NOME COMPLETO *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            placeholder="Ex: João da Silva Santos"
                                            className="bg-black/40 border-white/5 text-xl py-8 rounded-2xl focus:ring-[#FF7800] placeholder:text-slate-700"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label htmlFor="rg" className="text-[10px] font-black uppercase tracking-widest text-[#FF7800] ml-1">RG *</Label>
                                        <Input
                                            id="rg"
                                            value={formData.rg}
                                            onChange={(e) => updateField('rg', e.target.value)}
                                            placeholder="Apenas números e letras"
                                            className="bg-black/40 border-white/5 text-xl py-8 rounded-2xl focus:ring-[#FF7800] placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CPF CONFIRMADO</Label>
                                        <div className="bg-black/20 border border-white/5 p-6 rounded-2xl flex items-center gap-4 group">
                                            <div className="h-10 w-10 bg-[#FF7800]/10 rounded-full flex items-center justify-center border border-[#FF7800]/20">
                                                <CheckCircle2 className="h-5 w-5 text-[#FF7800]" />
                                            </div>
                                            <div>
                                                <span className="font-mono text-xl text-slate-300 tracking-wider disabled:opacity-50">{maskCPF(employee.cpf)}</span>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.1em] mt-0.5 italic">Documento verificado digitalmente</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex gap-4">
                                <InfoIcon className="h-6 w-6 text-blue-400 shrink-0" />
                                <p className="text-sm text-blue-400/80 font-medium leading-relaxed italic">
                                    Dica: Use seu nome exatamente como está no RG ou CNH para evitar atrasos na aprovação do seu contrato.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Contatos Pessoais</h2>
                                <p className="text-slate-400 font-medium">Como podemos falar com você?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Card className="bg-white/[0.02] border-white/10 rounded-3xl">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nascimento</Label>
                                            <Input
                                                type="date"
                                                className="bg-black/40 border-white/5 py-8 rounded-xl text-lg"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateField('dateOfBirth', val);
                                                    const age = new Date().getFullYear() - new Date(val).getFullYear();
                                                    setIsMinor(age < 18);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Celular (WhatsApp)</Label>
                                            <Input
                                                className="bg-black/40 border-white/5 py-8 rounded-xl text-lg"
                                                placeholder="(00) 00000-0000"
                                                value={formData.phone}
                                                onChange={(e) => updateField('phone', maskPhone(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</Label>
                                            <Input
                                                type="email"
                                                className="bg-black/40 border-white/5 py-8 rounded-xl text-lg"
                                                placeholder="seu@email.com"
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado Civil</Label>
                                            <select
                                                className="w-full h-16 bg-black/40 border border-white/5 rounded-xl px-4 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF7800] appearance-none shadow-inner"
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
                                        <hr className="border-white/5 my-4" />
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-orange-400">Nome do Contato de Emergência *</Label>
                                            <Input
                                                className="bg-black/40 border-white/5 py-8 rounded-xl text-lg"
                                                placeholder="Ex: Maria (Mãe)"
                                                value={formData.emergencyContactName}
                                                onChange={(e) => updateField('emergencyContactName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-orange-400">Telefone de Emergência *</Label>
                                            <Input
                                                className="bg-black/40 border-white/5 py-8 rounded-xl text-lg"
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
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase italic text-center">Residência</h2>
                                <p className="text-slate-400 font-medium text-center">Informe seu endereço atual completo.</p>
                            </div>

                            <Card className="bg-white/[0.02] border-white/10 rounded-[2.5rem] p-4">
                                <CardContent className="space-y-6 pt-6 uppercase font-bold">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-3 space-y-3">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">CEP</Label>
                                            <Input
                                                className="bg-black/40 border-white/5 py-8 rounded-2xl text-xl placeholder:text-slate-800"
                                                placeholder="00000-000"
                                                value={formData.zipCode}
                                                onChange={(e) => handleCEP(maskCEP(e.target.value))}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-3">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">Rua/AV</Label>
                                            <Input className="bg-black/40 border-white/5 py-8 rounded-2xl" value={formData.street} onChange={e => updateField('street', e.target.value)} />
                                        </div>
                                        <div className="col-span-1 space-y-3">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">Nº</Label>
                                            <Input className="bg-black/40 border-white/5 py-8 rounded-2xl" value={formData.number} onChange={e => updateField('number', e.target.value)} />
                                        </div>
                                        <div className="col-span-3 space-y-3 pt-2">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">Bairro</Label>
                                            <Input className="bg-black/40 border-white/5 py-8 rounded-2xl" value={formData.neighborhood} onChange={e => updateField('neighborhood', e.target.value)} />
                                        </div>
                                        <div className="col-span-2 space-y-3">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">Cidade</Label>
                                            <Input className="bg-black/40 border-white/5 py-8 rounded-2xl" value={formData.city} onChange={e => updateField('city', e.target.value)} />
                                        </div>
                                        <div className="col-span-1 space-y-3">
                                            <Label className="text-[10px] text-slate-500 tracking-widest">UF</Label>
                                            <Input className="bg-black/40 border-white/5 py-8 rounded-2xl text-center" value={formData.state} onChange={e => updateField('state', e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Dados dos Dependentes</h2>
                            <p className="text-slate-400 text-sm italic">Opcional: Informe dados de cônjuge ou filhos para salário-família e benefícios.</p>

                            {(isMarried || isMinor) && (
                                <Card className="bg-indigo-500/5 border-indigo-500/10">
                                    <CardContent className="pt-6 space-y-4">
                                        {isMarried && (
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-[#FF7800] flex items-center gap-2">💍 Dados do Cônjuge</h3>
                                                <div className="space-y-3">
                                                    <Input placeholder="Nome do Cônjuge" className="bg-slate-900 border-slate-800" value={formData.spouseName} onChange={e => updateField('spouseName', e.target.value)} />
                                                    <Input placeholder="CPF do Cônjuge" className="bg-slate-900 border-slate-800" value={formData.spouseCpf} onChange={e => updateField('spouseCpf', maskCPF(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                        {isMinor && (
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <h3 className="font-bold text-orange-400 flex items-center gap-2">⚠️ Responsável Legal</h3>
                                                <div className="space-y-3">
                                                    <Input placeholder="Nome do Responsável" className="bg-slate-900 border-slate-800" value={formData.guardianName} onChange={e => updateField('guardianName', e.target.value)} />
                                                    <Input placeholder="CPF do Responsável" className="bg-slate-900 border-slate-800" value={formData.guardianCpf} onChange={e => updateField('guardianCpf', maskCPF(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-4">
                                <h3 className="font-bold text-white">Filhos / Outros Dependentes</h3>
                                {formData.dependents.map((dep, idx) => (
                                    <div key={idx} className="bg-slate-900 p-4 rounded-lg relative border border-white/5">
                                        <button
                                            className="absolute top-2 right-2 text-slate-500 hover:text-red-400"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                dependents: prev.dependents.filter((_, i) => i !== idx)
                                            }))}
                                        >✕</button>
                                        <div className="space-y-2">
                                            <Input placeholder="Nome" className="bg-slate-950" value={dep.name} onChange={e => {
                                                const newDeps = [...formData.dependents];
                                                newDeps[idx].name = e.target.value;
                                                updateField('dependents', newDeps);
                                            }} />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input placeholder="CPF" className="bg-slate-950" value={dep.cpf} onChange={e => {
                                                    const newDeps = [...formData.dependents];
                                                    newDeps[idx].cpf = maskCPF(e.target.value);
                                                    updateField('dependents', newDeps);
                                                }} />
                                                <Input type="date" className="bg-slate-950" value={dep.birthDate} onChange={e => {
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
                                    className="w-full border-dashed border-slate-700 text-slate-400 py-8"
                                    onClick={() => updateField('dependents', [...formData.dependents, { name: '', cpf: '', birthDate: '', relationship: 'Filho(a)' }])}
                                >
                                    + Adicionar Dependente
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Dados Bancários</h2>
                            <p className="text-slate-400 text-sm">Onde você deseja receber seu salário e benefícios?</p>

                            <Card className="bg-slate-900/80 border-indigo-500/20">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Banco</Label>
                                        <Input placeholder="Ex: Itaú, Bradesco, NuBank" className="bg-slate-950 border-slate-800 py-6" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Agência</Label>
                                            <Input placeholder="0000" className="bg-slate-950 border-slate-800" value={formData.agency} onChange={e => updateField('agency', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Conta</Label>
                                            <Input placeholder="00000-0" className="bg-slate-950 border-slate-800" value={formData.accountNumber} onChange={e => updateField('accountNumber', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Chave PIX (Obrigatório)</Label>
                                        <Input placeholder="CPF, E-mail ou Celular" className="bg-slate-950 border-[#FF7800]/30 py-6" value={formData.pixKey} onChange={e => updateField('pixKey', e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Fotos dos Documentos</h2>
                            <p className="text-slate-400 text-sm">Tire uma foto legível de cada documento solicitado. Use o botão 📷 para capturar ou selecionar da galeria.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Profile Photo */}
                                <div className="space-y-2">
                                    <Label className="text-white font-bold">Foto de Perfil</Label>
                                    <div className="h-48 bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center relative overflow-hidden group">
                                        {formData.photoUrl ? (
                                            <img src={formData.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Camera className="h-10 w-10 text-[#FF7800] mx-auto mb-2 opacity-50" />
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Uma foto sua estilo 3x4</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" capture="user" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'PROFILE')} />
                                        {formData.photoUrl && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">Alterar Foto</div>}
                                    </div>
                                </div>

                                {/* RG/CNH Front */}
                                <div className="space-y-2">
                                    <Label className="text-white font-bold">RG ou CNH (Frente)</Label>
                                    <div className={`h-48 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden group ${formData.documents.some(d => d.type === 'IDENTIDADE_FRENTE') ? 'bg-[#FF7800]/10 border-[#FF7800]/40' : 'bg-slate-900 border-slate-800'}`}>
                                        {formData.documents.some(d => d.type === 'IDENTIDADE_FRENTE') ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="h-12 w-12 text-[#FF7800]" />
                                                <span className="text-xs text-[#FF7800] font-bold uppercase tracking-widest">Enviado!</span>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Camera className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Capturar Frente</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'IDENTIDADE_FRENTE')} />
                                    </div>
                                </div>

                                {/* Comp Residência */}
                                <div className="space-y-2">
                                    <Label className="text-white font-bold">Comprovante de Endereço</Label>
                                    <div className={`h-48 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden group ${formData.documents.some(d => d.type === 'ENDERECO') ? 'bg-[#FF7800]/10 border-[#FF7800]/40' : 'bg-slate-900 border-slate-800'}`}>
                                        {formData.documents.some(d => d.type === 'ENDERECO') ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="h-12 w-12 text-[#FF7800]" />
                                                <span className="text-xs text-[#FF7800] font-bold uppercase tracking-widest">Enviado!</span>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Camera className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Capturar Comprovante</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'ENDERECO')} />
                                    </div>
                                </div>

                                {/* Outros / CTPS */}
                                <div className="space-y-2">
                                    <Label className="text-white font-bold">Carteira de Trabalho / Outros</Label>
                                    <div className={`h-48 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden group ${formData.documents.some(d => d.type === 'OUTROS') ? 'bg-[#FF7800]/10 border-[#FF7800]/40' : 'bg-slate-900 border-slate-800'}`}>
                                        <div className="text-center p-4">
                                            <Camera className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                {formData.documents.filter(d => d.type === 'OUTROS').length} documento(s) enviado(s)
                                            </span>
                                        </div>
                                        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'OUTROS')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="space-y-6 text-center py-8">
                            <div className="h-20 w-20 bg-[#FF7800]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-[#FF7800]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Revisar e Enviar</h2>
                            <p className="text-slate-400">
                                Conferiu tudo? Ao clicar no botão abaixo, seus dados serão enviados para nossa equipe revisar.
                            </p>

                            <Card className="bg-slate-900/50 border-white/5 text-left divide-y divide-white/5">
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Informações Pessoais</span>
                                    {formData.name && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Endereço Completo</span>
                                    {formData.street && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Dados Bancários</span>
                                    {formData.pixKey && <CheckCircle2 className="h-4 w-4 text-[#FF7800]" />}
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Documentos</span>
                                    <span className="text-xs font-mono text-[#FF7800]">{formData.documents.length} fotos</span>
                                </div>
                            </Card>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3 text-left">
                                <Info className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-300 leading-normal">
                                    Importante: Garanta que as fotos estejam nítidas. Fotos tremidas ou escuras podem atrasar sua contratação.
                                </p>
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="flex gap-4 pt-12">
                {step > 0 && (
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 py-10 rounded-2xl"
                        onClick={handleBack}
                        disabled={loading}
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                    </Button>
                )}

                {step === 0 ? null : step < steps.length - 1 ? (
                    <Button
                        size="lg"
                        className="flex-[2] bg-[#FF7800] hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm py-10 shadow-2xl shadow-[#FF7800]/20 rounded-2xl transition-all"
                        onClick={handleNext}
                        disabled={loading}
                    >
                        Continuar <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-sm py-10 shadow-2xl shadow-green-600/20 rounded-2xl transition-all"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Finalizar Cadastro ✨'}
                    </Button>
                )}
            </div>
        </div>
    );
}
