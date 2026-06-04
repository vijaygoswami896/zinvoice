import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

/**
 * usePdf
 *
 * Generates and optionally downloads an invoice PDF entirely in the browser.
 * No backend call. No Puppeteer. Works on free Render.
 *
 * Returns:
 *   generating  — boolean, true while the blob is being built
 *   error       — Error | null
 *   generatePdf — async fn({ invoice, settings, mode })
 *                   mode: 'download' (default) | 'preview'
 *                   returns the Blob so the caller can open it in a modal if needed
 */
const usePdf = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePdf = useCallback(async ({ invoice, settings, mode = 'download' }) => {
    setGenerating(true);
    setError(null);

    try {
      // Build the PDF blob in-browser
      const blob = await pdf(
        <InvoicePDF invoice={invoice} settings={settings} />
      ).toBlob();

      if (mode === 'download') {
        // Trigger a browser download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoice?.invoiceNumber ?? 'draft'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Give the browser a moment before revoking
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }

      return blob; // caller can use this for preview (objectURL in a modal)
    } catch (err) {
      console.error('[usePdf] PDF generation failed:', err);
      setError(err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generating, error, generatePdf };
};

export default usePdf;
