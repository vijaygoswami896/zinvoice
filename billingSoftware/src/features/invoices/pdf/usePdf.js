import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';

/**
 * usePdf
 *
 * Accepts a pre-created React-PDF document element and generates a Blob.
 * No JSX here — JSX stays in the caller (.jsx files).
 *
 * Usage in a .jsx file:
 *   import { createElement } from 'react';
 *   import InvoicePDF from './InvoicePDF';
 *
 *   const { generating, error, generatePdf } = usePdf();
 *
 *   // pass the document element, not JSX — this file is plain .js
 *   await generatePdf({
 *     document: createElement(InvoicePDF, { invoice, settings }),
 *     fileName: `Invoice-${invoice.invoiceNumber}.pdf`,
 *     mode: 'download',   // 'download' | 'preview'
 *   });
 *
 * Returns:
 *   generating  — boolean
 *   error       — Error | null
 *   generatePdf — async fn({ document, fileName, mode }) → Blob | null
 */
const usePdf = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePdf = useCallback(async ({ document: docElement, fileName = 'invoice.pdf', mode = 'download' }) => {
    setGenerating(true);
    setError(null);

    try {
      const blob = await pdf(docElement).toBlob();

      if (mode === 'download') {
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }

      return blob;
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