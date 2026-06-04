import React from 'react';
import {
  Page, View, Text, Image, Document,
} from '@react-pdf/renderer';
import { modernStyles as S } from './pdfStyles';
import {
  fmtCurrency, fmtNum, fmtDate,
  amountInWords, formatAddressLines,
  buildFileUrl, supplyTypeLabel,
} from './pdfUtils';

// ── Table header ──────────────────────────────────────────────────────────────
const TableHeader = ({ isIGST }) => (
  <View style={S.tableHeader}>
    <View style={S.colSn}>
      <Text style={S.headerCellText}>#</Text>
    </View>
    <View style={isIGST ? S.colDescIgst : S.colDesc}>
      <Text style={S.headerCellText}>Item / Description</Text>
    </View>
    <View style={S.colHsn}>
      <Text style={S.headerCellText}>HSN/SAC</Text>
    </View>
    <View style={S.colQty}>
      <Text style={S.headerCellRight}>Qty</Text>
    </View>
    <View style={S.colUnit}>
      <Text style={S.headerCellText}>Unit</Text>
    </View>
    <View style={S.colRate}>
      <Text style={S.headerCellRight}>Rate</Text>
    </View>
    <View style={isIGST ? S.colTaxableIgst : S.colTaxable}>
      <Text style={S.headerCellRight}>Taxable</Text>
    </View>
    <View style={S.colGst}>
      <Text style={S.headerCellRight}>GST%</Text>
    </View>
    {isIGST ? (
      <View style={S.colIgstOnly}>
        <Text style={S.headerCellRight}>IGST</Text>
      </View>
    ) : (
      <>
        <View style={S.colCgst}>
          <Text style={S.headerCellRight}>CGST</Text>
        </View>
        <View style={S.colSgst}>
          <Text style={S.headerCellRight}>SGST</Text>
        </View>
      </>
    )}
    <View style={isIGST ? S.colTotalIgst : S.colTotal}>
      <Text style={S.headerCellRight}>Amount</Text>
    </View>
  </View>
);

// ── Single line item row ──────────────────────────────────────────────────────
const LineRow = ({ item, index, isIGST }) => {
  const rowStyle = index % 2 === 0 ? S.tableRow : S.tableRowAlt;
  return (
    <View style={rowStyle} wrap={false}>
      <View style={S.colSn}>
        <Text style={S.cellText}>{index + 1}</Text>
      </View>
      <View style={isIGST ? S.colDescIgst : S.colDesc}>
        <Text style={S.cellTextBold}>{item.name || ''}</Text>
        {!!item.description && (
          <Text style={[S.cellText, { fontSize: 7, marginTop: 1 }]}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={S.colHsn}>
        <Text style={S.cellText}>{item.hsnSacCode || '-'}</Text>
      </View>
      <View style={S.colQty}>
        <Text style={S.cellTextRight}>{fmtNum(item.quantity)}</Text>
      </View>
      <View style={S.colUnit}>
        <Text style={S.cellText}>{item.unit || 'PCS'}</Text>
      </View>
      <View style={S.colRate}>
        <Text style={S.cellTextRight}>{fmtNum(item.rate)}</Text>
      </View>
      <View style={isIGST ? S.colTaxableIgst : S.colTaxable}>
        <Text style={S.cellTextRight}>{fmtNum(item.taxableAmount)}</Text>
      </View>
      <View style={S.colGst}>
        <Text style={S.cellTextRight}>{item.gstRate}%</Text>
      </View>
      {isIGST ? (
        <View style={S.colIgstOnly}>
          <Text style={S.cellTextRight}>{fmtNum(item.igst)}</Text>
        </View>
      ) : (
        <>
          <View style={S.colCgst}>
            <Text style={S.cellTextRight}>{fmtNum(item.cgst)}</Text>
          </View>
          <View style={S.colSgst}>
            <Text style={S.cellTextRight}>{fmtNum(item.sgst)}</Text>
          </View>
        </>
      )}
      <View style={isIGST ? S.colTotalIgst : S.colTotal}>
        <Text style={S.cellTextRightBold}>{fmtNum(item.lineTotal)}</Text>
      </View>
    </View>
  );
};

// ── Totals block ──────────────────────────────────────────────────────────────
const TotalsBlock = ({ invoice }) => {
  const { subtotal, totalCgst, totalSgst, totalIgst, totalTax, grandTotal, isIGST } = invoice;
  return (
    <View style={S.totalsSection}>
      <View style={S.totalsTable}>
        <View style={S.totalsRow}>
          <Text style={S.totalsLabel}>Subtotal (Taxable)</Text>
          <Text style={S.totalsValue}>{fmtCurrency(subtotal)}</Text>
        </View>
        {isIGST ? (
          <View style={S.totalsRow}>
            <Text style={S.totalsLabel}>IGST</Text>
            <Text style={S.totalsValue}>{fmtCurrency(totalIgst)}</Text>
          </View>
        ) : (
          <>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>CGST</Text>
              <Text style={S.totalsValue}>{fmtCurrency(totalCgst)}</Text>
            </View>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>SGST</Text>
              <Text style={S.totalsValue}>{fmtCurrency(totalSgst)}</Text>
            </View>
          </>
        )}
        <View style={S.totalsRow}>
          <Text style={S.totalsLabel}>Total Tax</Text>
          <Text style={S.totalsValue}>{fmtCurrency(totalTax)}</Text>
        </View>
        <View style={S.totalsRowGrand}>
          <Text style={S.totalsLabelBold}>Grand Total</Text>
          <Text style={S.totalsValueBold}>{fmtCurrency(grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

// ── Bank + signature footer ───────────────────────────────────────────────────
const Footer = ({ settings }) => {
  const bank = settings?.bankDetails ?? {};
  const sigUrl = buildFileUrl(settings?.signature?.url);
  const hasBankDetails = bank.bankName || bank.accountNumber;

  return (
    <View style={S.footer}>
      <View style={S.bankBlock}>
        {hasBankDetails && (
          <>
            <Text style={S.bankLabel}>Payment Details</Text>
            {bank.bankName && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>Bank</Text>
                <Text style={S.bankValue}>{bank.bankName}</Text>
              </View>
            )}
            {bank.accountName && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>A/C Name</Text>
                <Text style={S.bankValue}>{bank.accountName}</Text>
              </View>
            )}
            {bank.accountNumber && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>A/C No</Text>
                <Text style={S.bankValue}>{bank.accountNumber}</Text>
              </View>
            )}
            {bank.ifscCode && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>IFSC</Text>
                <Text style={S.bankValue}>{bank.ifscCode}</Text>
              </View>
            )}
            {bank.upiId && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>UPI ID</Text>
                <Text style={S.bankValue}>{bank.upiId}</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={S.signatureBlock}>
        {sigUrl && (
          <Image style={S.signatureImage} src={sigUrl} />
        )}
        <View style={S.signatureLine} />
        <Text style={S.signatureLabel}>For</Text>
        <Text style={S.signatureNameBold}>
          {settings?.businessName ?? 'Authorised Signatory'}
        </Text>
        <Text style={S.signatureLabel}>Authorised Signatory</Text>
      </View>
    </View>
  );
};

// ── Main document ─────────────────────────────────────────────────────────────
const ModernTemplate = ({ invoice, settings }) => {
  const logoUrl = buildFileUrl(settings?.logo?.url);
  const addr = settings?.address ?? {};
  const sellerAddressParts = [addr.line1, addr.city, addr.state, addr.pincode]
    .filter(Boolean).join(', ');
  const addressLines = formatAddressLines(invoice?.billingAddress);

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Top color band ── */}
        <View style={S.topBand}>
          <View style={S.topBandLeft}>
            <Text style={S.businessName}>{settings?.businessName ?? ''}</Text>
            {settings?.legalName && (
              <Text style={S.businessTagline}>{settings.legalName}</Text>
            )}
            {sellerAddressParts ? (
              <Text style={S.businessAddress}>{sellerAddressParts}</Text>
            ) : null}
            {settings?.phone && (
              <Text style={S.contactLine}>Ph: {settings.phone}</Text>
            )}
            {settings?.email && (
              <Text style={S.contactLine}>{settings.email}</Text>
            )}
            {settings?.gstin && (
              <Text style={S.gstinLine}>GSTIN: {settings.gstin}</Text>
            )}
          </View>
          <View style={S.topBandRight}>
            {logoUrl ? (
              <Image style={S.logo} src={logoUrl} />
            ) : null}
          </View>
        </View>

        {/* ── Identity strip ── */}
        <View style={S.identityStrip}>
          <Text style={S.billTitle}>Tax Invoice</Text>
          <View style={S.identityRight}>
            <Text style={S.invoiceNumber}>{invoice?.invoiceNumber ?? ''}</Text>
            <Text style={S.invoiceDate}>Date: {fmtDate(invoice?.invoiceDate)}</Text>
            {invoice?.dueDate && (
              <Text style={S.dueDate}>Due: {fmtDate(invoice.dueDate)}</Text>
            )}
          </View>
        </View>

        {/* ── Body ── */}
        <View style={S.body}>

          {/* Supply type badge */}
          <View style={S.supplyBadge}>
            <Text style={S.badge}>
              {supplyTypeLabel(invoice?.isIGST)}
            </Text>
            {invoice?.placeOfSupply && (
              <Text style={S.badge}>
                Place of Supply: {invoice.placeOfSupply}
              </Text>
            )}
          </View>

          {/* ── To block ── */}
          <View style={S.metaRow}>
            <View style={S.toBlock}>
              <Text style={S.toLabel}>Bill To</Text>
              <Text style={S.customerName}>{invoice?.customerName ?? ''}</Text>
              {invoice?.customerGstin ? (
                <Text style={S.customerGstin}>GSTIN: {invoice.customerGstin}</Text>
              ) : null}
              {addressLines.map((line, i) => (
                <Text key={i} style={S.customerSub}>{line}</Text>
              ))}
              {invoice?.customerPhone ? (
                <Text style={S.customerSub}>Ph: {invoice.customerPhone}</Text>
              ) : null}
              {invoice?.customerEmail ? (
                <Text style={S.customerSub}>{invoice.customerEmail}</Text>
              ) : null}
            </View>
          </View>

          {/* ── Line items table ── */}
          <View style={S.table}>
            <TableHeader isIGST={invoice?.isIGST} />
            {(invoice?.items ?? []).map((item, i) => (
              <LineRow key={item._id ?? i} item={item} index={i} isIGST={invoice?.isIGST} />
            ))}

            {/* Summary row */}
            <View style={[S.tableRow, { backgroundColor: '#d6e4f0' }]}>
              <View style={S.colSn}><Text /></View>
              <View style={invoice?.isIGST ? S.colDescIgst : S.colDesc}>
                <Text style={S.cellTextBold}>Total</Text>
              </View>
              <View style={S.colHsn}><Text /></View>
              <View style={S.colQty}><Text /></View>
              <View style={S.colUnit}><Text /></View>
              <View style={S.colRate}><Text /></View>
              <View style={invoice?.isIGST ? S.colTaxableIgst : S.colTaxable}>
                <Text style={S.cellTextRightBold}>{fmtNum(invoice?.subtotal)}</Text>
              </View>
              <View style={S.colGst}><Text /></View>
              {invoice?.isIGST ? (
                <View style={S.colIgstOnly}>
                  <Text style={S.cellTextRightBold}>{fmtNum(invoice?.totalIgst)}</Text>
                </View>
              ) : (
                <>
                  <View style={S.colCgst}>
                    <Text style={S.cellTextRightBold}>{fmtNum(invoice?.totalCgst)}</Text>
                  </View>
                  <View style={S.colSgst}>
                    <Text style={S.cellTextRightBold}>{fmtNum(invoice?.totalSgst)}</Text>
                  </View>
                </>
              )}
              <View style={invoice?.isIGST ? S.colTotalIgst : S.colTotal}>
                <Text style={S.cellTextRightBold}>{fmtNum(invoice?.grandTotal)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Totals summary ── */}
        <TotalsBlock invoice={invoice} />

        {/* ── Amount in words ── */}
        <Text style={S.amountWords}>
          Amount in words:{' '}
          <Text style={S.amountWordsBold}>
            {amountInWords(invoice?.grandTotal)}
          </Text>
        </Text>

        {/* ── Notes / Terms ── */}
        {(invoice?.notes || settings?.invoiceNotes) && (
          <View style={S.notesSection}>
            <Text style={S.notesLabel}>Notes</Text>
            <Text style={S.notesText}>
              {invoice?.notes || settings?.invoiceNotes}
            </Text>
          </View>
        )}
        {(invoice?.termsAndConditions || settings?.invoiceTerms) && (
          <View style={S.notesSection}>
            <Text style={S.notesLabel}>Terms &amp; Conditions</Text>
            <Text style={S.notesText}>
              {invoice?.termsAndConditions || settings?.invoiceTerms}
            </Text>
          </View>
        )}

        {/* ── Footer ── */}
        <Footer settings={settings} />

        {/* ── Page number ── */}
        <Text
          style={S.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ModernTemplate;
