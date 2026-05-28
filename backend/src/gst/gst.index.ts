/**
 * GST Engine — Public API
 *
 * Import everything from this single entry point:
 *
 *   import { computeInvoice, validateGSTIN, VALID_GST_RATES } from './gst.js';
 *
 * Never import directly from internal modules — the internal structure
 * may change between versions without notice.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export {
    VALID_GST_RATES,
    GST_TYPES,
    SUPPLY_TYPES,
    ITEM_TYPES,
    STATE_CODE_MAP,
    VALID_STATE_CODES,
    INDIAN_STATES,
    GSTIN_REGEX,
    UNIT_CODES,
    VALID_UNIT_CODES,
    getFinancialYear,
} from './gstConstants.js';

// ── Validators ────────────────────────────────────────────────────────────────

export {
    validateGSTIN,
    validateStateCode,
    extractStateCodeFromGSTIN,
    validateGSTRate,
    validateLineItem,
    validateInvoiceInput,
    requiresGSTIN,
    isZeroRated,
} from './gstValidator.js';

// ── Utilities ─────────────────────────────────────────────────────────────────

export {
    round2,
    roundRupee,
    splitGSTRate,
    extractTaxableFromInclusive,
    addGSTToExclusive,
    extractGSTFromInclusive,
    calculateGSTOnExclusive,
    applyDiscount,
    calculateDiscountAmount,
    determinePlaceOfSupply,
    amountInWords,
    formatINR,
} from './gstUtils.js';

// ── Tax calculation service ───────────────────────────────────────────────────

export {
    computeLineItem,
    aggregateTotals,
    buildHSNSummary,
    buildTaxRateSummary,
    computeInvoice,
    computeNonGSTInvoice,
} from './taxCalculationService.js';