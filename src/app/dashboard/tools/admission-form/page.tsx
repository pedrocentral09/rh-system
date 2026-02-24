'use client';

import { useState } from 'react';

export default function AdmissionFormPage() {
    const [generating, setGenerating] = useState(false);

    const handleGeneratePDF = async () => {
        setGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const W = pdf.internal.pageSize.getWidth();
            const margin = 15;
            const contentW = W - margin * 2;
            let y = 10;

            // Colors
            const navy = [11, 30, 63] as [number, number, number];
            const orange = [255, 120, 0] as [number, number, number];
            const gray = [100, 100, 100] as [number, number, number];
            const lightGray = [230, 230, 230] as [number, number, number];

            // Load logo
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            await new Promise<void>((resolve) => {
                logoImg.onload = () => resolve();
                logoImg.onerror = () => resolve();
                logoImg.src = '/logo.jpg';
            });

            // Header background
            pdf.setFillColor(...navy);
            pdf.rect(0, 0, W, 38, 'F');

            // Logo
            try {
                pdf.addImage(logoImg, 'JPEG', margin, 3, 45, 25);
            } catch { /* logo fallback */ }

            // Title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FICHA DE ADMISSÃO', W - margin, 15, { align: 'right' });
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Rede Família Supermercados', W - margin, 22, { align: 'right' });
            pdf.setFontSize(7);
            pdf.setTextColor(200, 200, 200);
            pdf.text('Preencha todos os campos com letra legível. Entregue ao setor de RH.', W - margin, 28, { align: 'right' });

            // Orange accent line
            pdf.setFillColor(...orange);
            pdf.rect(0, 38, W, 2, 'F');
            y = 46;

            // Helper functions
            const sectionTitle = (title: string) => {
                pdf.setFillColor(...navy);
                pdf.rect(margin, y, contentW, 7, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`  ${title}`, margin + 2, y + 5);
                y += 10;
            };

            const fieldLine = (label: string, width: number, xOffset: number = 0) => {
                const x = margin + xOffset;
                pdf.setTextColor(...gray);
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'bold');
                pdf.text(label, x, y);
                y += 1;
                pdf.setDrawColor(...lightGray);
                pdf.setLineWidth(0.3);
                pdf.line(x, y + 3, x + width, y + 3);
                y += 7;
            };

            const fieldRow = (fields: { label: string; width: number }[]) => {
                const startY = y;
                let xOffset = 0;
                fields.forEach((f) => {
                    const x = margin + xOffset;
                    pdf.setTextColor(...gray);
                    pdf.setFontSize(7);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(f.label, x, startY);
                    pdf.setDrawColor(...lightGray);
                    pdf.setLineWidth(0.3);
                    pdf.line(x, startY + 4, x + f.width, startY + 4);
                    xOffset += f.width + 5;
                });
                y = startY + 8;
            };

            const checkIfNewPage = (needed: number) => {
                if (y + needed > 280) {
                    pdf.addPage();
                    y = 15;
                }
            };

            // ===== SECTION 1: DADOS PESSOAIS =====
            sectionTitle('1. DADOS PESSOAIS');
            fieldLine('NOME COMPLETO', contentW);
            fieldRow([
                { label: 'DATA DE NASCIMENTO', width: 40 },
                { label: 'NATURALIDADE', width: 50 },
                { label: 'NACIONALIDADE', width: 40 },
                { label: 'ESTADO CIVIL', width: 35 },
            ]);
            fieldRow([
                { label: 'NOME DA MÃE', width: 85 },
                { label: 'NOME DO PAI', width: 85 },
            ]);
            fieldRow([
                { label: 'SEXO (M/F)', width: 25 },
                { label: 'COR/RAÇA', width: 30 },
                { label: 'ESCOLARIDADE', width: 50 },
                { label: 'DEFICIÊNCIA (S/N)', width: 35 },
            ]);

            // ===== SECTION 2: DOCUMENTOS =====
            checkIfNewPage(45);
            sectionTitle('2. DOCUMENTOS');
            fieldRow([
                { label: 'CPF', width: 55 },
                { label: 'RG', width: 55 },
                { label: 'ÓRGÃO EMISSOR / UF', width: 50 },
            ]);
            fieldRow([
                { label: 'CTPS (Nº / SÉRIE)', width: 55 },
                { label: 'PIS/PASEP', width: 55 },
                { label: 'TÍTULO DE ELEITOR', width: 50 },
            ]);
            fieldRow([
                { label: 'CERT. RESERVISTA', width: 55 },
                { label: 'CNH (Nº / CATEGORIA)', width: 55 },
                { label: 'VALIDADE CNH', width: 50 },
            ]);

            // ===== SECTION 3: ENDEREÇO =====
            checkIfNewPage(45);
            sectionTitle('3. ENDEREÇO');
            fieldLine('LOGRADOURO (RUA, AVENIDA, ETC)', contentW);
            fieldRow([
                { label: 'NÚMERO', width: 25 },
                { label: 'COMPLEMENTO', width: 40 },
                { label: 'BAIRRO', width: 45 },
                { label: 'CEP', width: 35 },
            ]);
            fieldRow([
                { label: 'CIDADE', width: 80 },
                { label: 'UF', width: 20 },
                { label: 'TELEFONE / CELULAR', width: 60 },
            ]);
            fieldLine('E-MAIL', contentW);

            // ===== SECTION 4: DADOS PROFISSIONAIS =====
            checkIfNewPage(45);
            sectionTitle('4. DADOS PROFISSIONAIS (Preenchido pelo RH)');
            fieldRow([
                { label: 'CARGO', width: 60 },
                { label: 'SETOR', width: 50 },
                { label: 'LOJA / UNIDADE', width: 50 },
            ]);
            fieldRow([
                { label: 'DATA DE ADMISSÃO', width: 40 },
                { label: 'SALÁRIO BASE (R$)', width: 40 },
                { label: 'HORÁRIO DE TRABALHO', width: 45 },
                { label: 'TIPO DE CONTRATO', width: 35 },
            ]);

            // ===== SECTION 5: CONTATO DE EMERGÊNCIA =====
            checkIfNewPage(30);
            sectionTitle('5. CONTATO DE EMERGÊNCIA');
            fieldRow([
                { label: 'NOME', width: 80 },
                { label: 'PARENTESCO', width: 35 },
                { label: 'TELEFONE', width: 45 },
            ]);

            // ===== SECTION 6: DADOS BANCÁRIOS =====
            checkIfNewPage(30);
            sectionTitle('6. DADOS BANCÁRIOS');
            fieldRow([
                { label: 'BANCO', width: 55 },
                { label: 'AGÊNCIA', width: 30 },
                { label: 'CONTA', width: 35 },
                { label: 'TIPO (CC/CP/CS)', width: 35 },
            ]);
            fieldLine('CHAVE PIX', contentW);

            // ===== SECTION 7: DEPENDENTES =====
            checkIfNewPage(30);
            sectionTitle('7. DEPENDENTES (Para Salário Família / IR)');
            pdf.setFontSize(6.5);
            pdf.setTextColor(...gray);
            pdf.setFont('helvetica', 'normal');
            const depHeaders = ['NOME COMPLETO', 'PARENTESCO', 'DATA NASC.', 'CPF'];
            const depWidths = [75, 30, 30, 35];
            let depX = margin;
            depHeaders.forEach((h, i) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(h, depX, y);
                depX += depWidths[i];
            });
            y += 2;
            // 4 empty rows
            for (let i = 0; i < 4; i++) {
                depX = margin;
                depWidths.forEach((w) => {
                    pdf.setDrawColor(...lightGray);
                    pdf.line(depX, y + 4, depX + w - 3, y + 4);
                    depX += w;
                });
                y += 7;
            }

            // ===== SECTION 8: SAÚDE =====
            checkIfNewPage(30);
            sectionTitle('8. SAÚDE OCUPACIONAL');
            fieldRow([
                { label: 'TIPO ASO', width: 40 },
                { label: 'DATA DO EXAME', width: 40 },
                { label: 'RESULTADO (APTO/INAPTO)', width: 45 },
                { label: 'CRM DO MÉDICO', width: 35 },
            ]);

            // ===== SIGNATURE AREA =====
            checkIfNewPage(40);
            y += 5;
            pdf.setFillColor(...navy);
            pdf.rect(margin, y, contentW, 0.5, 'F');
            y += 8;

            pdf.setTextColor(...gray);
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Declaro que as informações acima são verdadeiras e estou ciente de que qualquer falsidade poderá acarretar a rescisão do contrato de trabalho.', margin, y);
            y += 12;

            // Date
            pdf.setTextColor(...navy);
            pdf.setFontSize(8);
            pdf.text(`_________________, ______ de ________________________ de __________`, margin, y);
            y += 18;

            // Signature lines
            const sigW = (contentW - 20) / 2;
            pdf.setDrawColor(...navy);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y, margin + sigW, y);
            pdf.line(margin + sigW + 20, y, margin + contentW, y);
            y += 4;

            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...navy);
            pdf.text('ASSINATURA DO COLABORADOR', margin + sigW / 2, y, { align: 'center' });
            pdf.text('RESPONSÁVEL RH', margin + sigW + 20 + sigW / 2, y, { align: 'center' });

            // Footer
            const footerY = pdf.internal.pageSize.getHeight() - 8;
            pdf.setFillColor(...orange);
            pdf.rect(0, footerY - 2, W, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Rede Família Supermercados — Documento Confidencial — Uso exclusivo do Departamento de Recursos Humanos', W / 2, footerY + 2, { align: 'center' });

            // Save
            pdf.save('Ficha_Admissao_Rede_Familia.pdf');
        } catch (e) {
            console.error('Erro ao gerar PDF:', e);
            alert('Erro ao gerar o PDF. Tente novamente.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📋 Ficha de Admissão</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Gere o formulário profissional para coleta de dados de novos colaboradores.
                        Envie por WhatsApp ou imprima para preenchimento presencial.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">O formulário inclui:</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>✅ Dados Pessoais</span>
                        <span>✅ Documentos (CPF, RG, CTPS, PIS)</span>
                        <span>✅ Endereço Completo</span>
                        <span>✅ Contato de Emergência</span>
                        <span>✅ Dados Bancários + PIX</span>
                        <span>✅ Dependentes (Sal. Família)</span>
                        <span>✅ Saúde Ocupacional (ASO)</span>
                        <span>✅ Dados Profissionais (RH)</span>
                    </div>
                </div>

                <button
                    onClick={handleGeneratePDF}
                    disabled={generating}
                    className="w-full bg-[#0B1E3F] hover:bg-[#14305C] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <><span className="animate-spin">⏳</span> Gerando PDF...</>
                    ) : (
                        <><span className="text-lg">📄</span> Gerar Ficha de Admissão (PDF)</>
                    )}
                </button>

                <p className="text-[10px] text-slate-400">
                    O PDF será baixado automaticamente com o logo da Rede Família Supermercados.
                </p>
            </div>
        </div>
    );
}
