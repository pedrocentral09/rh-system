'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { initiateSelfOnboarding } from '../actions/employees';
import { Copy, Check, Link as LinkIcon, UserPlus } from 'lucide-react';

interface EmployeeOnboardingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmployeeOnboardingRequestModal({ isOpen, onClose, onSuccess }: EmployeeOnboardingRequestModalProps) {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!cpf || cpf.length < 11) {
            toast.error('Informe um CPF válido');
            return;
        }

        setLoading(true);
        try {
            const result = await initiateSelfOnboarding(cpf);
            if (result.success) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/onboarding/${result.data.id}`;
                setGeneratedLink(link);
                toast.success('Processo iniciado com sucesso!');
                onSuccess();
            } else {
                toast.error(result.message || 'Erro ao iniciar processo');
            }
        } catch (error) {
            toast.error('Erro de conexão ao gerar link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copiado para a área de transferência');
        }
    };

    const handleReset = () => {
        setCpf('');
        setGeneratedLink(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!generatedLink) onClose();
                else handleReset();
            }}
            title="Solicitar Autocadastro"
            width="md"
        >
            <div className="space-y-6 pt-4 pb-6">
                {!generatedLink ? (
                    <>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Informe o CPF do novo colaborador para gerar um link exclusivo de cadastro.
                                Ele poderá preencher todos os dados e enviar as fotos dos documentos pelo celular.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF do Colaborador</Label>
                                <Input
                                    id="cpf"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="text-lg py-6"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                                {loading ? 'Gerando...' : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Gerar Link de Cadastro
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 text-center space-y-4">
                            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto">
                                <LinkIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Link Gerado!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Envie o link abaixo para o colaborador via WhatsApp ou E-mail.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 group">
                                <span className="text-xs text-slate-500 font-mono truncate flex-1 block overflow-hidden">
                                    {generatedLink}
                                </span>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <Button onClick={handleCopy} className="w-full gap-2 py-6 text-base shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Copy className="h-5 w-5" />
                                Copiar Link para WhatsApp
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleReset}
                                className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                Gerar outro link
                            </button>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={onClose}>Fechar</Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
