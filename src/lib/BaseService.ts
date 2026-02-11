export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: any;
    message?: string;
}

export class BaseService {
    protected static success<T>(data: T, message?: string): ServiceResult<T> {
        return { success: true, data, message };
    }

    protected static error(error: any, message: string): ServiceResult<any> {
        console.error(`[Service Error]: ${message}`, error);

        // Ensure error is serializable for Next.js Server Actions
        let safeError = error;
        if (error instanceof Error) {
            safeError = { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined };
        } else if (typeof error !== 'object' || error === null) {
            safeError = { message: String(error) };
        } else {
            // Try to serialize complex objects or extract just the message
            try {
                safeError = JSON.parse(JSON.stringify(error));
            } catch (e) {
                safeError = { message: 'Unknown non-serializable error' };
            }
        }

        return { success: false, error: safeError, message };
    }
}
