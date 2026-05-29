import { ICustomer } from '../models/customer.model.js';
import type { CustomerBody, CustomerListQuery } from '../schemas/customer.schema.server.js';
interface ListResult {
    items: ICustomer[];
    total: number;
    page: number;
    limit: number;
}
/**
 * List customers with pagination, full-text search, and filters.
 */
declare const listCustomers: (businessId: string, query: CustomerListQuery) => Promise<ListResult>;
declare const getCustomer: (businessId: string, customerId: string) => Promise<ICustomer>;
declare const createCustomer: (businessId: string, dto: CustomerBody) => Promise<ICustomer>;
declare const updateCustomer: (businessId: string, customerId: string, dto: Partial<CustomerBody>) => Promise<ICustomer>;
declare const deleteCustomer: (businessId: string, customerId: string, deletedBy: string) => Promise<ICustomer>;
export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
