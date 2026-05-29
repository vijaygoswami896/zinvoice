"use strict";
// import { Request, Response, RequestHandler } from 'express';
// import * as productService from '../services/product.service';
// import { sendSuccess, sendPaginated } from '../utils/apiResponse';
// import asyncHandler from '../utils/asyncHandler';
// import type {
//     ProductListQueryInput,
//     ProductBodyInput,
//     StockAdjustmentInput,
// } from '../schemas/product.schema.server';
// import getBusinessId from '../utils/getBusinessId';
// // ── Controllers ───────────────────────────────────────────────────────────────
// /**
//  * GET /api/v1/products
//  * List with pagination, search, and filters.
//  */
// const listProducts: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     const result = await productService.listProducts(
//         getBusinessId(req),
//         req.query as unknown as ProductListQueryInput,
//     );
//     sendPaginated(res, {
//         items: result.items,
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         message: 'Products retrieved.',
//     });
// });
// /**
//  * GET /api/v1/products/:id
//  */
// const getProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     const product = await productService.getProduct(
//         getBusinessId(req),
//         req.params.id,
//     );
//     sendSuccess(res, { data: { product }, message: 'Product retrieved.' });
// });
// /**
//  * POST /api/v1/products
//  */
// const createProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     const product = await productService.createProduct(
//         getBusinessId(req),
//         req.body as ProductBodyInput,
//     );
//     sendSuccess(res, { data: { product }, message: 'Product created.', status: 201 });
// });
// /**
//  * PUT /api/v1/products/:id
//  */
// const updateProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     const product = await productService.updateProduct(
//         getBusinessId(req),
//         req.params.id,
//         req.body as Partial<ProductBodyInput>,
//     );
//     sendSuccess(res, { data: { product }, message: 'Product updated.' });
// });
// /**
//  * DELETE /api/v1/products/:id
//  * Soft delete — sets deletedAt, does not remove the document.
//  */
// const deleteProduct: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     await productService.deleteProduct(
//         getBusinessId(req),
//         req.params.id,
//         req.user!.id,
//     );
//     sendSuccess(res, { data: null, message: 'Product deleted.' });
// });
// /**
//  * PATCH /api/v1/products/:id/stock
//  * Explicit stock adjustment endpoint (delta-based).
//  */
// const adjustStock: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
//     const { quantity, reason } = req.body as StockAdjustmentInput;
//     const product = await productService.adjustStock(
//         getBusinessId(req),
//         req.params.id,
//         quantity,
//         reason,
//     );
//     sendSuccess(res, {
//         data: { product },
//         message: 'Stock adjusted.',
//     });
// });
// export {
//     listProducts,
//     getProduct,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     adjustStock,
// };
//# sourceMappingURL=product.controller.js.map