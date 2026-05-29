import fs from 'node:fs';
import path from 'node:path';

import Handlebars, {
    type HelperOptions,
    type TemplateDelegate,
} from 'handlebars';

import puppeteer, { type Browser } from 'puppeteer';

import logger from '../middleware/logger.js';

// ── Template loading ──────────────────────────────────────────────────────────

const TEMPLATE_PATH = path.join(
    process.cwd(),
    '/templates/invoice.html',
);

// Compile once at startup — Handlebars compilation is expensive
let compiledTemplate: TemplateDelegate | null = null;

const getTemplate = (): TemplateDelegate => {
    if (!compiledTemplate) {
        const source = fs.readFileSync(
            TEMPLATE_PATH,
            'utf8',
        );

        compiledTemplate = Handlebars.compile(source);

        logger.info({
            msg: 'Invoice HTML template compiled',
        });
    }

    return compiledTemplate;
};

// ── Handlebars helpers ────────────────────────────────────────────────────────

Handlebars.registerHelper(
    'formatNum',
    (n: unknown): string => {
        if (n == null || Number.isNaN(Number(n))) {
            return '0.00';
        }

        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(n));
    },
);

Handlebars.registerHelper(
    'addOne',
    (index: number): number => index + 1,
);

Handlebars.registerHelper(
    'ifEquals',
    function (
        this: unknown,
        a: unknown,
        b: unknown,
        options: HelperOptions,
    ) {
        return a === b
            ? options.fn(this)
            : options.inverse(this);
    },
);

// ── Address formatter ─────────────────────────────────────────────────────────

const formatAddress = (
    addr?: Record<string, unknown>,
): string => {
    if (!addr) {
        return '';
    }

    return [
        addr.line1,
        addr.line2,
        addr.city,
        addr.state,
        addr.pincode,
        addr.country,
    ]
        .filter(Boolean)
        .join(', ');
};

// ── Date formatter ────────────────────────────────────────────────────────────

const formatDate = (
    d?: string | Date,
): string => {
    if (!d) {
        return '';
    }

    return new Date(d).toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        },
    );
};

// ── Amount in words ───────────────────────────────────────────────────────────

const ONES = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
];

const TENS = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
];

const belowHundred = (n: number): string =>
    n < 20
        ? ONES[n]
        : TENS[Math.floor(n / 10)] +
        (n % 10
            ? ` ${ONES[n % 10]} `
            : '');

const belowThousand = (
    n: number,
): string =>
    n < 100
        ? belowHundred(n)
        : ONES[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100
            ? ` ${belowHundred(n % 100)} `
            : '');

const amountInWords = (
    amount: number,
): string => {
    if (!amount || Number.isNaN(amount)) {
        return 'Rupees Zero Only';
    }

    const rupees = Math.floor(
        Math.abs(amount),
    );

    const paise = Math.round(
        (Math.abs(amount) - rupees) * 100,
    );

    const convert = (n: number): string => {
        if (n === 0) {
            return '';
        }

        const crore = Math.floor(
            n / 10_000_000,
        );

        const lakh = Math.floor(
            (n % 10_000_000) / 100_000,
        );

        const thou = Math.floor(
            (n % 100_000) / 1_000,
        );

        const rest = n % 1_000;

        const parts: string[] = [];

        if (crore) {
            parts.push(
                `${belowThousand(crore)} Crore`,
            );
        }

        if (lakh) {
            parts.push(
                `${belowThousand(lakh)} Lakh`,
            );
        }

        if (thou) {
            parts.push(
                `${belowThousand(thou)} Thousand`,
            );
        }

        if (rest) {
            parts.push(
                belowThousand(rest),
            );
        }

        return parts.join(' ');
    };

    let result = `Rupees ${convert(rupees) || 'Zero'
        } `;

    if (paise > 0) {
        result += ` and ${belowHundred(
            paise,
        )
            } Paise`;
    }

    return `${result} Only`;
};

// ── Build template data ──────────────────────────────────────────────────────

const buildTemplateData = (
    invoice: any,
    settings: any,
    options: {
        isPreview?: boolean;
    } = {},
) => {
    const { isPreview = false } =
        options;

    const inv = invoice.toObject
        ? invoice.toObject()
        : invoice;

    const set = settings?.toObject
        ? settings.toObject()
        : (settings ?? {});

    const addr = set.address ?? {};
    const bank = set.bankDetails ?? {};

    const seller = {
        businessName:
            set.businessName ?? '',

        legalName:
            set.legalName ?? '',

        gstin:
            set.gstin ?? '',

        stateCode:
            set.stateCode ?? '',

        email:
            set.email ?? '',

        phone:
            set.phone ?? '',

        website:
            set.website ?? '',

        address:
            formatAddress(addr),

        logoUrl:
            set.logo?.url ?? null,

        signatureUrl:
            set.signature?.url ?? null,

        bankDetails: {
            bankName:
                bank.bankName ?? '',

            accountName:
                bank.accountName ?? '',

            accountNumber:
                bank.accountNumber ?? '',

            ifscCode:
                bank.ifscCode ?? '',

            branch:
                bank.branch ?? '',

            upiId:
                bank.upiId ?? '',
        },
    };

    const billing =
        inv.billingAddress ?? {};

    const shipping =
        inv.shippingAddress ?? {};

    const billingStr =
        formatAddress(billing);

    const shippingStr =
        formatAddress(shipping);

    const showShipping =
        shippingStr &&
        shippingStr !== billingStr;

    const customer = {
        name:
            inv.customerName ?? '',

        gstin:
            inv.customerGstin ?? '',

        email:
            inv.customerEmail ?? '',

        phone:
            inv.customerPhone ?? '',

        billingAddress:
            billingStr,

        shippingAddress:
            shippingStr,
    };

    const isIGST = Boolean(
        inv.isIGST,
    );

    const supplyType = isIGST
        ? 'Inter-State'
        : 'Intra-State';

    const taxType = isIGST
        ? 'IGST'
        : 'CGST + SGST';

    const stateCodeMap: Record<
        string,
        string
    > = {
        '24': 'Gujarat',
        '27': 'Maharashtra',
        '29': 'Karnataka',
        '33': 'Tamil Nadu',
    };

    const placeOfSupplyName =
        inv.placeOfSupply
            ? `${stateCodeMap[
            inv.placeOfSupply
            ] ??
            inv.placeOfSupply
            } (${inv.placeOfSupply})`
            : '—';

    const items = (
        inv.items ?? []
    ).map((item: any) => ({
        name:
            item.name ?? '',

        description:
            item.description ?? '',

        hsnSacCode:
            item.hsnSacCode ?? '',

        unit:
            item.unit ?? '',

        quantity:
            item.quantity,

        rate:
            item.rate,

        discountPct:
            item.discountPct ?? 0,

        taxableAmount:
            item.taxableAmount,

        gstRate:
            item.gstRate,

        cgst:
            item.cgst,

        sgst:
            item.sgst,

        igst:
            item.igst,

        gstAmount:
            item.cgst +
            item.sgst +
            item.igst,

        lineTotal:
            item.lineTotal,
    }));

    const hasDiscount =
        items.some(
            (i: any) =>
                i.discountPct > 0,
        );

    const grandTotal =
        inv.grandTotal ?? 0;

    return {
        isPreview,

        invoiceNumber:
            inv.invoiceNumber ?? '',

        invoiceDate:
            formatDate(
                inv.invoiceDate,
            ),

        dueDate:
            inv.dueDate
                ? formatDate(
                    inv.dueDate,
                )
                : '',

        financialYear:
            inv.financialYear ?? '',

        status:
            inv.status ?? 'draft',

        seller,
        customer,

        showShipping,

        isIGST,
        supplyType,
        taxType,

        placeOfSupply:
            placeOfSupplyName,

        items,
        hasDiscount,

        subtotal:
            inv.subtotal ?? 0,

        totalCgst:
            inv.totalCgst ?? 0,

        totalSgst:
            inv.totalSgst ?? 0,

        totalIgst:
            inv.totalIgst ?? 0,

        totalTax:
            inv.totalTax ?? 0,

        grandTotal,

        amountInWords:
            amountInWords(
                grandTotal,
            ),

        notes:
            inv.notes ?? '',

        termsAndConditions:
            inv.termsAndConditions ??
            '',

        generatedAt:
            new Date().toLocaleString(
                'en-IN',
                {
                    timeZone:
                        'Asia/Kolkata',
                },
            ),
    };
};

// ── Puppeteer browser pool ────────────────────────────────────────────────────

let browser: Browser | null =
    null;

const getBrowser =
    async (): Promise<Browser> => {
        if (
            !browser ||
            !browser.connected
        ) {
            browser =
                await puppeteer.launch({
                    headless: true,

                    executablePath:
                        process.env.PUPPETEER_EXECUTABLE_PATH ||
                        await puppeteer.executablePath(),

                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--font-render-hinting=none',
                    ],
                });

            logger.info({
                msg: 'Puppeteer browser launched',
            });

            browser.on(
                'disconnected',
                () => {
                    browser = null;

                    logger.warn({
                        msg: 'Puppeteer browser disconnected',
                    });
                },
            );
        }

        return browser;
    };

// ── Render HTML ───────────────────────────────────────────────────────────────

const renderInvoiceHTML = (
    invoice: any,
    settings: any,
    options = {},
): string => {
    const data =
        buildTemplateData(
            invoice,
            settings,
            options,
        );

    const template =
        getTemplate();

    return template(data);
};

// ── Generate PDF buffer ───────────────────────────────────────────────────────

const generatePDFBuffer =
    async (
        invoice: any,
        settings: any,
    ): Promise<Buffer> => {
        const html =
            renderInvoiceHTML(
                invoice,
                settings,
                {
                    isPreview: false,
                },
            );

        const browser =
            await getBrowser();

        const page =
            await browser.newPage();

        try {
            await page.setContent(
                html,
                {
                    waitUntil:
                        'load',
                },
            );

            // Ensure web fonts are loaded before rendering
            await page.evaluateHandle(
                'document.fonts.ready',
            );

            const pdfBuffer =
                await page.pdf({
                    format: 'A4',

                    printBackground:
                        true,

                    margin: {
                        top: '0',
                        right: '0',
                        bottom: '0',
                        left: '0',
                    },

                    preferCSSPageSize:
                        true,
                });

            logger.info({
                msg: 'PDF generated',

                invoiceNumber:
                    invoice.invoiceNumber ??
                    invoice._id,

                size: `${Math.round(
                    pdfBuffer.length /
                    1024,
                )
                    } KB`,
            });

            return Buffer.from(
                pdfBuffer,
            );
        } finally {
            await page.close();
        }
    };

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const closeBrowser =
    async (): Promise<void> => {
        if (browser) {
            await browser.close();

            browser = null;

            logger.info({
                msg: 'Puppeteer browser closed',
            });
        }
    };

process.on(
    'SIGTERM',
    () => {
        void closeBrowser();
    },
);

process.on(
    'SIGINT',
    () => {
        void closeBrowser();
    },
);

export {
    generatePDFBuffer,
    renderInvoiceHTML,
    buildTemplateData,
    closeBrowser,
};
