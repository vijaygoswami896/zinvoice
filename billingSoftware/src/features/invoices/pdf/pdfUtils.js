// ── Formatters ────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian currency string.
 * e.g. 1848080 → "₹18,48,080.00"
 */
export const fmtCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with 2 decimal places (no currency symbol).
 * Used inside table cells where the ₹ is in the column header.
 */
export const fmtNum = (n) => {
  if (n == null || isNaN(n)) return '0.00';
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a Date or ISO string as "28/03/2026"
 */
export const fmtDate = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ── Amount in words ───────────────────────────────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const belowThousand = (n) => {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + belowThousand(n % 100) : '');
};

/**
 * Convert a number to Indian words.
 * e.g. 1848080 → "Eighteen Lakh Forty-Eight Thousand Eighty"
 */
export const amountInWords = (amount) => {
  if (!amount || isNaN(amount)) return 'Zero Rupees Only';

  const [rupees, paise] = Math.abs(amount).toFixed(2).split('.').map(Number);

  const parts = [];
  const cr = Math.floor(rupees / 10000000);
  const lk = Math.floor((rupees % 10000000) / 100000);
  const th = Math.floor((rupees % 100000) / 1000);
  const re = rupees % 1000;

  if (cr) parts.push(belowThousand(cr) + ' Crore');
  if (lk) parts.push(belowThousand(lk) + ' Lakh');
  if (th) parts.push(belowThousand(th) + ' Thousand');
  if (re) parts.push(belowThousand(re));

  let result = (parts.join(' ') || 'Zero') + ' Rupees';
  if (paise) result += ' and ' + belowThousand(paise) + ' Paise';
  result += ' Only';
  return result;
};

// ── Address formatting ────────────────────────────────────────────────────────

/**
 * Render a billing/shipping address object as a compact string array.
 * Each non-empty part becomes its own line in the PDF.
 */
export const formatAddressLines = (address) => {

  if (!address) return [];
  const { line1, line2, city, state, pincode, country } = address;
  const lines = [];
  if (line1) lines.push(line1);
  if (line2) lines.push(line2);
  // const cityState = [city, state].filter(Boolean).join(', ');
  // if (cityState) lines.push(cityState);
  // const pinCountry = [pincode, country].filter(Boolean).join(' - ');
  // if (pinCountry) lines.push(pinCountry);
  return lines;
};

// ── Image URL builder ─────────────────────────────────────────────────────────

/**
 * Build the full public URL for a logo or signature stored locally.
 *
 * settings.logo.url is stored as "/uploads/logos/filename.png"
 * VITE_API_BASE_URL is e.g. "http://localhost:5000" or "https://yourapp.onrender.com"
 *
 * react-pdf's <Image> needs a complete URL, not a relative path.
 */
export const buildFileUrl = (relativePath) => {
  if (!relativePath) return null;
  // If it's already an absolute URL, return as-is
  if (relativePath.startsWith('http')) return relativePath;
  const base = import.meta.env.VITE_API_STATIC_URL ?? '';
  return `${base}${relativePath}`;
};

// ── GST label helpers ─────────────────────────────────────────────────────────

export const gstRateLabel = (rate) => `${rate}%`;

export const supplyTypeLabel = (isIGST) => isIGST ? 'Inter-state Supply (IGST)' : 'Intra-state Supply (CGST + SGST)';

export const calculateDiscAmount = (discPct, rate, qty) => {
  const subTotal = rate * qty;
  const discAmt = (subTotal * discPct) / 100;
  // return parseFloat(discAmt.toFixed(2));
  return discAmt.toFixed(2);
}

export const calculateDiscTotalAmount = (invoice) => {
  if (!invoice?.items) return 0;

  const discTotalAmt = invoice.items.reduce((accumulator, item) => {
    const { quantity, rate, discountPct } = item;

    const itemSubTotal = rate * quantity;
    const itemDiscountAmount = (itemSubTotal * discountPct) / 100;

    // 3. Accumulate the values safely
    return accumulator + itemDiscountAmount;
  }, 0);

  // Return as a clean number bounded to 2 decimal places
  // return parseFloat(discTotalAmt.toFixed(2))
  return discTotalAmt.toFixed(2)
}