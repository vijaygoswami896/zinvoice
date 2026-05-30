/**
 * StatCard — KPI summary card.
 *
 * @param {object}   props
 * @param {string}   props.label        - Card title
 * @param {string}   props.value        - Formatted primary value
 * @param {string}   [props.sub]        - Secondary stat below value
 * @param {string}   [props.trend]      - e.g. "+12%" — shown in green/red
 * @param {boolean}  [props.trendUp]    - Green when true, red when false
 * @param {string}   [props.color]      - CSS variable name for accent colour
 * @param {React.ReactNode} [props.icon]
 * @param {boolean}  [props.loading]
 * @param {string}   [props.href]       - Optional link on click
 */
const StatCard = ({
  label, value, sub, trend, trendUp, color = 'var(--color-accent)',
  icon, loading = false, onClick,
}) => {
  const rootCls = `stat-card${onClick ? ' stat-card--clickable' : ''}`;

  return (
    <div className={rootCls} onClick={onClick} role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Icon badge */}
      <div className="stat-card__icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>

      {/* Content */}
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        {loading ? (
          <div className="stat-card__skeleton" />
        ) : (
          <p className="stat-card__value">{value ?? '—'}</p>
        )}
        {!loading && (sub || trend) && (
          <p className="stat-card__sub">
            {sub && <span>{sub}</span>}
            {trend && (
              <span className={`stat-card__trend ${trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
