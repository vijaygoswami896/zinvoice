import { Router } from 'express';
import * as controller from '../controllers/customer.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { CustomerBodySchema, CustomerListQuerySchema, CustomerIdParamSchema, } from '../schemas/customer.schema.server.js';
const router = Router();
router.use(authenticate);
router.get('/', validate({ query: CustomerListQuerySchema }), controller.listCustomers);
router.post('/', validate({ body: CustomerBodySchema }), controller.createCustomer);
router.get('/:id', validate({ params: CustomerIdParamSchema }), controller.getCustomer);
router.put('/:id', validate({ params: CustomerIdParamSchema, body: CustomerBodySchema }), controller.updateCustomer);
router.delete('/:id', validate({ params: CustomerIdParamSchema }), controller.deleteCustomer);
export default router;
//# sourceMappingURL=customer.routes.js.map