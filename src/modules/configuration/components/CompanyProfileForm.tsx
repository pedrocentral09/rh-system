'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getCompanyProfile, updateCompanyProfile, CompanyProfile } from '../actions/settings';
import { CNPJInput } from '@/shared/components/ui/cnpj-input';
import { toast } from 'sonner';
import { getAddressByCep } from '@/lib/via-cep';
import { Loader2 } from 'lucide-react';
import { maskCep } from '@/lib/utils';

export function CompanyProfileForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState<CompanyProfile>({
        companyName: '',
        tradingName: '',
        cnpj: '',
        stateRegistration: '',
        municipalRegistration: '',
        email: '',
        phone: '',
        responsible: '',
        address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: ''
        },
        closingDay: 20 // Default closing day for Time Tracking
    });

    const loadData = async () => {
        setLoading(true);
        const result = await getCompanyProfile();
        if (result.success && result.data) {
            // Merge with default structure to avoid nulls
            setFormData(prev => ({
                ...prev,
                ...result.data,
                address: { ...prev.address, ...result.data?.address }
            }));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const checkCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            if (!isCepLoading) {
                setIsCepLoading(true);
                const address = await getAddressByCep(cleanCep);

                if (address) {
                    setFormData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: address.logradouro || '',
                            neighborhood: address.bairro || '',
                            city: address.localidade || '',
                            state: address.uf || '',
                            complement: address.complemento || prev.address.complement
                        }
                    }));
                    toast.success("Endereço encontrado!");
                }
                setIsCepLoading(false);
            }
        }
    };

    const handleAddressChange = (field: string, value: any) => {
        let finalValue = value;
        if (field === 'zipCode') {
            finalValue = maskCep(value);

            // Trigger check if we have a full CEP
            if (finalValue.replace(/\D/g, '').length === 8) {
                checkCep(finalValue);
            }
        }
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: finalValue }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateCompanyProfile(formData);
        if (result.success) {
            toast.success('Dados da empresa atualizados com sucesso!');
        } else {
            toast.error('Erro ao salvar dados.');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 text-slate-500">Carregando dados da empresa...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Dados Cadastrais</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Informações legais da empresa para relatórios e documentos.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Razão Social</label>
                            <Input
                                value={formData.companyName}
                                onChange={e => handleChange('companyName', e.target.value)}
                                placeholder="Minha Empresa Ltda"
                                required
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Fantasia</label>
                            <Input
                                value={formData.tradingName}
                                onChange={e => handleChange('tradingName', e.target.value)}
                                placeholder="Nome Fantasia"
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CNPJ</label>
                            <Input
                                value={formData.cnpj}
                                onChange={e => handleChange('cnpj', e.target.value)}
                                placeholder="00.000.000/0001-00"
                                required
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Inscrição Estadual</label>
                            <Input
                                value={formData.stateRegistration}
                                onChange={e => handleChange('stateRegistration', e.target.value)}
                                placeholder="Ex: 000.000.000.000"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Inscrição Municipal</label>
                            <Input
                                value={formData.municipalRegistration}
                                onChange={e => handleChange('municipalRegistration', e.target.value)}
                                placeholder="Ex: 000.000.00"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsável Legal</label>
                            <Input
                                value={formData.responsible}
                                onChange={e => handleChange('responsible', e.target.value)}
                                placeholder="Nome do representante legal"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email Corporativo</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="rh@empresa.com.br"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Telefone</label>
                            <Input
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="(00) 0000-0000"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dia de Fechamento do Ponto</label>
                        <Input
                            type="number"
                            min={1} max={31}
                            value={formData.closingDay}
                            onChange={e => handleChange('closingDay', parseInt(e.target.value))}
                            placeholder="Ex: 20"
                            required
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 w-full md:w-1/4"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dia considerado para corte mensal do espelho de ponto.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Endereço / Sede</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
                            <div className="relative">
                                <Input
                                    value={formData.address.zipCode}
                                    onChange={e => handleAddressChange('zipCode', e.target.value)}
                                    maxLength={9}
                                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 pr-10"
                                />
                                {isCepLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rua / Logradouro</label>
                            <Input
                                value={formData.address.street}
                                onChange={e => handleAddressChange('street', e.target.value)}
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">Número</label>
                            <Input
                                value={formData.address.number}
                                onChange={e => handleAddressChange('number', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Complemento</label>
                            <Input
                                value={formData.address.complement}
                                onChange={e => handleAddressChange('complement', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Bairro</label>
                            <Input
                                value={formData.address.neighborhood}
                                onChange={e => handleAddressChange('neighborhood', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Cidade/UF</label>
                            <Input
                                value={formData.address.city}
                                onChange={e => handleAddressChange('city', e.target.value)}
                                placeholder="Cidade - UF"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white w-40">
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}
