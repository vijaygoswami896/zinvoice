import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area,
} from 'recharts';

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtLakh = (n) => {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
};

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

// ── Custom tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="chart-tooltip__row" style={{ color: entry.color }}>
          <span>{entry.name}</span>
          <span className="chart-tooltip__val">{INR.format(entry.value)}</span>
        </p>
      ))}
      {payload[0] && (
        <p className="chart-tooltip__row chart-tooltip__row--muted">
          <span>Invoices</span>
          <span className="chart-tooltip__val">{payload[0]?.payload?.invoiceCount ?? 0}</span>
        </p>
      )}
    </div>
  );
};

// ── RevenueChart ──────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.data        - Monthly revenue array from API
 * @param {boolean}  [props.loading]
 */
const RevenueChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Monthly Revenue</h2>
        </div>
        <div className="chart-skeleton" />
      </div>
    );
  }

  const hasData = data.some((d) => d.revenue > 0 || d.gstCollected > 0);

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Monthly Revenue</h2>
        <div className="dashboard-card__legend">
          <span className="legend-dot" style={{ background: 'var(--color-accent)' }} />
          <span className="legend-label">Revenue</span>
          <span className="legend-dot" style={{ background: 'var(--color-info)' }} />
          <span className="legend-label">GST</span>
        </div>
      </div>

      {!hasData ? (
        <div className="chart-empty">
          <p>No invoice data for this period</p>
        </div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border-subtle, #1e2535)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmtLakh}
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,166,35,0.05)' }} />

              {/* Revenue bars */}
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--color-accent)"
                radius={[3, 3, 0, 0]}
                maxBarSize={36}
                opacity={0.85}
              />

              {/* GST as area line on top */}
              <Area
                type="monotone"
                dataKey="gstCollected"
                name="GST Collected"
                stroke="var(--color-info)"
                fill="rgba(96,165,250,0.08)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-info)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
