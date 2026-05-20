// import { Router } from 'express';
// import * as controller from '../controllers/product.controller';
// import authenticate from '../middleware/authenticate';
// import validate from '../middleware/validate';
// import {
//     ProductBodySchema,
//     ProductListQuerySchema,
//     ProductIdParamSchema,
//     StockAdjustmentSchema,
// } from '../schemas/product.schema.server';

// const router = Router();

// router.use(authenticate);

// router.get(
//     '/',
//     validate({ query: ProductListQuerySchema }),
//     controller.listProducts,
// );

// router.post(
//     '/',
//     validate({ body: ProductBodySchema }),
//     controller.createProduct,
// );

// router.get(
//     '/:id',
//     validate({ params: ProductIdParamSchema }),
//     controller.getProduct,
// );

// router.put(
//     '/:id',
//     validate({ params: ProductIdParamSchema, body: ProductBodySchema }),
//     controller.updateProduct,
// );

// router.delete(
//     '/:id',
//     validate({ params: ProductIdParamSchema }),
//     controller.deleteProduct,
// );

// /**
//  * PATCH /api/v1/products/:id/stock
//  * Used by invoice module and manual stock corrections.
//  */
// router.patch(
//     '/:id/stock',
//     validate({ params: ProductIdParamSchema, body: StockAdjustmentSchema }),
//     controller.adjustStock,
// );

// export default router;