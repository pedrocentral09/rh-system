'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase/admin';
import { logAction } from './audit';
import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/modules/core/utils/auth-helpers';
import { PinService } from '@/modules/core/services/pin.service';

export async function loginAction(formData: FormData) {
    const token = formData.get('token') as string;

    if (!token) {
        return { success: false, error: 'Token de autenticação ausente' };
    }

    try {
        console.log('--- LOGIN ACTION STARTED ---');
        // 1. Verify Firebase Token
        console.log('1. Verifying Firebase Token...');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { uid, email } = decodedToken;
        console.log('Token verified. UID:', uid, 'Email:', email);

        if (!email) throw new Error('E-mail é obrigatório para o login');

        // 2. Sync User
        console.log('2. Finding User in DB...');
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            // Check if user exists by email (to link accounts)
            user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (user) {
                console.log('User found by email. Updating firebaseUid...');
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid: uid },
                });
            } else {
                console.log('User not found. Creating new user...');
                user = await prisma.user.create({
                    data: {
                        firebaseUid: uid,
                        email: email,
                        name: decodedToken.name || email.split('@')[0],
                        role: 'EMPLOYEE',
                    },
                });
                await logAction('USER_CREATED', 'User', { id: user.id, email }, user.id);
                console.log('User created:', user.id);
            }
        } else {
            console.log('User found:', user.id, user.role);
        }

        // 3. Set Session Cookie
        console.log('3. Setting Session Cookie...');
        const cookieStore = await cookies();
        // Set cookie for 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        cookieStore.set('hr_session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        });

        await logAction('LOGIN', 'Auth', { method: 'firebase' }, user.id);
        console.log('--- LOGIN SUCCESS ---');

        return { success: true };
    } catch (error: any) {
        console.error('Login error:', error);
        // Retorna erro detalhado para debug
        return {
            success: false,
            error: `Falha na autenticação: ${error.message} (Code: ${error.code})`
        };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('hr_session')?.value;

    let redirectPath = '/login';

    if (userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (user?.role === 'EMPLOYEE') {
            redirectPath = '/login/colaborador';
        }
    }

    cookieStore.delete('hr_session');
    redirect(redirectPath);
}

export async function devLoginAction() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Not allowed in production');
    }

    const email = 'admin@dev.local';
    const uid = 'dev-admin-uid';

    let user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                firebaseUid: uid,
                email: email,
                name: 'Dev Admin',
                role: 'ADMIN',
            },
        });
    } else {
        // Ensure user is admin
        if (user.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' },
            });
        }
    }

    const cookieStore = await cookies();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    cookieStore.set('hr_session', user.id, {
        httpOnly: true,
        secure: false, // Always false since this action throws in production
        expires,
        sameSite: 'lax',
        path: '/',
    });

    redirect('/dashboard');
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('hr_session')?.value;

        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roleDef: true }
        });

        return user;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(allowedRoles?: string[]) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    let hasPermission = true;

    if (allowedRoles) {
        hasPermission = allowedRoles.includes(user.role) ||
            (!!user.roleDef && (
                (allowedRoles.includes('ADMIN') && checkAdminAccess(user)) ||
                (allowedRoles.some(r => ['HR_MANAGER', 'HR', 'MANAGER'].includes(r)))
            ));
    }

    if (allowedRoles && !hasPermission) {
        if (user.role === 'EMPLOYEE' && !user.roleDef) {
            redirect('/portal');
        } else {
            redirect('/dashboard');
        }
    }

    return user;
}

// ─────────────────────────────────────────────────────────────
// CPF + PIN Authentication (Employee Portal)
// ─────────────────────────────────────────────────────────────

/** Login do colaborador via CPF + PIN de 6 dígitos. */
export async function cpfPinLoginAction(cpf: string, pin: string) {
    const cleanCpf = cpf.replace(/\D/g, '');

    if (!cleanCpf || !pin) {
        return { success: false, error: 'CPF e PIN são obrigatórios.' };
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { cpf: cleanCpf },
            select: {
                id: true,
                name: true,
                pinHash: true,
                pinMustChange: true,
                failedPinAttempts: true,
                pinLockedUntil: true,
                userId: true,
                user: { select: { id: true, role: true } },
            },
        });

        if (!employee || !employee.pinHash) {
            return { success: false, error: 'CPF ou PIN inválido.' };
        }

        // Check lockout
        if (PinService.isLocked(employee)) {
            const minutes = PinService.minutesUntilUnlock(employee);
            return {
                success: false,
                error: `Conta bloqueada por tentativas incorretas. Tente novamente em ${minutes} minuto(s) ou procure o RH.`,
            };
        }

        // Verify PIN
        const isValid = await PinService.verifyPin(pin, employee.pinHash);

        if (!isValid) {
            const { attemptsLeft, locked } = await PinService.registerFailedAttempt(employee.id);
            if (locked) {
                return {
                    success: false,
                    error: 'Conta bloqueada após 3 tentativas incorretas. Procure o RH para resetar seu PIN.',
                };
            }
            return {
                success: false,
                error: `CPF ou PIN inválido. ${attemptsLeft} tentativa(s) restante(s).`,
            };
        }

        // Login success — reset attempts
        await PinService.resetAttempts(employee.id);

        // Ensure a User record exists for this employee
        let userId = employee.userId;
        if (!userId) {
            const newUser = await prisma.user.create({
                data: {
                    name: employee.name,
                    role: 'EMPLOYEE',
                    employee: { connect: { id: employee.id } },
                },
            });
            userId = newUser.id;
        }

        // Set session cookie (7 days)
        const cookieStore = await cookies();
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        cookieStore.set('hr_session', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        });

        await logAction('LOGIN', 'Auth', { method: 'cpf_pin' }, userId);

        return { success: true, mustChangePin: employee.pinMustChange };
    } catch (error: any) {
        console.error('[cpfPinLoginAction] error:', error);
        return { success: false, error: 'Erro interno ao tentar fazer login.' };
    }
}

/** Troca de PIN do colaborador (requer PIN atual válido). */
export async function changePinAction(employeeId: string, currentPin: string, newPin: string) {
    if (!/^\d{6}$/.test(newPin)) {
        return { success: false, error: 'O novo PIN deve ter exatamente 6 dígitos numéricos.' };
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { pinHash: true, pinLockedUntil: true },
        });

        if (!employee?.pinHash) {
            return { success: false, error: 'Colaborador não encontrado.' };
        }

        if (PinService.isLocked(employee)) {
            return { success: false, error: 'Conta bloqueada. Procure o RH.' };
        }

        const isCurrentValid = await PinService.verifyPin(currentPin, employee.pinHash);
        if (!isCurrentValid) {
            return { success: false, error: 'PIN atual inválido.' };
        }

        const isSamePin = await PinService.verifyPin(newPin, employee.pinHash);
        if (isSamePin) {
            return { success: false, error: 'O novo PIN não pode ser igual ao PIN atual.' };
        }

        const newHash = await PinService.hashPin(newPin);
        await prisma.employee.update({
            where: { id: employeeId },
            data: { pinHash: newHash, pinMustChange: false },
        });

        return { success: true };
    } catch (error: any) {
        console.error('[changePinAction] error:', error);
        return { success: false, error: 'Erro ao trocar o PIN.' };
    }
}

/** Reseta o PIN de um colaborador (uso exclusivo de admin). Retorna o novo PIN em texto claro. */
export async function resetEmployeePinAction(employeeId: string) {
    try {
        // Validate that current session is admin
        const currentUser = await getCurrentUser();
        if (!currentUser || !checkAdminAccess(currentUser)) {
            return { success: false, error: 'Acesso negado.' };
        }

        const { plainPin } = await PinService.resetPin(employeeId);

        await logAction('RESET_PIN', 'Auth', { employeeId }, currentUser.id);

        return { success: true, plainPin };
    } catch (error: any) {
        console.error('[resetEmployeePinAction] error:', error);
        return { success: false, error: 'Erro ao resetar o PIN.' };
    }
}
