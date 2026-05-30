import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import { useInvoice, useUpdateInvoice } from '@hooks/useInvoices';
import InvoiceForm from '@components/InvoiceForm';
import { ROUTES } from '@constants';
import "@styles/InvoicesPage.css"

const EditInvoicePage = () => {
  usePageTitle('Edit Invoice', 'Invoices');
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const updateMutation = useUpdateInvoice(id);

  const handleSubmit = async (formData) => {
    await updateMutation.mutateAsync(formData);
    navigate(`/invoices/${id}`);
  };

  if (isLoading) {
    return (
      <div className="invoices-page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <span className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="invoices-page">
        <div className="alert alert-error" style={{ maxWidth: 480, margin: '40px auto' }}>
          Invoice not found or failed to load.
        </div>
      </div>
    );
  }

  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return (
      <div className="invoices-page">
        <div className="alert alert-warning" style={{ maxWidth: 480, margin: '40px auto' }}>
          <strong>{invoice.invoiceNumber}</strong> is {invoice.status} and cannot be edited.
          To make changes, cancel this invoice and create a new one.
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(ROUTES.INVOICES)}>
            ← Back to invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Edit Invoice</h2>
          <p className="page-subtitle mono">{invoice.invoiceNumber}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(`/invoices/${id}`)}>
          ← View invoice
        </button>
      </div>

      <InvoiceForm
        invoice={invoice}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error}
      />
    </div>
  );
};

export default EditInvoicePage;
