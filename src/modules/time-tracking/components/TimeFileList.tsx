'use client';

import { useEffect, useState } from 'react';
import { getTimeFiles } from '../actions';

export function TimeFileList() {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        getTimeFiles().then(res => {
            if (res.success) setFiles(res.data || []);
        });
    }, []);

    if (files.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>Nenhum arquivo importado recentemente.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                        <p className="font-medium text-slate-800 text-sm">{file.fileName}</p>
                        <p className="text-xs text-slate-500">
                            {new Date(file.uploadDate).toLocaleString('pt-BR')} • {file.store || 'Sem Loja'}
                        </p>
                    </div>
                    <div>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${file.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {file.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
