import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES, APP_NAME } from '@constants';

const LoginSchema = z.object({
    email: z.string({ required_error: 'Email is required' })
        .email('Enter a valid email').toLowerCase().trim(),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const getError = (err) =>
    err?.response?.data?.error?.message || 'Invalid email or password.';

const LoginPage = () => {
    const { login, isLoggingIn, loginError } = useAuth();
    const location = useLocation();
    const fromProtected = !!location.state?.from;

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
                        <input
                            id="password" type="password" autoComplete="current-password"
                            className={`form-input${errors.password ? ' form-input--error' : ''}`}
                            disabled={isLoggingIn}
                            {...register('password')}
                        />
                        {errors.password && <p className="form-error">{errors.password.message}</p>}
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
