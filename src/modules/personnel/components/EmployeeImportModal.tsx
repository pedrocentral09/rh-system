'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import * as xlsx from 'xlsx';
import { bulkImportEmployees } from '../actions/employees';
import { Loader2, UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface EmployeeImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmployeeImportModal({ isOpen, onClose, onSuccess }: EmployeeImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Preview data
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = xlsx.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                const data = xlsx.utils.sheet_to_json(ws);
                setPreviewData(data.slice(0, 5)); // show first 5 rows
            } catch (err) {
                console.error("Error parsing file", err);
                toast.error("Erro ao ler a planilha. Formato inválido.");
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleImport = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Re-read file to actually process it
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = xlsx.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const rawJson = xlsx.utils.sheet_to_json(ws);

                    // Map headers gracefully
                    const mappedData = rawJson.map((row: any) => ({
                        name: row['Nome'] || row['NOME'] || row['name'] || 'Nome Faltante',
                        email: row['Email'] || row['EMAIL'] || row['e-mail'] || row['E-mail'] || null,
                        cpf: row['CPF'] || row['cpf'] || null,
                        rg: row['RG'] || row['rg'] || null,
                        dateOfBirth: row['Data de Nascimento'] || row['Data Nascimento'] || null,
                        gender: row['Gênero'] || row['Sexo'] || null,
                        maritalStatus: row['Estado Civil'] || null,
                        phone: row['Telefone'] || row['Celular'] || null,
                        jobTitle: row['Cargo'] || row['Função'] || null,
                        department: row['Departamento'] || row['Setor'] || null
                    }));

                    const res = await bulkImportEmployees(mappedData);

                    if (res.success) {
                        toast.success(`Importação Concluída! ${res.data.successCount} registros importados.`);
                        if (res.data.errorCount > 0) {
                            toast.warning(`${res.data.errorCount} falharam. Pressione F12 para ver erros no console.`);
                            console.error("Erros de importação:", res.data.errors);
                        }
                        handleClose();
                        onSuccess();
                    } else {
                        toast.error(res.error || 'Erro processando os dados.');
                    }
                } catch (e: any) {
                    toast.error("Erro ao importar: " + e.message);
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsBinaryString(file);

        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado na importação");
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setIsUploading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importar Funcionários" width="lg">
            <div className="p-4 space-y-6">

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg flex items-start space-x-3 text-amber-800 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold mb-1">Sobre a Importação Parcial</p>
                        <p>Funcionários importados via planilha que não possuem dados completos serão marcados no sistema com a cor amarela. Eles devem ser completados manualmente depois na aba de Edição.</p>
                    </div>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${file ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />

                    {file ? (
                        <>
                            <FileSpreadsheet className="w-12 h-12 text-indigo-500 mb-3" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-1">Clique para trocar de arquivo</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                            <p className="font-semibold text-slate-700 dark:text-slate-300">Clique para anexar sua planilha (.xlsx)</p>
                            <p className="text-xs text-slate-500 mt-1">Certifique-se que o cabeçalho contenha 'Nome'.</p>
                        </>
                    )}
                </div>

                {previewData.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Prévia (5 linhas)</p>
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                            <thead>
                                <tr>
                                    <th className="font-semibold pb-2">Nome Identificado</th>
                                    <th className="font-semibold pb-2">CPF</th>
                                    <th className="font-semibold pb-2">Cargo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="py-1">{row.Nome || row.NOME || row.name || '---'}</td>
                                        <td className="py-1">{row.CPF || row.cpf || '---'}</td>
                                        <td className="py-1">{row.Cargo || row.Função || '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancelar</Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || isUploading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                    >
                        {isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                        ) : (
                            'Importar Base'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
