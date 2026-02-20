
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CloudUpload, FileCheck, X } from 'lucide-react';
import { uploadCandidateResume } from '@/lib/firebase/storage-utils';
import { toast } from 'sonner';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    candidateName: string;
    label?: string;
}

export function FileUpload({ onUploadComplete, candidateName, label }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!candidateName) {
            toast.error('Preencha o nome do candidato antes de enviar o currículo');
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadCandidateResume(file, candidateName);
            setUploadedUrl(url);
            setFileName(file.name);
            onUploadComplete(url);
            toast.success('Currículo enviado com sucesso!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erro ao enviar arquivo para o servidor.');
        } finally {
            setIsUploading(false);
        }
    }

    function clearFile() {
        setUploadedUrl(null);
        setFileName(null);
        onUploadComplete('');
    }

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium dark:text-slate-200">{label}</label>}

            {!uploadedUrl ? (
                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                                <p className="text-sm text-slate-500">Enviando currículo...</p>
                            </>
                        ) : (
                            <>
                                <CloudUpload className="h-8 w-8 text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">Clique ou arraste o currículo (.pdf, .doc)</p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">
                            {fileName}
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

import { Input } from '@/shared/components/ui/input';
