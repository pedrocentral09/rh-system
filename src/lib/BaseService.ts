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
        return { success: false, error, message };
    }
}
