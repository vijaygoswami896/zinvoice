import React, { useState, useEffect, useCallback, createElement } from 'react';
import usePdf from './usePdf';
import InvoicePDF from './InvoicePDF';

/**
 * PdfPreviewModal
 *
 * Props:
 *   invoice   — invoice object
 *   settings  — settings object from useSettings()
 *   onClose   — fn() called when modal should close
 */
const PdfPreviewModal = ({ invoice, settings, onClose }) => {
  const { generating, error, generatePdf } = usePdf();
  const [blobUrl, setBlobUrl] = useState(null);

  // Build the document element once — no JSX needed in usePdf
  const getDocElement = useCallback(
    () => createElement(InvoicePDF, { invoice, settings }),
    [invoice, settings],
  );

  const generate = useCallback(async () => {
    const blob = await generatePdf({
      document: getDocElement(),
      fileName: `Invoice-${invoice?.invoiceNumber ?? 'draft'}.pdf`,
      mode: 'preview',
    });
    if (blob) setBlobUrl(URL.createObjectURL(blob));
  }, [generatePdf, getDocElement, invoice?.invoiceNumber]);

  useEffect(() => {
    generate();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    await generatePdf({
      document: getDocElement(),
      fileName: `Invoice-${invoice?.invoiceNumber ?? 'draft'}.pdf`,
      mode: 'download',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container pdf-preview-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Invoice Preview</h2>
          <div className="modal-header-actions">
            <button
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={generating}
            >
              {generating ? 'Generating…' : 'Download PDF'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="pdf-preview-body">
          {generating && !blobUrl && (
            <div className="pdf-preview-loader">
              <span className="loader-spinner" />
              <p>Generating PDF…</p>
            </div>
          )}
          {error && (
            <div className="pdf-preview-error">
              <p>Failed to generate PDF. Please try again.</p>
              <button className="btn btn-secondary" onClick={generate}>
                Retry
              </button>
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}
              title={`Invoice ${invoice?.invoiceNumber}`}
              className="pdf-preview-frame"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;