'use strict';

/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {*}      options.data       - Response payload
 * @param {string} [options.message]  - Human-readable message
 * @param {number} [options.status]   - HTTP status code (default 200)
 * @param {object} [options.meta]     - Pagination or extra metadata
 */
const sendSuccess = (res, { data = null, message = 'Success', status = 200, meta = null } = {}) => {
    const body = {
        success: true,
        message,
        data,
    };

    if (meta) body.meta = meta;

    return res.status(status).json(body);
};

/**
 * Sends a paginated list response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {Array}  options.items      - Array of documents
 * @param {number} options.total      - Total document count
 * @param {number} options.page       - Current page (1-indexed)
 * @param {number} options.limit      - Page size
 * @param {string} [options.message]
 */
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

/**
 * Sends an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} options.message    - User-facing error description
 * @param {number} [options.status]   - HTTP status code (default 500)
 * @param {string} [options.code]     - App-level error code
 * @param {*}      [options.details]  - Validation errors or extra info
 */
const sendError = (res, { message = 'Internal server error', status = 500, code = 'INTERNAL_ERROR', details = null } = {}) => {
    const body = {
        success: false,
        error: {
            code,
            message,
        },
    };

    if (details) body.error.details = details;

    return res.status(status).json(body);
};

module.exports = { sendSuccess, sendPaginated, sendError };