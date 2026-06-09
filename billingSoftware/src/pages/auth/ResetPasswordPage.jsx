import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@constants';
import { ResetPasswordSchema } from '@/schemas/auth.schema';
import { useAuth } from '@hooks/useAuth';
import '@styles/components.css';

const getError = (err) =>
    err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

const EyeIcon = ({ open }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const PasswordField = ({ id, label, registration, error, disabled }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="form-group">
            <label htmlFor={id} className="form-label">{label}</label>
            <div className="input-wrapper">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input${error ? ' form-input--error' : ''}`}
                    disabled={disabled}
                    {...registration}
                />
                <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShow(v => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    <EyeIcon open={show} />
                </button>
            </div>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
};

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email ?? '';

    const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
    });

    const onSubmit = ({ otp, newPassword }) => {
        resetPassword(
            { email, otp, newPassword },
            {
                onSuccess: () => {
                    navigate(ROUTES.LOGIN, {
                        replace: true,
                        state: { passwordReset: true },
                    });
                },
            }
        );
    };

    // Guard: no email in state means direct URL visit
    if (!email) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo" aria-hidden="true">₹</div>
                        <h1 className="auth-title">Link expired</h1>
                        <p className="auth-subtitle">{APP_NAME} · India GST</p>
                    </div>
                    <p className="fp-description">
                        {`We couldn't find your session. Please start over.`}
                    </p>
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="btn btn-primary btn-full btn-lg"
                        style={{ display: 'block', textAlign: 'center' }}
                    >
                        Back to forgot password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" aria-hidden="true">₹</div>
                    <h1 className="auth-title">Reset password</h1>
                    <p className="auth-subtitle">{APP_NAME} · India GST</p>
                </div>

                <p className="fp-description">
                    We sent a 6-digit code to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
                    Enter it below along with your new password.
                </p>

                {resetPasswordError && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: '20px' }}>
                        {getError(resetPasswordError)}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                        <label htmlFor="otp" className="form-label">One-time code</label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            maxLength={6}
                            placeholder="••••••"
                            className={`form-input mono otp-input${errors.otp ? ' form-input--error' : ''}`}
                            disabled={isResettingPassword}
                            {...register('otp')}
                        />
                        {errors.otp && <p className="form-error">{errors.otp.message}</p>}
                    </div>

                    <PasswordField
                        id="newPassword"
                        label="New password"
                        registration={register('newPassword')}
                        error={errors.newPassword?.message}
                        disabled={isResettingPassword}
                    />

                    <PasswordField
                        id="confirmPassword"
                        label="Confirm new password"
                        registration={register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        disabled={isResettingPassword}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={isResettingPassword}
                    >
                        {isResettingPassword
                            ? <><span className="spinner spinner-sm" aria-hidden="true" /> Resetting…</>
                            : 'Reset password'}
                    </button>
                </form>

                <p className="auth-footer">
                    {`Didn't get a code? `}
                    <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link">Resend</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;