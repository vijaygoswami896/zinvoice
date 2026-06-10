import React, { useState, createElement } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../pdf/InvoicePDF';
import usePdf from '../pdf/usePdf';
import { useSettings } from '@hooks/useSettings';
import PageLoader from '@/components/common/PageLoader';
import { generateInvoiceName } from '@/utils/generate-invoice-name';
// import '@styles/PDF.css'

/**
 * InvoiceActions
 *
 * Two buttons:
 *   1. Download PDF  — uses PDFDownloadLink (react-pdf built-in, zero extra state)
 *   2. Open in Tab   — generates blob, creates object URL, opens new tab
 *
 * Props:
 *   invoice — full invoice object
 */

const OpenInTabButton = ({ invoice, settings }) => {
  const { generating, generatePdf } = usePdf();
  const [opened, setOpened] = useState(false);

  const handleOpen = async () => {
    const blob = await generatePdf({
      document: createElement(InvoicePDF, { invoice, settings }),
      // fileName: `Invoice-${invoice?.invoiceNumber ?? 'draft'}.pdf`,
      fileName: `${generateInvoiceName(invoice.customerName, invoice.invoiceNumber)}.pdf`,
      mode: 'preview',
    });

    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setOpened(true);
      // Revoke after 2 min — enough time for the tab to load
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    }
  };

  return (
    <button
      className="btn btn-secondary"
      onClick={handleOpen}
      disabled={generating}
      title="Open invoice PDF in a new tab"
    >
      {generating ? 'Generating…' : opened ? 'Open Again' : 'Preview PDF'}
    </button>
  );
};

const InvoiceActions = ({ invoice }) => {
  const { data: settingsData, isFetching } = useSettings();
  // console.log('settingsData==> ', settingsData);

  // if (isFetching) {
  //   return <PageLoader />
  // }

  if (isFetching) {
    return (
      <div className="invoice-actions">
        <button className="btn btn-primary" disabled>Preparing…</button>
      </div>
    );
  }

  const { settings } = settingsData;
  // console.log('settings==> ', settings);

  if (!invoice || !settings) return null;

  // const fileName = `Invoice-${invoice.invoiceNumber ?? 'draft'}.pdf`;
  const fileName = `${generateInvoiceName(invoice.customerName, invoice.invoiceNumber)}.pdf`;
  const docElement = createElement(InvoicePDF, { invoice, settings });


  return (
    <div className="invoice-actions">

      {/* Download — react-pdf handles the blob internally */}
      <PDFDownloadLink document={docElement} fileName={fileName}>
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

      {/* Open in new tab */}
      <OpenInTabButton invoice={invoice} settings={settings} />

    </div>
  );
};

export default InvoiceActions;