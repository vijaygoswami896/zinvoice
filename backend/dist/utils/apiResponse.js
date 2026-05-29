const sendSuccess = (res, { data = null, message = 'Success', status = 200, meta = null } = {}) => {
    const body = {
        success: true,
        message,
        data,
    };
    if (meta)
        body.meta = meta;
    return res.status(status).json(body);
};
const sendPaginated = (res, { items, total, page, limit, message = 'Success' }) => {
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
const sendError = (res, { message = 'Internal server error', status = 500, code = 'INTERNAL_ERROR', details = null } = {}) => {
    const body = {
        success: false,
        error: {
            code,
            message,
        },
    };
    if (details)
        body.error.details = details;
    return res.status(status).json(body);
};
export { sendSuccess, sendPaginated, sendError };
//# sourceMappingURL=apiResponse.js.map