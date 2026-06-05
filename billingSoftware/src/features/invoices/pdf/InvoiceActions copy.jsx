import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import InvoicePDF from '@features/invoices/pdf/InvoicePDF';
import PdfPreviewModal from '@features/invoices/pdf/PdfPreviewModal';
import { useSettings } from '@hooks/useSettings';

/**
 * InvoiceActions
 *
 * Renders the Download and Preview buttons on InvoiceDetailPage.
 * All PDF work happens in the browser — no /api/pdf calls.
 *
 * Props:
 *   invoice — full invoice object
 */
const InvoiceActions = ({ invoice }) => {
  const { data: settings } = useSettings();
  // console.log("settings: ", settings);
  // console.log("invoice: ", invoice);

  const [showPreview, setShowPreview] = useState(false);

  if (!invoice || !settings) return null;

  const fileName = `Invoice-${invoice.invoiceNumber ?? 'draft'}.pdf`;
  const document = <InvoicePDF invoice={invoice} settings={settings.settings} />;

  return (
    <>
      <div className="invoice-actions">

        {/* ── Download button (react-pdf built-in link) ── */}
        <PDFDownloadLink document={document} fileName={fileName}>
          {({ loading }) => (
            <button
              className="btn btn-primary"
              disabled={loading}
              title="Download invoice as PDF"
            >
              {loading ? 'Preparing…' : 'Download PDF'}
            </button>
          )}
        </PDFDownloadLink>

        {/* ── Preview button ── */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowPreview(true)}
          title="Preview invoice PDF"
        >
          Preview PDF
        </button>
      </div>

      {/* ── Preview modal ── */}
      {showPreview && (
        <PdfPreviewModal
          invoice={invoice}
          settings={settings.settings}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default InvoiceActions;
