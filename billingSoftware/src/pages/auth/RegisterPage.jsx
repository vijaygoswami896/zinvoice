import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

import { useAuth } from '@hooks/useAuth';
import { ROUTES, APP_NAME } from '@constants';
import "@styles/components.css"
import { SignupSchema } from '@/schemas/auth.schema';

const getError = (err) =>
    err?.response?.data?.error?.message || 'Registration failed. Please try again.';

const BASE_TEXT_FIELDS = [
    { id: 'businessName', label: 'Business name', type: 'text', auto: 'organization', required: true },
    { id: 'businessPhone', label: 'Business phone', type: 'tel', auto: 'tel', required: true },
    { id: 'name', label: 'Full name', type: 'text', auto: 'name', required: true },
    { id: 'email', label: 'Email', type: 'email', auto: 'email', required: true },
    { id: 'password', label: 'Password', type: 'password', auto: 'new-password', required: true },
    { id: 'confirmPassword', label: 'Confirm password', type: 'password', auto: 'new-password', required: true },
];

const GST_OPTIONS = [
    { value: 'unregistered', label: 'Unregistered' },
    { value: 'regular', label: 'Regular' },
    { value: 'composition', label: 'Composition' },
];

const RegisterPage = () => {
    const { register: registerUser, isRegistering, registerError } = useAuth();
    const [visibleFields, setVisibleFields] = useState({});

    const toggleVisibility = (id) =>
        setVisibleFields(prev => ({ ...prev, [id]: !prev[id] }));

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '', email: '', password: '', confirmPassword: '',
            businessName: '', businessEmail: '', businessPhone: '',
            businessGstin: '', gstRegistrationType: 'unregistered',
        },
    });

    const onSubmit = (data) => {
        const { confirmPassword, ...payload } = data;
        payload.businessEmail = payload.email;
        registerUser({ ...payload });
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
                    {BASE_TEXT_FIELDS.map(({ id, label, type, auto, required }) => {
                        const isPassword = type === 'password';
                        const isVisible = visibleFields[id];
                        const resolvedType = isPassword ? (isVisible ? 'text' : 'password') : type;

                        return (
                            <div className="form-group" key={id}>
                                <label htmlFor={id} className="form-label">
                                    {label}
                                    {required && <span style={{ color: 'red', marginLeft: '2px' }} aria-hidden="true">*</span>}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id={id}
                                        type={resolvedType}
                                        autoComplete={auto}
                                        className={`form-input${errors[id] ? ' form-input--error' : ''}`}
                                        disabled={isRegistering}
                                        style={isPassword ? { paddingRight: '2.5rem' } : undefined}
                                        {...register(id)}
                                    />
                                    {isPassword && (
                                        <button
                                            type="button"
                                            onClick={() => toggleVisibility(id)}
                                            aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
                                            style={{
                                                position: 'absolute',
                                                right: '0.625rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                color: 'var(--color-text-muted, #6b7280)',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {isVisible
                                                ? <FaEyeSlash size={18} />
                                                : <FaEye size={18} />
                                            }
                                        </button>
                                    )}
                                </div>
                                {errors[id] && <p className="form-error">{errors[id].message}</p>}
                            </div>
                        );
                    })}

                    <div className="form-group">
                        <label htmlFor="gstRegistrationType" className="form-label">
                            GST registration type
                        </label>
                        <select
                            id="gstRegistrationType"
                            className={`form-input${errors.gstRegistrationType ? ' form-input--error' : ''}`}
                            disabled={isRegistering}
                            {...register('gstRegistrationType')}
                        >
                            {GST_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        {errors.gstRegistrationType && (
                            <p className="form-error">{errors.gstRegistrationType.message}</p>
                        )}
                    </div>

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