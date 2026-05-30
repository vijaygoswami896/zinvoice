import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

const COLORS = {
  CGST: 'var(--color-accent)',
  SGST: 'var(--color-success)',
  IGST: 'var(--color-info)',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{name}</p>
      <p className="chart-tooltip__val" style={{ color: COLORS[name] }}>{INR.format(value)}</p>
    </div>
  );
};

/**
 * @param {object} props
 * @param {object} props.gstSummary  - From API: { totalCgst, totalSgst, totalIgst, totalTax, financialYear }
 * @param {boolean} [props.loading]
 */
const GSTBreakdownCard = ({ gstSummary, loading = false }) => {
  const fmt = (n) => INR.format(n ?? 0);

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">GST Collected</h2>
        </div>
        <div className="chart-skeleton chart-skeleton--sm" />
      </div>
    );
  }

  const { totalCgst = 0, totalSgst = 0, totalIgst = 0, totalTax = 0, financialYear = '' } = gstSummary ?? {};

  const pieData = [
    { name: 'CGST', value: totalCgst },
    { name: 'SGST', value: totalSgst },
    { name: 'IGST', value: totalIgst },
  ].filter((d) => d.value > 0);

  const hasData = totalTax > 0;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">GST Collected</h2>
        {financialYear && (
          <span className="dashboard-card__badge">FY {financialYear}</span>
        )}
      </div>

      {/* Total GST — hero number */}
      <div className="gst-total">
        <span className="gst-total__value">{fmt(totalTax)}</span>
        <span className="gst-total__label">Total GST (FY)</span>
      </div>

      {hasData ? (
        <div className="gst-layout">
          {/* Donut chart */}
          <div className="gst-donut">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown rows */}
          <div className="gst-rows">
            {[
              { key: 'CGST', value: totalCgst, label: 'Intra-state (seller)' },
              { key: 'SGST', value: totalSgst, label: 'Intra-state (buyer)' },
              { key: 'IGST', value: totalIgst, label: 'Inter-state / Export' },
            ].map(({ key, value, label }) => (
              <div key={key} className="gst-row">
                <div className="gst-row__left">
                  <span className="gst-row__dot" style={{ background: COLORS[key] }} />
                  <div>
                    <span className="gst-row__key">{key}</span>
                    <span className="gst-row__sublabel">{label}</span>
                  </div>
                </div>
                <span className="gst-row__val">{fmt(value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chart-empty chart-empty--sm">
          <p>No GST data for this FY</p>
        </div>
      )}
    </div>
  );
};

export default GSTBreakdownCard;
