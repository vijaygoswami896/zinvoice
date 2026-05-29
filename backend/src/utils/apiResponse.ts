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

const sendSuccess = (res: Response, { data = null, message = 'Success', status = 200, meta = null }: SuccessOptions = {}) => {
    const body: Record<string, any> = {
        success: true,
        message,
        data,
    };

    if (meta) body.meta = meta;

    return res.status(status).json(body);
};

const sendPaginated = (res: Response, { items, total, page, limit, message = 'Success' }: PaginatedOptions) => {
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, {
        data: items,
        message,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};

const sendError = (res: Response, { message = 'Internal server error', status = 500, code = 'INTERNAL_ERROR', details = null }: ErrorOptions = {}) => {
    const body: Record<string, any> = {
        success: false,
        error: {
            code,
            message,
        },
    };

    if (details) body.error.details = details;

    return res.status(status).json(body);
};

export { sendSuccess, sendPaginated, sendError };