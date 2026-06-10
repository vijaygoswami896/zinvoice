import React from 'react';
import { Page, View, Text, Image, Document } from '@react-pdf/renderer';

import { classicStyles as S } from '../pdfStyles';
import {
  fmtCurrency, fmtNum, fmtDate,
  amountInWords, formatAddressLines,
  buildFileUrl, supplyTypeLabel,
  calculateDiscAmount,
  calculateDiscTotalAmount,
} from '../pdfUtils';

// ── Shared sub-components ─────────────────────────────────────────────────────

const Divider = () => <View style={S.divider} />;
const ThinDivider = () => <View style={S.thinDivider} />;

// ── Table header — switches between CGST/SGST and IGST column sets ────────────
const TableHeader = ({ isIGST, showGst }) => (
  <View style={S.tableHeader} fixed>
    <View style={showGst ? S.colSn : S.colSnNoGst}>
      <Text style={S.headerCellCenter}>S.N.</Text>
    </View>
    <View style={showGst ? (isIGST ? S.colDescIgst : S.colDesc) : S.colDescNoGst}>
      <Text style={S.headerCellText}>Description</Text>
    </View>

    {showGst && (
      <>
        <View style={S.colHsn}>
          <Text style={S.headerCellText}>HSN/SAC</Text>
        </View>
      </>
    )}

    <View style={showGst ? S.colQty : S.colQtyNoGst}>
      <Text style={S.headerCellRight}>Qty.</Text>
    </View>
    {/* <View style={showGst ? S.colUnit : S.colUnitNoGst}>
      <Text style={S.headerCellCenter}>Unit</Text>
    </View> */}
    <View style={showGst ? S.colRate : S.colRateNoGst}>
      <Text style={S.headerCellRight}>Rate (₹)</Text>
    </View>
    <View style={S.colDiscPct}>
      <Text style={S.headerCellRight}>Disc%</Text>
    </View>
    <View style={S.colDiscAmt}>
      <Text style={S.headerCellRight}>Disc (₹)</Text>
    </View>
    <View style={showGst ? (isIGST ? S.colTaxableIgst : S.colTaxable) : S.colTotalNoGst}>
      <Text style={S.headerCellRight}> {showGst ? 'Taxable (₹)' : 'Total (₹)'}</Text>
    </View>

    {showGst && (
      <>
        <View style={S.colGst}>
          <Text style={S.headerCellRight}>GST%</Text>
        </View>

        {isIGST ? (
          <View style={S.colIgstOnly}><Text style={S.headerCellRight}>IGST (₹)</Text></View>
        ) : (
          <>
            <View style={S.colCgst}><Text style={S.headerCellRight}>CGST (₹)</Text></View>
            <View style={S.colSgst}><Text style={S.headerCellRight}>SGST (₹)</Text></View>
          </>
        )}
        <View style={isIGST ? S.colTotalIgst : S.colTotal}>
          <Text style={S.headerCellRight}>Total (₹)</Text>
        </View>
      </>
    )}

  </View>
);

// ── Single line item row ──────────────────────────────────────────────────────
const LineRow = ({ item, index, isIGST, showGst }) => {
  const rowStyle = index % 2 === 0 ? S.tableRow : S.tableRowAlt;
  return (
    <View style={rowStyle} wrap={false}>
      <View style={showGst ? S.colSn : S.colSnNoGst}>
        <Text style={S.cellTextCenter}>{index + 1}.</Text>
      </View>
      <View style={!showGst ? S.colDescNoGst : isIGST ? S.colDescIgst : S.colDesc}>
        <Text style={S.cellText}>{item.name || ''}</Text>
        {!!item.description && (
          <Text style={[S.cellText, { fontSize: 7, marginTop: 1 }]}>
            {item.description}
          </Text>
        )}
      </View>

      {showGst && (
        <>
          <View style={S.colHsn}>
            <Text style={S.cellTextCenter}>{item.hsnSacCode || '-'}</Text>
          </View>
        </>
      )}

      <View style={showGst ? S.colQty : S.colQtyNoGst}>
        <Text style={S.cellTextRight}>{`${item.quantity} ${item.unit}`}</Text>
      </View>
      {/* <View style={showGst ? S.colQty : S.colQtyNoGst}>
        <Text style={S.cellTextRight}>{fmtNum(item.quantity)}</Text>
      </View> */}
      {/* <View style={showGst ? S.colUnit : S.colUnitNoGst}>
        <Text style={S.cellTextCenter}>{item.unit || 'PCS'}</Text>
      </View> */}
      <View style={showGst ? S.colRate : S.colRateNoGst}>
        <Text style={S.cellTextRight}>{fmtNum(item.rate)}</Text>
      </View>
      <View style={S.colDiscPct}>
        <Text style={S.headerCellRight}>{item.discountPct}%</Text>
      </View>
      <View style={S.colDiscAmt}>
        <Text style={S.headerCellRight}>{calculateDiscAmount(item.discountPct, item.rate, item.quantity)}</Text>
      </View>
      <View style={!showGst ? S.colTotalNoGst : isIGST ? S.colTaxableIgst : S.colTaxable}>
        <Text style={S.cellTextRight}>{fmtNum(item.taxableAmount)}</Text>
      </View>

      {showGst && (
        <>
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
        </>
      )}
    </View>
  );
};

// ── Totals block ──────────────────────────────────────────────────────────────
const TotalsBlock = ({ invoice, showGst }) => {
  const { subtotal, totalCgst, totalSgst, totalIgst, totalTax, grandTotal, isIGST } = invoice;
  return (
    showGst &&
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

// ── Bank details + signature footer ──────────────────────────────────────────
const Footer = ({ settings }) => {
  const bank = settings?.bankDetails ?? {};
  const sigUrl = buildFileUrl(settings?.signature?.url);
  return (
    <View style={S.footer}>
      <View style={S.bankBlock}>
        {(bank.bankName || bank.accountNumber) && (
          <>
            <Text style={S.bankLabel}>Bank Details</Text>
            {bank.bankName && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>Bank:</Text>
                <Text style={S.bankValue}>{bank.bankName}</Text>
              </View>
            )}
            {bank.accountName && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>A/C Name:</Text>
                <Text style={S.bankValue}>{bank.accountName}</Text>
              </View>
            )}
            {bank.accountNumber && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>A/C No:</Text>
                <Text style={S.bankValue}>{bank.accountNumber}</Text>
              </View>
            )}
            {bank.ifscCode && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>IFSC:</Text>
                <Text style={S.bankValue}>{bank.ifscCode}</Text>
              </View>
            )}
            {bank.upiId && (
              <View style={S.bankRow}>
                <Text style={S.bankKey}>UPI:</Text>
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
        <Text style={S.signatureLabel}>For,</Text>
        <Text style={S.signatureNameBold}>
          {settings?.businessName ?? 'Authorised Signatory'}
        </Text>
        <Text style={S.signatureLabel}>Authorised Signatory</Text>
      </View>
    </View>
  );
};

// ── Main document ─────────────────────────────────────────────────────────────
const ClassicTemplate = ({ invoice, settings }) => {
  const logoUrl = buildFileUrl(settings?.logo?.url);
  const showGst = settings?.showGstBreakdown ?? false;
  const addressLines = formatAddressLines(invoice?.billingAddress);
  const addr = settings?.address ?? {};
  const sellerAddressParts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
    .filter(Boolean).join(', ');

  const showDueDate = false;

  const totalDiscAmt = calculateDiscTotalAmount(invoice);

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header Row 1 */}
        <View style={S.headerRow1} >
          {settings?.email && (
            <Text style={S.contactLine}>Email: {settings.email}</Text>
          )}

          {settings?.phone && (
            <Text style={S.contactLine}>Mobile: {settings.phone}</Text>
          )}
        </View>

        {/* ── Header ── */}
        <View style={S.headerRow}>
          {/* {logoUrl ? (
            <Image style={S.logo} src={logoUrl} />
          ) : (
            <View style={S.logoBox} />
          )} */}


          <View style={S.headerRight}>
            <Text style={S.businessName}>{settings?.businessName ?? ''}</Text>
            {settings?.legalName && settings.legalName !== settings.businessName && (
              <Text style={S.businessTagline}>{settings.legalName}</Text>
            )}
            {/* <Text style={S.businessTagline}>All Types of Electrical &amp; Cabling Works</Text> */}
            {settings?.tagLine && (
              <Text style={S.businessTagline}>{settings.tagLine}</Text>
            )}

            {sellerAddressParts ? (
              <Text style={S.businessAddress}>{sellerAddressParts}</Text>
            ) : null}
            {/* {settings?.phone && (
              <Text style={S.contactLine}>Mobile : {settings.phone}</Text>
            )} */}
            {/* {settings?.email && (
              <Text style={S.contactLine}>{settings.email}</Text>
            )} */}
            {settings?.gstin && (
              <Text style={S.gstinLine}>GSTIN: {settings.gstin}</Text>
            )}
          </View>
        </View>

        <Divider />
        {/* </View> */}

        {/* ── To / Date row ── */}
        <View style={S.metaRow}>
          <View style={S.toBlock}>
            <Text style={S.toLabel}>To,</Text>
            <Text style={S.customerName}>{invoice?.customerName ?? ''}</Text>
            {invoice?.customerGstin ? (
              <Text style={S.customerGstin}>GSTIN: {invoice.customerGstin}</Text>
            ) : null}
            {addressLines.map((line, i) => (
              <Text key={i} style={S.customerSub}>{line}</Text>
            ))}
            {invoice?.customerPhone ? (
              <Text style={S.customerSub}>Mobile: {invoice.customerPhone}</Text>
            ) : null}
          </View>
          <View style={S.dateBlock}>
            <Text style={S.dateLabel}>
              Date : {fmtDate(invoice?.invoiceDate)}
            </Text>
            <Text style={S.invoiceNumberLine}>
              Invoice # {invoice?.invoiceNumber ?? ''}
            </Text>
            {showDueDate &&
              invoice?.dueDate && (
                <Text style={S.invoiceNumberLine}>
                  Due : {fmtDate(invoice.dueDate)}
                </Text>
              )
            }

            {showGst &&
              <Text style={S.invoiceNumberLine}>
                Supply : {supplyTypeLabel(invoice?.isIGST)}
              </Text>
            }
          </View>
        </View>

        {/* ── Bill title ── */}
        <Text style={S.billTitle}>{settings?.gstin ? 'Tax Invoice' : 'Invoice'}</Text>

        {/* <ThinDivider /> */}

        {/* ── Line items table ── */}
        {/* <View style={S.table} minPresenceAhead={60}> */}
        <View style={S.table}>
          <TableHeader isIGST={invoice?.isIGST} showGst={showGst} />
          {(invoice?.items ?? []).map((item, i) => (
            <LineRow key={item._id ?? i} item={item} index={i} isIGST={invoice?.isIGST} showGst={showGst} />
          ))}

          {/* Table footer — total row */}
          <View style={[S.tableRow, { backgroundColor: '#efefef', alignItems: 'center' }]}>
            <View style={showGst ? S.colSn : S.colSnNoGst}><Text style={S.cellText} /></View>
            <View style={!showGst ? S.colDescNoGst : invoice?.isIGST ? S.colDescIgst : S.colDesc}>
              <Text style={S.cellTextBold}>Total</Text>
            </View>

            {showGst &&
              <View style={S.colHsn}><Text /></View>
            }

            <View style={showGst ? S.colQty : S.colQtyNoGst}><Text /></View>
            {/* <View style={showGst ? S.colUnit : S.colUnitNoGst}><Text /></View> */}
            <View style={showGst ? S.colRate : S.colRateNoGst}><Text /></View>
            <View style={S.colDiscPct}>
              <Text />
            </View>
            <View style={S.colDiscAmt}>
              <Text style={S.headerCellRight}>{totalDiscAmt}</Text>
            </View>
            <View style={!showGst ? S.colTotalNoGst : invoice?.isIGST ? S.colTaxableIgst : S.colTaxable}>
              <Text style={S.cellTextRightBold}>{fmtNum(invoice?.subtotal)}</Text>
            </View>

            {showGst && <>
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
            </>}
          </View>

        </View>

        <View wrap={false}>
          {/* ── Totals summary ── */}
          <TotalsBlock invoice={invoice} showGst={showGst} />

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
              <Text style={S.notesLabel}>Notes:</Text>
              <Text style={S.notesText}>
                {invoice?.notes || settings?.invoiceNotes}
              </Text>
            </View>
          )}

          {(invoice?.termsAndConditions || settings?.invoiceTerms) && (
            <View style={S.notesSection}>
              <Text style={S.notesLabel}>Terms &amp; Conditions:</Text>
              <Text style={S.notesText}>
                {invoice?.termsAndConditions || settings?.invoiceTerms}
              </Text>
            </View>
          )}

          {/* ── Footer ── */}
          <Footer settings={settings} />
        </View>

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

export default ClassicTemplate;
