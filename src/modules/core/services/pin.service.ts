import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 30;

export class PinService {
    /** Generates a random 6-digit PIN as a string (zero-padded). */
    static generatePin(): string {
        const pin = Math.floor(100000 + Math.random() * 900000);
        return pin.toString();
    }

    /** Hashes a PIN using bcrypt. */
    static async hashPin(pin: string): Promise<string> {
        return bcrypt.hash(pin, SALT_ROUNDS);
    }

    /** Compares a plain PIN against a stored hash. */
    static async verifyPin(pin: string, hash: string): Promise<boolean> {
        return bcrypt.compare(pin, hash);
    }

    /** Returns true if the account is currently locked. */
    static isLocked(employee: { pinLockedUntil: Date | null }): boolean {
        if (!employee.pinLockedUntil) return false;
        return employee.pinLockedUntil > new Date();
    }

    /** Increments failed attempts and locks after MAX_FAILED_ATTEMPTS. */
    static async registerFailedAttempt(employeeId: string): Promise<{ attemptsLeft: number; locked: boolean }> {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { failedPinAttempts: true },
        });

        const currentAttempts = (employee?.failedPinAttempts ?? 0) + 1;
        const shouldLock = currentAttempts >= MAX_FAILED_ATTEMPTS;

        await prisma.employee.update({
            where: { id: employeeId },
            data: {
                failedPinAttempts: currentAttempts,
                ...(shouldLock && {
                    pinLockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000),
                }),
            },
        });

        return {
            attemptsLeft: shouldLock ? 0 : MAX_FAILED_ATTEMPTS - currentAttempts,
            locked: shouldLock,
        };
    }

    /** Resets failed attempts and removes lock after a successful login. */
    static async resetAttempts(employeeId: string): Promise<void> {
        await prisma.employee.update({
            where: { id: employeeId },
            data: {
                failedPinAttempts: 0,
                pinLockedUntil: null,
            },
        });
    }

    /** Fully resets a PIN: generates new one, hashes, sets pinMustChange=true, clears lock. */
    static async resetPin(employeeId: string): Promise<{ plainPin: string }> {
        const plainPin = PinService.generatePin();
        const pinHash = await PinService.hashPin(plainPin);

        await prisma.employee.update({
            where: { id: employeeId },
            data: {
                pinHash,
                pinMustChange: true,
                failedPinAttempts: 0,
                pinLockedUntil: null,
            },
        });

        return { plainPin };
    }

    /** Returns remaining minutes until lockout expires (0 if not locked or already expired). */
    static minutesUntilUnlock(employee: { pinLockedUntil: Date | null }): number {
        if (!employee.pinLockedUntil) return 0;
        const diff = employee.pinLockedUntil.getTime() - Date.now();
        return diff > 0 ? Math.ceil(diff / 60000) : 0;
    }
}
