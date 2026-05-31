import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import { useCreateInvoice } from '@hooks/useInvoices';
import InvoiceForm from '@/components/invoices/InvoiceForm';
// import { ROUTES } from '@constants';
import "@styles/InvoicesPage.css"

const CreateInvoicePage = () => {
  usePageTitle('New Invoice', 'Invoices');
  const navigate = useNavigate();
  const createMutation = useCreateInvoice();

  const handleSubmit = async (formData) => {
    const invoice = await createMutation.mutateAsync(formData);
    navigate(`/invoices/${invoice._id}`);
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">New Invoice</h2>
          <p className="page-subtitle">Invoice number will be assigned automatically.</p>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={createMutation.error}
      />
    </div>
  );
};

export default CreateInvoicePage;
