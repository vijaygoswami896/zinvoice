import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES, APP_NAME } from '@constants';
import "@styles/components.css"
import { useState } from 'react';
import { LoginSchema } from '@/schemas/auth.schema';

const getError = (err) =>
    err?.response?.data?.error?.message || 'Invalid email or password.';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoggingIn, loginError } = useAuth();
    const location = useLocation();
    const fromProtected = !!location.state?.from;
    const passwordReset = !!location.state?.passwordReset;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
    });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" aria-hidden="true">₹</div>
                    <h1 className="auth-title">Sign in</h1>
                    <p className="auth-subtitle">{APP_NAME} · India GST</p>
                </div>

                {fromProtected && (
                    <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                        Please sign in to continue.
                    </div>
                )}

                {passwordReset && (
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                        Password reset successfully. Please sign in.
                    </div>
                )}

                {loginError && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: '20px' }}>
                        {getError(loginError)}
                    </div>
                )}

                <form onSubmit={handleSubmit(login)} noValidate>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email" type="email" autoComplete="email"
                            className={`form-input${errors.email ? ' form-input--error' : ''}`}
                            disabled={isLoggingIn}
                            {...register('email')}
                        />
                        {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                className={`form-input${errors.password ? ' form-input--error' : ''}`}
                                disabled={isLoggingIn}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password.message}</p>}
                    </div>

                    <div className="fp-link-row">
                        <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link fp-link">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoggingIn}>
                        {isLoggingIn
                            ? <><span className="spinner spinner-sm" aria-hidden="true" /> Signing in…</>
                            : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    {`Don't have an account? `}
                    <Link to={ROUTES.REGISTER} className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
