import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_BADGE = {
  draft:     'badge-neutral',
  sent:      'badge-info',
  paid:      'badge-success',
  cancelled: 'badge-danger',
  overdue:   'badge-warning',
};

const isOverdue = (inv) =>
  inv.status !== 'paid' &&
  inv.status !== 'cancelled' &&
  inv.dueDate &&
  new Date(inv.dueDate) < new Date();

/**
 * @param {object}  props
 * @param {Array}   props.invoices   - Recent invoices array from API
 * @param {boolean} [props.loading]
 */
const RecentInvoicesTable = ({ invoices = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card dashboard-card--full">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Recent Invoices</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(ROUTES.INVOICES)}
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="table-skeleton__row" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="chart-empty">
          <p>No invoices yet</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(ROUTES.INVOICE_NEW)}
          >
            Create your first invoice
          </button>
        </div>
      ) : (
        <div className="recent-table-wrap">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const overdue = isOverdue(inv);
                return (
                  <tr
                    key={inv._id}
                    className="recent-table__row"
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/invoices/${inv._id}`)}
                    aria-label={`Invoice ${inv.invoiceNumber}`}
                  >
                    <td className="recent-table__num mono">{inv.invoiceNumber}</td>
                    <td className="recent-table__customer truncate">{inv.customerName}</td>
                    <td className="recent-table__date">{fmtDate(inv.invoiceDate)}</td>
                    <td>
                      <span className={overdue ? 'text-danger' : 'text-muted'}>
                        {fmtDate(inv.dueDate)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[overdue ? 'overdue' : inv.status] || 'badge-neutral'}`}>
                        {overdue ? 'Overdue' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="recent-table__amount mono text-right">
                      {INR.format(inv.grandTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentInvoicesTable;
