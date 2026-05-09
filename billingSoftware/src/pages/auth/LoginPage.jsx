import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ── Zod schema (client-side, mirrors server) ──────────────────────────────────

const LoginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts a human-readable message from an Axios error response
 * using the standard API error shape.
 */
const getApiErrorMessage = (error) =>
    error?.response?.data?.error?.message ||
    'Login failed. Please check your credentials and try again.';

// ── Component ─────────────────────────────────────────────────────────────────

const LoginPage = () => {
    const { login, isLoggingIn, loginError } = useAuth();
    const location = useLocation();

    // Show a message if redirected from a protected route
    const fromProtected = !!location.state?.from;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (data) => {
        login(data);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <h1 className="auth-title">Sign in</h1>
                    <p className="auth-subtitle">GST Billing — India</p>
                </div>

                {/* Redirected notice */}
                {fromProtected && (
                    <div className="alert alert-info" role="alert">
                        Please sign in to continue.
                    </div>
                )}

                {/* API error */}
                {loginError && (
                    <div className="alert alert-error" role="alert">
                        {getApiErrorMessage(loginError)}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                            disabled={isLoggingIn}
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="form-error" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                            disabled={isLoggingIn}
                            {...register('password')}
                        />
                        {errors.password && (
                            <p className="form-error" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
