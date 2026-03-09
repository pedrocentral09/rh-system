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

        // Always return error as a STRING so toast.error(result.error) never
        // passes an object to React (which would crash with "Objects are not
        // valid as a React child").
        let safeError: string;
        if (error instanceof Error) {
            safeError = error.message;
        } else if (typeof error === 'string') {
            safeError = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
            safeError = String(error.message);
        } else {
            safeError = message || 'Erro desconhecido';
        }

        return { success: false, error: safeError, message };
    }
}
