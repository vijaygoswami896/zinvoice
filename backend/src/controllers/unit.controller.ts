import { Request, Response, RequestHandler } from 'express';
import * as unitService from '../services/unit.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import getBusinessId from '../utils/getBusinessId.js';
import type { ListUnitsInput } from '../schemas/unit.schema.js';

export const listUnits: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await unitService.listUnits(
            getBusinessId(req),
            req.query as unknown as ListUnitsInput['query'],
        );
        sendPaginated(res, {
            items: result.items,
            total: result.total,
            page: result.page,
            limit: result.limit,
            message: 'Units retrieved.',
        });
    },
);

export const getUnitById: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const unit = await unitService.getUnit(
            getBusinessId(req),
            req.params.id,
        );
        sendSuccess(res, {
            data: { unit },
            message: 'Unit retrieved.',
        });
    },
);

export const createUnit: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const unit = await unitService.createUnit(
            getBusinessId(req),
            req.user!.id,
            req.body,
        );
        sendSuccess(res, {
            status: 201,
            data: { unit },
            message: 'Unit created.',
        });
    },
);

export const updateUnit: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const unit = await unitService.updateUnit(
            getBusinessId(req),
            req.user!.id,
            req.params.id,
            req.body,
        );
        sendSuccess(res, {
            data: { unit },
            message: 'Unit updated.',
        });
    },
);

export const deleteUnit: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        await unitService.deleteUnit(
            getBusinessId(req),
            req.params.id,
            req.user!.id,
        );
        sendSuccess(res, {
            data: null,
            message: 'Unit deleted.',
        });
    },
);

export const restoreUnit: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const unit = await unitService.restoreUnit(
            getBusinessId(req),
            req.user!.id,
            req.params.id,
        );
        sendSuccess(res, {
            data: { unit },
            message: 'Unit restored.',
        });
    },
);