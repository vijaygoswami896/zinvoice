import { Response } from 'express';
interface SuccessOptions {
    data?: any;
    message?: string;
    status?: number;
    meta?: Record<string, any> | null;
}
interface PaginatedOptions {
    items: any[];
    total: number;
    page: number;
    limit: number;
    message?: string;
}
interface ErrorOptions {
    message?: string;
    status?: number;
    code?: string;
    details?: any;
}
declare const sendSuccess: (res: Response, { data, message, status, meta }?: SuccessOptions) => Response<any, Record<string, any>>;
declare const sendPaginated: (res: Response, { items, total, page, limit, message }: PaginatedOptions) => Response<any, Record<string, any>>;
declare const sendError: (res: Response, { message, status, code, details }?: ErrorOptions) => Response<any, Record<string, any>>;
export { sendSuccess, sendPaginated, sendError };
