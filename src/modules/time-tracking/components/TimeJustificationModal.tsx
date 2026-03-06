'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TimeJustificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    onSuccess: () => void;
}

export function TimeJustificationModal({
    isOpen,
    onClose,
    date,
    onSuccess
}: TimeJustificationModalProps) {
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!justification.trim()) {
            toast.error('Por favor, descreva o motivo da justificativa.');
            return;
        }

        setLoading(true);
        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Justificativa enviada com sucesso!');
            onSuccess();
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setJustification('');
        setPhoto(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Justificativa - ${new Date(date).toLocaleDateString('pt-BR')}`}
            width="md"
        >
            <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-xs leading-relaxed">
                        Sua justificativa será analisada pelo RH. Se houver atestado médico, certifique-se de que a foto está legível.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo da Justificativa</label>
                    <textarea
                        className="w-full border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-sm focus:ring-4 ring-brand-blue/5 focus:border-brand-blue/20 outline-none transition-all min-h-[120px]"
                        placeholder="Ex: Esquecimento de batida, consulta médica, problema no terminal..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anexo (Opcional)</label>

                    {!previewUrl ? (
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handlePhotoChange}
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:bg-slate-50 transition-colors">
                                <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-600">Tirar foto ou Upload</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">PNG, JPG até 5MB</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 group">
                            <img src={previewUrl} alt="Preview" className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => { setPhoto(null); setPreviewUrl(null); }}
                                >
                                    Remover Foto
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2 flex gap-3">
                    <Button variant="ghost" onClick={handleClose} className="flex-1 rounded-2xl h-12 font-bold text-slate-500">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] bg-brand-blue hover:bg-blue-900 text-white rounded-2xl h-12 font-black shadow-lg shadow-blue-900/20"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                        ENVIAR PARA O RH
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
