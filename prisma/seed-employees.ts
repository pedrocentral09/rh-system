import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding employees (SQLite)...');

    // Clean existing data if needed (optional, be careful in prod)
    // await prisma.employee.deleteMany({});

    const departments = ['Recursos Humanos', 'Vendas', 'TI', 'Financeiro', 'Logística'];
    const titles = ['Analista', 'Gerente', 'Assistente', 'Coordenador', 'Diretor'];
    const firstNames = ['Ana', 'Carlos', 'Beatriz', 'Daniel', 'Eduarda', 'Fernando', 'Gabriela', 'Hugo', 'Isabela', 'João'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Pereira', 'Almeida', 'Nascimento'];

    for (let i = 0; i < 10; i++) {
        const firstName = firstNames[i];
        const lastName = lastNames[i];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@empresa.com`;

        // Generate valid-ish CPF
        const cpf = `123.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}`;
        const rg = `MG-${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}`;

        await prisma.employee.create({
            data: {
                name: fullName,
                email: email,
                cpf: cpf,
                rg: rg,
                maritalStatus: i % 2 === 0 ? 'Solteiro(a)' : 'Casado(a)',
                dateOfBirth: new Date('1990-05-20'),
                gender: i % 2 === 0 ? 'MALE' : 'FEMALE',

                jobTitle: titles[i % titles.length],
                department: departments[i % departments.length],
                hireDate: new Date('2022-03-10'),

                phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                landline: '',
                photoUrl: '', // Could add placeholder images if needed

                status: 'ACTIVE',

                address: {
                    create: {
                        street: `Rua Exemplo ${i}`,
                        number: `${i * 10}`,
                        neighborhood: 'Centro',
                        city: 'São Paulo',
                        state: 'SP',
                        zipCode: '01001-000'
                    }
                },
                bankData: {
                    create: {
                        bankName: 'Nubank',
                        agency: '0001',
                        accountNumber: `12345${i}`,
                        accountType: 'Corrente',
                        pixKey: email
                    }
                },
                contract: {
                    create: {
                        sector: 'Vendas',
                        baseSalary: 2500.00,
                        contractType: 'CLT',
                        workShift: 'FULL_TIME',
                        admissionDate: new Date()
                    }
                },
                healthData: {
                    create: {
                        asoType: 'Admissional',
                        lastAsoDate: new Date(),
                        periodicity: 12
                    }
                }
            }
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
