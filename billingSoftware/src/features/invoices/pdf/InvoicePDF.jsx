import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';

/**
 * InvoicePDF — template switcher.
 *
 * Usage:
 *   <PDFDownloadLink document={<InvoicePDF invoice={invoice} settings={settings} />} ...>
 *
 * Props:
 *   invoice  — full invoice object from your API / TanStack Query cache
 *   settings — full settings object from useSettings()
 *
 * Template is driven by settings.invoiceTemplate ('classic' | 'modern').
 * Falls back to 'classic' for any unrecognised value.
 */
const TEMPLATES = {
  classic: ClassicTemplate,
  modern:  ModernTemplate,
};

const InvoicePDF = ({ invoice, settings }) => {
  const templateKey = settings?.invoiceTemplate ?? 'classic';
  const Template = TEMPLATES[templateKey] ?? ClassicTemplate;
  return <Template invoice={invoice} settings={settings} />;
};

export default InvoicePDF;
