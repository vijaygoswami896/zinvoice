/**
 * PageLoader — shown while the silent auth refresh is in-flight on page load.
 * Prevents a flash of the login page before the session is restored.
 */
const PageLoader = () => (
    <div className="page-loading" role="status" aria-label="Loading application">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
                style={{
                    width: 40, height: 40,
                    background: 'var(--color-accent-muted)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    fontSize: '18px',
                }}
                aria-hidden="true"
            >
                ₹
            </div>
            <div className="spinner spinner-lg" aria-hidden="true" />
        </div>
    </div>
);

export default PageLoader;
