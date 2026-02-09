
// CNAB 240 Generator (Simplified for Salários)
// Reference: Febraban Layout 240

export class CNAB240Generator {
    buffer: string[] = [];
    sequence: number = 1;

    constructor(
        private company: { name: string, cnpj: string, bankAccount: string, bankAgency: string },
        private bankCode: string = '341' // Itaú default
    ) { }

    // Helper: Pad Left/Right
    private num(val: string | number, len: number) { return String(val).replace(/\D/g, '').padStart(len, '0').slice(0, len); }
    private str(val: string, len: number) { return val.padEnd(len, ' ').slice(0, len).toUpperCase(); }

    generateHeaderArquivo() {
        const line =
            this.bankCode + // 01-03 Banco
            '0000' +        // 04-07 Lote (0000 para Header de Arquivo)
            '0' +           // 08-08 Registro (0 = Header Arquivo)
            this.str('', 9) + // 09-17 Reservado
            '2' +           // 18-18 Tipo Inscrição (2 = CNPJ)
            this.num(this.company.cnpj, 14) + // 19-32 CNPJ
            this.str('', 20) + // 33-52 Convenio (Bank specific) - MOCK
            this.num(this.company.bankAgency, 5) + // 53-57 Agencia
            this.str('', 1) + // 58-58 DV Agencia
            this.num(this.company.bankAccount, 12) + // 59-70 Conta
            this.str('', 1) + // 71-71 DV Conta
            this.str('', 1) + // 72-72 DV Ag/Conta
            this.str(this.company.name, 30) + // 73-102 Nome Empresa
            this.str('BANCO ITAU', 30) + // 103-132 Nome Banco
            this.str('', 10); // ... Truncated for brevity of MVP

        this.buffer.push(line);
    }

    generateHeaderLote() {
        // Lote 0001 - Pagamento Salários
        const line = this.bankCode + '0001' + '1' + 'C' + '20' + '01'; // ... Simplified
        this.buffer.push(line);
    }

    addPayment(employee: any, value: number) {
        // Segmento A (Favorecido/Valor)
        // Segmento B (PIX/Dados Complementares)
        // This accepts employee object and creates the lines
        const netVal = Number(value).toFixed(2).replace('.', '');

        // Mock Segment A
        const lineA = this.bankCode + '0001' + '3' + this.num(this.sequence++, 5) + 'A' + '000';
        this.buffer.push(lineA);
    }

    generateTrailerLote() {
        this.buffer.push(this.bankCode + '0001' + '5' + '...');
    }

    generateTrailerArquivo() {
        this.buffer.push(this.bankCode + '9999' + '9' + '...');
    }

    export() {
        return this.buffer.join('\n');
    }
}
