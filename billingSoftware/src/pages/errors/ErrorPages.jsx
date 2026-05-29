import { Link } from 'react-router-dom';
import { ROUTES } from '@constants';

const ErrorPage = ({ code, title, message, action }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', padding: '24px', background: 'var(--color-bg)',
    }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '5rem', fontWeight: 300,
                color: 'var(--color-border)', lineHeight: 1, marginBottom: '24px',
                letterSpacing: '-0.04em',
            }}>
                {code}
            </div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '8px' }}>
                {title}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                {message}
            </p>
            <Link to={action.to} className="btn btn-secondary">
                {action.label}
            </Link>
        </div>
    </div>
);

export const ForbiddenPage = () => (
    <ErrorPage
        code="403"
        title="Access denied"
        message="You don't have permission to view this page. Contact your administrator if you think this is a mistake."
        action={{ to: ROUTES.DASHBOARD, label: '← Back to dashboard' }}
    />
);

export const NotFoundPage = () => (
    <ErrorPage
        code="404"
        title="Page not found"
        message="The page you're looking for doesn't exist or has been moved."
        action={{ to: ROUTES.DASHBOARD, label: '← Back to dashboard' }}
    />
);

export default NotFoundPage;
