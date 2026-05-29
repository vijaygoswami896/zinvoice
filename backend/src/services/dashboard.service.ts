import mongoose, { Types } from 'mongoose';
import { Invoice } from '../models/invoice.model.js';
import { Customer } from '../models/customer.model.js';
import { Product } from '../models/product.model.js';
import { DashboardQuery, EntityCounts, FinancialYearBounds, GSTSummaryResult, LifetimeRow, MonthlyRevenuePoint, MonthlyRevenueRow, StatusRow, TopCustomerRow } from '../types/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toObjId = (id: string): Types.ObjectId => new Types.ObjectId(String(id));
const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

// ── Financial year helper ─────────────────────────────────────────────────────

const getFinancialYearBounds = (date: Date = new Date()): FinancialYearBounds => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const fyStart = month >= 4 ? year : year - 1;
    return {
        from: new Date(`${fyStart}-04-01T00:00:00.000Z`),
        to: new Date(`${fyStart + 1}-03-31T23:59:59.999Z`),
        label: `${fyStart}-${String(fyStart + 1).slice(-2)}`,
    };
};

// ── Summary cards ─────────────────────────────────────────────────────────────

const getInvoiceSummary = async (businessId: string) => {
    const bId = toObjId(businessId);
    const fy = getFinancialYearBounds();

    const [fyResult, lifetimeResult, overdueCount] = await Promise.all([

        Invoice.aggregate<StatusRow>([
            {
                $match: {
                    businessId: bId,
                    deletedAt: null,
                    invoiceDate: { $gte: fy.from, $lte: fy.to },
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$grandTotal' },
                    totalTax: { $sum: '$totalTax' },
                    totalCgst: { $sum: '$totalCgst' },
                    totalSgst: { $sum: '$totalSgst' },
                    totalIgst: { $sum: '$totalIgst' },
                },
            },
        ]),

        Invoice.aggregate<LifetimeRow>([
            {
                $match: { businessId: bId, deletedAt: null },
            },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalRevenue: { $sum: '$grandTotal' },
                    totalGST: { $sum: '$totalTax' },
                },
            },
        ]),

        Invoice.countDocuments({
            businessId: bId,
            deletedAt: null,
            status: { $in: ['sent', 'draft'] },
            dueDate: { $lt: new Date(), $exists: true },
        }),
    ]);

    const byStatus = fyResult.reduce<Record<string, StatusRow>>((acc, row) => {
        acc[row._id] = row;
        return acc;
    }, {});

    const lifetime: LifetimeRow = lifetimeResult[0] ?? { totalInvoices: 0, totalRevenue: 0, totalGST: 0 };

    const s = (key: string, field: keyof StatusRow): number =>
        round2((byStatus[key]?.[field] as number | undefined) ?? 0);

    return {
        financialYear: fy.label,

        fy: {
            draft: { count: byStatus['draft']?.count ?? 0, value: s('draft', 'totalValue') },
            sent: { count: byStatus['sent']?.count ?? 0, value: s('sent', 'totalValue') },
            paid: { count: byStatus['paid']?.count ?? 0, value: s('paid', 'totalValue') },
            cancelled: { count: byStatus['cancelled']?.count ?? 0, value: s('cancelled', 'totalValue') },

            totalInvoices: fyResult.reduce((sum, r) => sum + r.count, 0),
            totalRevenue: round2(fyResult.reduce((sum, r) => sum + r.totalValue, 0)),
            totalTax: round2(fyResult.reduce((sum, r) => sum + r.totalTax, 0)),
            totalCgst: round2(fyResult.reduce((sum, r) => sum + r.totalCgst, 0)),
            totalSgst: round2(fyResult.reduce((sum, r) => sum + r.totalSgst, 0)),
            totalIgst: round2(fyResult.reduce((sum, r) => sum + r.totalIgst, 0)),
        },

        lifetime: {
            totalInvoices: lifetime.totalInvoices,
            totalRevenue: round2(lifetime.totalRevenue),
            totalGST: round2(lifetime.totalGST),
        },

        overdueCount,
    };
};

// ── Monthly revenue chart ─────────────────────────────────────────────────────

const getMonthlyRevenue = async (
    businessId: string,
    months: number = 12,
): Promise<MonthlyRevenuePoint[]> => {
    const bId = toObjId(businessId);
    const from = new Date();
    from.setMonth(from.getMonth() - months + 1);
    from.setDate(1);
    from.setHours(0, 0, 0, 0);

    const rows = await Invoice.aggregate<MonthlyRevenueRow>([
        {
            $match: {
                businessId: bId,
                deletedAt: null,
                status: { $in: ['paid', 'sent'] },
                invoiceDate: { $gte: from },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' },
                },
                revenue: { $sum: '$grandTotal' },
                gstCollected: { $sum: '$totalTax' },
                invoiceCount: { $sum: 1 },
                paidRevenue: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'paid'] }, '$grandTotal', 0],
                    },
                },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: MonthlyRevenuePoint[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const row = rows.find((r) => r._id.year === year && r._id.month === month);

        result.push({
            label: `${MONTH_NAMES[month - 1]} ${String(year).slice(-2)}`,
            month,
            year,
            revenue: round2(row?.revenue ?? 0),
            gstCollected: round2(row?.gstCollected ?? 0),
            paidRevenue: round2(row?.paidRevenue ?? 0),
            invoiceCount: row?.invoiceCount ?? 0,
        });
    }

    return result;
};

// ── GST breakdown ─────────────────────────────────────────────────────────────

const getGSTSummary = async (businessId: string): Promise<GSTSummaryResult> => {
    const bId = toObjId(businessId);
    const fy = getFinancialYearBounds();

    const [result] = await Invoice.aggregate<Omit<GSTSummaryResult, 'financialYear'>>([
        {
            $match: {
                businessId: bId,
                deletedAt: null,
                status: { $in: ['paid', 'sent'] },
                invoiceDate: { $gte: fy.from, $lte: fy.to },
            },
        },
        {
            $group: {
                _id: null,
                totalCgst: { $sum: '$totalCgst' },
                totalSgst: { $sum: '$totalSgst' },
                totalIgst: { $sum: '$totalIgst' },
                totalTax: { $sum: '$totalTax' },
                totalRevenue: { $sum: '$grandTotal' },
                intraState: { $sum: { $cond: ['$isIGST', 0, 1] } },
                interState: { $sum: { $cond: ['$isIGST', 1, 0] } },
            },
        },
    ]);

    if (!result) {
        return {
            totalCgst: 0, totalSgst: 0, totalIgst: 0,
            totalTax: 0, totalRevenue: 0, intraState: 0, interState: 0,
            financialYear: fy.label,
        };
    }

    return {
        totalCgst: round2(result.totalCgst),
        totalSgst: round2(result.totalSgst),
        totalIgst: round2(result.totalIgst),
        totalTax: round2(result.totalTax),
        totalRevenue: round2(result.totalRevenue),
        intraState: result.intraState,
        interState: result.interState,
        financialYear: fy.label,
    };
};

// ── Recent invoices ───────────────────────────────────────────────────────────

const getRecentInvoices = async (businessId: string, limit: number = 8) => {
    return Invoice.find({ businessId: toObjId(businessId), deletedAt: null })
        .select('invoiceNumber customerName invoiceDate dueDate status grandTotal totalTax isIGST')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

// ── Top customers ─────────────────────────────────────────────────────────────

const getTopCustomers = async (
    businessId: string,
    limit: number = 5,
): Promise<TopCustomerRow[]> => {
    const bId = toObjId(businessId);
    const fy = getFinancialYearBounds();

    return Invoice.aggregate<TopCustomerRow>([
        {
            $match: {
                businessId: bId,
                deletedAt: null,
                status: { $in: ['paid', 'sent'] },
                invoiceDate: { $gte: fy.from, $lte: fy.to },
            },
        },
        {
            $group: {
                _id: '$customerId',
                customerName: { $first: '$customerName' },
                totalValue: { $sum: '$grandTotal' },
                invoiceCount: { $sum: 1 },
            },
        },
        { $sort: { totalValue: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                customerName: 1,
                totalValue: { $round: ['$totalValue', 2] },
                invoiceCount: 1,
            },
        },
    ]);
};

// ── Quick counts ──────────────────────────────────────────────────────────────

const getEntityCounts = async (businessId: string): Promise<EntityCounts> => {
    const bId = toObjId(businessId);

    const [customers, products, lowStock] = await Promise.all([
        Customer.countDocuments({ businessId: bId, deletedAt: null }),
        Product.countDocuments({ businessId: bId, deletedAt: null }),
        Product.countDocuments({
            businessId: bId,
            deletedAt: null,
            inventoryEnabled: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
        }),
    ]);

    return { customers, products, lowStock };
};

// ── Full dashboard payload ────────────────────────────────────────────────────

const getDashboardData = async (businessId: string, query: DashboardQuery = {}) => {
    const { revenueMonths = 12 } = query;

    const [summary, monthlyRevenue, gstSummary, recentInvoices, topCustomers, entityCounts] =
        await Promise.all([
            getInvoiceSummary(businessId),
            getMonthlyRevenue(businessId, Number(revenueMonths)),
            getGSTSummary(businessId),
            getRecentInvoices(businessId),
            getTopCustomers(businessId),
            getEntityCounts(businessId),
        ]);

    return { summary, monthlyRevenue, gstSummary, recentInvoices, topCustomers, entityCounts };
};

export {
    getDashboardData,
    getInvoiceSummary,
    getMonthlyRevenue,
    getGSTSummary,
    getRecentInvoices,
    getTopCustomers,
    getEntityCounts,
};