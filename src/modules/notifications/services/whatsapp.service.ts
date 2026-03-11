import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { prisma } from '@/lib/prisma';

declare global {
    var whatsappClient: WhatsAppService | undefined;
}

export class WhatsAppService {
    private client: Client;
    private isReady: boolean = false;
    private qrCode: string | null = null;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: process.env.CHROME_PATH || undefined // Windows may need this if not in path
            }
        });

        this.initialize();
    }

    private async initialize() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            console.log('WhatsApp QR Code received. Scan it to authenticate:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.qrCode = null;
            console.log('WhatsApp Bot is ready!');
        });

        this.client.on('message', async (message) => {
            await this.handleIncomingMessage(message);
        });

        this.client.on('auth_failure', (msg) => {
            console.error('WhatsApp Authentication failure:', msg);
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            console.log('WhatsApp Client was disconnected:', reason);
            this.client.initialize();
        });

        try {
            await this.client.initialize();
        } catch (error) {
            console.error('Failed to initialize WhatsApp client:', error);
        }
    }

    private async handleIncomingMessage(message: any) {
        const text = message.body.trim().toLowerCase();
        const from = message.from;

        try {
            // Check for Dynamic Auto-Responses first
            const autoRepliesSetting = await prisma.companySettings.findUnique({
                where: { key: 'whatsapp_auto_replies' }
            });

            if (autoRepliesSetting?.value) {
                const autoReplies = JSON.parse(autoRepliesSetting.value) as { keyword: string, response: string, enabled: boolean }[];
                const match = autoReplies.find(r => r.enabled && text.includes(r.keyword.toLowerCase()));
                
                if (match) {
                    await this.sendMessage(from, match.response);
                    return;
                }
            }
        } catch (error) {
            console.error('Error processing auto-replies:', error);
        }

        // Basic Bot Logic
        if (text === 'oi' || text === 'olá') {
            await this.sendMessage(from, 'Olá! Sou o assistente de RH. Por favor, envie seu CPF (apenas números) para que eu possa te ajudar.');
            return;
        }

        // CPF Validation Logic (Basic regex for 11 digits)
        if (/^\d{11}$/.test(text)) {
            const employee = await prisma.employee.findUnique({
                where: { cpf: text },
                include: { workScales: { take: 1, orderBy: { date: 'desc' } } }
            });

            if (!employee) {
                await this.sendMessage(from, 'Desculpe, não encontrei nenhum colaborador com esse CPF no nosso sistema.');
                return;
            }

            // If found, offer options
            let response = `Olá, *${employee.name}*! Como posso te ajudar hoje?\n\n`;
            response += `1. Ver link de cadastro (Onboarding)\n`;
            response += `2. Consultar minha próxima escala\n`;
            response += `3. Link do Holerite (Em breve)\n\n`;
            response += `Responda com o número da opção desejada.`;
            
            await this.sendMessage(from, response);
            return;
        }

        // Handle numeric options
        if (text === '1') {
            // Need the ID for the link. Assuming the link structure from previous context.
            // Example: /onboarding/employee-id
            const onboardingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/onboarding/${message.from.split('@')[0]}`; // Temporary logic
            // Real logic: find by phone or verify if the sender is the employee
            await this.sendMessage(from, `Aqui está o seu link para completar o cadastro: ${onboardingLink}`);
        } else if (text === '2') {
            await this.sendMessage(from, 'Buscando sua escala...');
            // Logic for scale would go here
        }
    }

    public async sendMessage(to: string, message: string) {
        if (!this.isReady) {
            console.warn('WhatsApp client is not ready yet.');
            return;
        }
        try {
            await this.client.sendMessage(to, message);
        } catch (error) {
            console.error(`Failed to send message to ${to}:`, error);
        }
    }

    public getStatus() {
        return {
            isReady: this.isReady,
            hasQR: !!this.qrCode,
            qr: this.qrCode
        };
    }
}

// Singleton pattern for Next.js
export const whatsappService = global.whatsappClient || new WhatsAppService();

if (process.env.NODE_ENV !== 'production') {
    global.whatsappClient = whatsappService;
}
