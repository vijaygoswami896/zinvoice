import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

const RANK_COLORS = ['#f5a623', '#60a5fa', '#34d399', '#a78bfa', '#f87171'];

/**
 * @param {object}  props
 * @param {Array}   props.customers  - Top customers from API
 * @param {boolean} [props.loading]
 */
const TopCustomersCard = ({ customers = [], loading = false }) => {
  const navigate = useNavigate();

  const maxValue = customers[0]?.totalValue ?? 1;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Top Customers</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(ROUTES.CUSTOMERS)}
        >
          All →
        </button>
      </div>

      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="table-skeleton__row" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="chart-empty chart-empty--sm">
          <p>No customer data yet</p>
        </div>
      ) : (
        <div className="top-customers">
          {customers.map((c, i) => {
            const barPct = Math.round((c.totalValue / maxValue) * 100);
            const color  = RANK_COLORS[i] ?? RANK_COLORS[4];
            return (
              <div key={c._id} className="top-customer-row">
                <div className="top-customer-row__header">
                  <div className="top-customer-row__left">
                    <span className="top-customer-row__rank" style={{ color }}>
                      {i + 1}
                    </span>
                    <span className="top-customer-row__name truncate">
                      {c.customerName}
                    </span>
                  </div>
                  <div className="top-customer-row__right">
                    <span className="top-customer-row__value mono">
                      {INR.format(c.totalValue)}
                    </span>
                    <span className="top-customer-row__count">
                      {c.invoiceCount} inv
                    </span>
                  </div>
                </div>
                <div className="top-customer-row__bar-track">
                  <div
                    className="top-customer-row__bar-fill"
                    style={{ width: `${barPct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCustomersCard;
