import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ── Zod schema ─────────────────────────────────────────────────────────────────

const RegisterSchema = z
    .object({
        name: z
            .string({ required_error: 'Name is required' })
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(80, 'Name must not exceed 80 characters'),
        email: z
            .string({ required_error: 'Email is required' })
            .email('Please enter a valid email address')
            .toLowerCase()
            .trim(),
        password: z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Must contain uppercase, lowercase, and a number',
            ),
        confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

const getApiErrorMessage = (error) =>
    error?.response?.data?.error?.message || 'Registration failed. Please try again.';

// ── Component ─────────────────────────────────────────────────────────────────

const RegisterPage = () => {
    const { register: registerUser, isRegistering, registerError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    const onSubmit = ({ name, email, password }) => {
        registerUser({ name, email, password, role: 'staff' });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">GST Billing — India</p>
                </div>

                {registerError && (
                    <div className="alert alert-error" role="alert">
                        {getApiErrorMessage(registerError)}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full name</label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                            disabled={isRegistering}
                            {...register('name')}
                        />
                        {errors.name && <p className="form-error">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                            disabled={isRegistering}
                            {...register('email')}
                        />
                        {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                            disabled={isRegistering}
                            {...register('password')}
                        />
                        {errors.password && <p className="form-error">{errors.password.message}</p>}
                    </div>

                    {/* Confirm password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                            disabled={isRegistering}
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <p className="form-error">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
