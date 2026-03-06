'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/core/actions/auth";
import { addMonths } from "date-fns";
import { generateReviewsForCycle } from "./cycles";

export async function getAutomationSettings() {
    try {
        let settings = await prisma.performanceAutomationSettings.findFirst();

        if (!settings) {
            settings = await prisma.performanceAutomationSettings.create({
                data: {
                    isActive: false,
                    methodology: 'TOP_DOWN',
                    autoCloseDays: 15,
                    checkIntervalDays: 1,
                    selectedCategories: [],
                    selectedQuestionIds: []
                }
            });
        }

        return { success: true, data: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAutomationSettings(data: any) {
    try {
        const current = await getAutomationSettings();
        if (!current.success || !current.data) throw new Error("Settings not found");

        const updated = await prisma.performanceAutomationSettings.update({
            where: { id: current.data.id },
            data: {
                isActive: data.isActive,
                methodology: data.methodology,
                autoCloseDays: data.autoCloseDays,
                checkIntervalDays: data.checkIntervalDays || 1,
                selectedCategories: data.selectedCategories || [],
                selectedQuestionIds: data.selectedQuestionIds || [],
            }
        });

        revalidatePath('/dashboard/performance');
        return { success: true, data: updated };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processAutomatedEvaluations() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        const settingsResult = await getAutomationSettings();
        if (!settingsResult.success || !settingsResult.data) {
            throw new Error("Configurações de automação não encontradas");
        }

        const settings = settingsResult.data;
        const now = new Date();

        // Check frequency (if not manual trigger, but this action is usually triggered manually or by a cron)
        // If we want to skip if lastRun was too recent:
        if (settings.lastRun && settings.isActive) {
            const lastRunDate = new Date(settings.lastRun);
            const nextRunDate = new Date(lastRunDate.getTime() + (settings.checkIntervalDays * 24 * 60 * 60 * 1000));
            if (now < nextRunDate) {
                return { success: true, count: 0, message: 'Aguardando próximo intervalo de verificação.' };
            }
        }

        // 1. Find all active employees due for evaluation
        const dueEmployees = await prisma.employee.findMany({
            where: {
                status: 'ACTIVE',
                nextEvaluationDate: { lte: now },
                evaluationInterval: { not: null }
            },
            include: {
                jobRole: { select: { name: true } }
            }
        });

        if (dueEmployees.length === 0) {
            return { success: true, count: 0, message: 'Nenhum colaborador no prazo de avaliação.' };
        }

        // 2. Create an Automated Cycle
        const cycleName = `Automação - ${new Date().toLocaleDateString('pt-BR')}`;
        const cycle = await prisma.evaluationCycle.create({
            data: {
                name: cycleName,
                startDate: now,
                endDate: new Date(now.getTime() + (settings.autoCloseDays * 24 * 60 * 60 * 1000)),
                type: settings.methodology,
                isActive: true
            }
        });

        // 3. Generate Reviews
        // For automated cycles, we default to Top-Down (Evaluator is the manager or admin)
        // We'll try to find a manager first, otherwise use the current user
        const participants = dueEmployees.map(emp => ({
            evaluatedId: emp.id,
            evaluatorId: '' // generateReviewsForCycle logic should handle manager detection or use current user
        }));

        const reviewResult = await generateReviewsForCycle(cycle.id, participants);

        if (!reviewResult.success) {
            throw new Error(reviewResult.error || "Erro ao gerar avaliações para o ciclo automático");
        }

        // 4. Update nextEvaluationDate for each employee
        for (const emp of dueEmployees) {
            if (emp.evaluationInterval) {
                const nextDate = addMonths(now, emp.evaluationInterval);
                await prisma.employee.update({
                    where: { id: emp.id },
                    data: { nextEvaluationDate: nextDate }
                });
            }
        }

        // 5. Update lastRun in settings
        await prisma.performanceAutomationSettings.update({
            where: { id: settings.id },
            data: { lastRun: now }
        });

        revalidatePath('/dashboard/performance');
        return {
            success: true,
            count: dueEmployees.length,
            message: `${dueEmployees.length} colaboradores processados. Ciclo "${cycleName}" criado.`
        };

    } catch (error: any) {
        console.error('Automation Engine Error:', error);
        return { success: false, error: error.message };
    }
}
