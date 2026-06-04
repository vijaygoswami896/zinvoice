import React, { useState, useEffect, useCallback } from 'react';
import usePdf from './usePdf';

/**
 * PdfPreviewModal
 *
 * Opens an <iframe> preview of the generated PDF blob.
 * No backend. The blob URL lives only for the duration the modal is open.
 *
 * Props:
 *   invoice   — invoice object
 *   settings  — settings object from useSettings()
 *   onClose   — fn() called when the modal should close
 */
const PdfPreviewModal = ({ invoice, settings, onClose }) => {
  const { generating, error, generatePdf } = usePdf();
  const [blobUrl, setBlobUrl] = useState(null);

  const generate = useCallback(async () => {
    const blob = await generatePdf({ invoice, settings, mode: 'preview' });
    if (blob) {
      setBlobUrl(URL.createObjectURL(blob));
    }
  }, [invoice, settings, generatePdf]);

  useEffect(() => {
    generate();
    return () => {
      // Clean up blob URL when modal unmounts
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    await generatePdf({ invoice, settings, mode: 'download' });
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
