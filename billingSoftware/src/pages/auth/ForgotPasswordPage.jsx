import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@constants';
import { ForgotPasswordSchema } from '@/schemas/auth.schema';
import { useAuth } from '@hooks/useAuth';
import '@styles/components.css';

const getError = (err) =>
    err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { forgotPassword, isSendingOtp, forgotPasswordError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = ({ email }) => {
        forgotPassword(
            { email },
            {
                onSuccess: () => {
                    navigate(ROUTES.RESET_PASSWORD, { state: { email } });
                },
            }
        );
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" aria-hidden="true">₹</div>
                    <h1 className="auth-title">Forgot password</h1>
                    <p className="auth-subtitle">{APP_NAME} · India GST</p>
                </div>

                <p className="fp-description">
                    {`Enter your account email and we'll send a one-time code to reset your password.`}
                </p>

                {forgotPasswordError && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: '20px' }}>
                        {getError(forgotPasswordError)}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            className={`form-input${errors.email ? ' form-input--error' : ''}`}
                            disabled={isSendingOtp}
                            {...register('email')}
                        />
                        {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={isSendingOtp}
                    >
                        {isSendingOtp
                            ? <><span className="spinner spinner-sm" aria-hidden="true" /> Sending…</>
                            : 'Send reset code'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password?{' '}
                    <Link to={ROUTES.LOGIN} className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;