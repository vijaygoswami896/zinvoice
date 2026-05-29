import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES, APP_NAME } from '@constants';
import "@styles/components.css"

const RegisterSchema = z.object({
    name: z.string().trim().min(2, 'At least 2 characters').max(80),
    email: z.string().email('Enter a valid email').toLowerCase().trim(),
    password: z.string()
        .min(8, 'At least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Needs uppercase, lowercase & number'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

const getError = (err) =>
    err?.response?.data?.error?.message || 'Registration failed. Please try again.';

const RegisterPage = () => {
    const { register: registerUser, isRegistering, registerError } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
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
                    <div className="auth-logo" aria-hidden="true">₹</div>
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">{APP_NAME} · India GST</p>
                </div>

                {registerError && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: '20px' }}>
                        {getError(registerError)}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {[
                        { id: 'name', label: 'Full name', type: 'text', auto: 'name' },
                        { id: 'email', label: 'Email address', type: 'email', auto: 'email' },
                        { id: 'password', label: 'Password', type: 'password', auto: 'new-password' },
                        { id: 'confirmPassword', label: 'Confirm password', type: 'password', auto: 'new-password' },
                    ].map(({ id, label, type, auto }) => (
                        <div className="form-group" key={id}>
                            <label htmlFor={id} className="form-label">{label}</label>
                            <input
                                id={id} type={type} autoComplete={auto}
                                className={`form-input${errors[id] ? ' form-input--error' : ''}`}
                                disabled={isRegistering}
                                {...register(id)}
                            />
                            {errors[id] && <p className="form-error">{errors[id].message}</p>}
                        </div>
                    ))}

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isRegistering}>
                        {isRegistering
                            ? <><span className="spinner spinner-sm" aria-hidden="true" /> Creating account…</>
                            : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to={ROUTES.LOGIN} className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
