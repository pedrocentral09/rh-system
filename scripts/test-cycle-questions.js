const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let question = await prisma.reviewQuestion.findFirst();
    if (!question) {
        question = await prisma.reviewQuestion.create({
            data: { category: "Culture", text: "How is the culture?", weight: 1.0 }
        });
    }

    let template = await prisma.evaluationTemplate.findFirst({
        include: { questions: true }
    });

    if (!template) {
        template = await prisma.evaluationTemplate.create({
            data: {
                name: "Test Template",
                methodology: "360",
                questions: {
                    connect: [{ id: question.id }]
                }
            },
            include: { questions: true }
        });
    }

    console.log(`Using template: ${template.name} with ${template.questions.length} questions`);

    const users = await prisma.employee.findMany({ take: 2 });
    if (users.length < 2) return;

    // create a fake cycle
    const cycle = await prisma.evaluationCycle.create({
        data: {
            name: "Test Cycle " + new Date().getTime(),
            startDate: new Date(),
            endDate: new Date(),
            templateId: template.id,
            isActive: true
        }
    });

    const participants = [{ evaluatorId: users[0].id, evaluatedId: users[1].id }];

    // copy of logic in generateReviewsForCycle
    const data = participants.map(p => ({
        cycleId: cycle.id,
        evaluatorId: p.evaluatorId,
        evaluatedId: p.evaluatedId,
        status: 'PENDING',
    }));

    const result = await prisma.review.createManyAndReturn({
        data,
        skipDuplicates: true
    });

    if (template.questions.length && result.length > 0) {
        const answersToCreate = [];
        for (const review of result) {
            for (const q of template.questions) {
                answersToCreate.push({
                    reviewId: review.id,
                    questionId: q.id,
                    score: 0,
                    comment: ''
                });
            }
        }
        await prisma.reviewAnswer.createMany({ data: answersToCreate });
    }

    const reviews = await prisma.review.findMany({
        where: { cycleId: cycle.id },
        include: { answers: { include: { question: true } } }
    });
    console.log("Reviews generated:", JSON.stringify(reviews, null, 2));

}
main().catch(console.error).finally(() => prisma.$disconnect());
