import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ProductFormSchema
} from '@schemas/product.schema.client';
import { PRODUCT_TYPES, UNIT_GROUPS, GST_RATE_OPTIONS } from '@/constants';

const getApiError = (err) =>
    err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

const Field = ({ label, error, hint, children, required }) => (
    <div className="form-group">
        <label className="form-label">
            {label}
            {required && <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>}
        </label>
        {children}
        {hint && !error && <p className="form-hint">{hint}</p>}
        {error && <p className="form-error">{error.message}</p>}
    </div>
);

// ── Default values ────────────────────────────────────────────────────────────

const DEFAULTS = {
    name: '', type: 'goods', hsnSacCode: '', price: '',
    unit: 'PCS', gstRate: 18, taxIncluded: false,
    inventoryEnabled: false, stockQuantity: 0, lowStockThreshold: 10,
    description: '', isActive: true,
};

/**
 * ProductForm — shared for create and edit.
 *
 * @param {object}   props
 * @param {object}   [props.product]     - Existing product for edit mode
 * @param {Function} props.onSubmit      - async (data) => void
 * @param {Function} [props.onCancel]
 * @param {boolean}  [props.isSubmitting]
 * @param {Error}    [props.submitError]
 */
const ProductForm = ({ product, onSubmit, onCancel, isSubmitting = false, submitError }) => {
    const isEdit = !!product;

    const {
        register, handleSubmit, watch, reset, setValue,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: DEFAULTS,
    });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name ?? '',
                type: product.type ?? 'goods',
                hsnSacCode: product.hsnSacCode ?? '',
                price: product.price ?? '',
                unit: product.unit ?? 'PCS',
                gstRate: product.gstRate ?? 18,
                taxIncluded: product.taxIncluded ?? false,
                inventoryEnabled: product.inventoryEnabled ?? false,
                stockQuantity: product.stockQuantity ?? 0,
                lowStockThreshold: product.lowStockThreshold ?? 10,
                description: product.description ?? '',
                isActive: product.isActive ?? true,
            });
        }
    }, [product, reset]);

    const type = watch('type');
    const inventoryEnabled = watch('inventoryEnabled');
    const isService = type === 'service';
    const hsnLabel = isService ? 'SAC code' : 'HSN code';
    const hsnHint = isService
        ? 'Services Accounting Code (e.g. 9983)'
        : 'Harmonised System Nomenclature code (e.g. 8471)';

    // When type switches to service, clear inventory fields
    useEffect(() => {
        if (isService) {
            setValue('inventoryEnabled', false);
            setValue('stockQuantity', 0);
        }
    }, [isService, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="pform">
            {submitError && (
                <div className="alert alert-error pform__alert" role="alert">
                    {getApiError(submitError)}
                </div>
            )}

            {/* ── Section: Classification ─────────────────────────────────────── */}
            <div className="pform__section">
                <h3 className="pform__section-title">Classification</h3>

                {/* Type toggle */}
                <div className="form-group">
                    <label className="form-label">
                        Type <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>
                    </label>
                    <div className="pform__type-toggle" role="group" aria-label="Product type">
                        {PRODUCT_TYPES.map(({ value, label, description }) => {
                            const isSelected = type === value;
                            return (
                                <label
                                    key={value}
                                    className={`pform__type-option ${isSelected ? 'pform__type-option--active' : ''}`}
                                >
                                    <input
                                        type="radio" value={value}
                                        className="sr-only"
                                        {...register('type')}
                                    />
                                    <span className="pform__type-icon" aria-hidden="true">
                                        {value === 'goods' ? <GoodsIcon /> : <ServiceIcon />}
                                    </span>
                                    <span>
                                        <span className="pform__type-label">{label}</span>
                                        <span className="pform__type-desc">{description}</span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                    {errors.type && <p className="form-error">{errors.type.message}</p>}
                </div>

                <div className="pform__grid">
                    <Field label="Product name" error={errors.name} required>
                        <input
                            type="text" autoFocus
                            className={`form-input${errors.name ? ' form-input--error' : ''}`}
                            placeholder={isService ? 'Web Development Services' : 'Office Chair'}
                            {...register('name')}
                        />
                    </Field>

                    <Field label={hsnLabel} error={errors.hsnSacCode} hint={hsnHint}>
                        <input
                            type="text"
                            className={`form-input mono${errors.hsnSacCode ? ' form-input--error' : ''}`}
                            placeholder={isService ? '9983' : '9401'}
                            maxLength={8}
                            {...register('hsnSacCode')}
                        />
                    </Field>
                </div>

                <Field label="Description" error={errors.description} hint="Internal note. Not shown on invoices.">
                    <textarea
                        rows={2} className="form-textarea"
                        placeholder={isService ? 'Scope of service, deliverables…' : 'Colour, model, variant…'}
                        {...register('description')}
                    />
                </Field>
            </div>

            {/* ── Section: Pricing ─────────────────────────────────────────────── */}
            <div className="pform__section">
                <h3 className="pform__section-title">Pricing & Tax</h3>

                <div className="pform__grid pform__grid--3">
                    {/* Price */}
                    <Field label="Price (₹)" error={errors.price} required>
                        <div className="pform__input-prefix">
                            <span className="pform__prefix-symbol">₹</span>
                            <input
                                type="number" step="0.01" min="0"
                                className={`form-input pform__price-input${errors.price ? ' form-input--error' : ''}`}
                                placeholder="0.00"
                                {...register('price')}
                            />
                        </div>
                    </Field>

                    {/* Unit */}
                    <Field label="Unit" error={errors.unit} required>
                        <select className={`form-select${errors.unit ? ' form-select--error' : ''}`}
                            {...register('unit')}>
                            {UNIT_GROUPS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </Field>

                    {/* GST rate */}
                    <Field label="GST rate" error={errors.gstRate} required>
                        <select className={`form-select${errors.gstRate ? ' form-select--error' : ''}`}
                            {...register('gstRate', { valueAsNumber: true })}>
                            {GST_RATE_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                {/* Tax inclusion toggle */}
                <label className="pform__checkbox-row">
                    <input type="checkbox" className="pform__checkbox" {...register('taxIncluded')} />
                    <span>
                        <span className="pform__checkbox-label">Price is tax-inclusive</span>
                        <span className="pform__checkbox-hint">
                            When checked, GST is extracted from the price. Otherwise GST is added on top.
                        </span>
                    </span>
                </label>

                {/* Status */}
                <label className="pform__checkbox-row">
                    <input type="checkbox" className="pform__checkbox" {...register('isActive')} />
                    <span>
                        <span className="pform__checkbox-label">Active</span>
                        <span className="pform__checkbox-hint">
                            Inactive products are hidden from invoice line-item selection.
                        </span>
                    </span>
                </label>
            </div>

            {/* ── Section: Inventory (goods only) ──────────────────────────────── */}
            {!isService && (
                <div className="pform__section">
                    <h3 className="pform__section-title">Inventory</h3>

                    <label className="pform__checkbox-row" style={{ marginBottom: inventoryEnabled ? '20px' : 0 }}>
                        <input
                            type="checkbox" className="pform__checkbox"
                            {...register('inventoryEnabled')}
                        />
                        <span>
                            <span className="pform__checkbox-label">Enable inventory tracking</span>
                            <span className="pform__checkbox-hint">
                                Track stock quantity. Stock will be decremented when invoices are generated.
                            </span>
                        </span>
                    </label>

                    {inventoryEnabled && (
                        <div className="pform__grid">
                            <Field
                                label="Current stock"
                                error={errors.stockQuantity}
                                hint="Leave as-is when editing if you don't want to change stock."
                            >
                                <input
                                    type="number" min="0" step="1"
                                    className={`form-input mono${errors.stockQuantity ? ' form-input--error' : ''}`}
                                    placeholder="0"
                                    {...register('stockQuantity')}
                                />
                            </Field>

                            <Field
                                label="Low stock alert below"
                                error={errors.lowStockThreshold}
                                hint="A warning appears when stock falls to or below this level."
                            >
                                <input
                                    type="number" min="0" step="1"
                                    className={`form-input mono${errors.lowStockThreshold ? ' form-input--error' : ''}`}
                                    placeholder="10"
                                    {...register('lowStockThreshold')}
                                />
                            </Field>
                        </div>
                    )}
                </div>
            )}

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <div className="pform__actions">
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}
                        disabled={isSubmitting}>
                        Cancel
                    </button>
                )}
                <button
                    type="submit" className="btn btn-primary"
                    disabled={isSubmitting || (isEdit && !isDirty)}
                >
                    {isSubmitting
                        ? <><span className="spinner spinner-sm" /> {isEdit ? 'Saving…' : 'Creating…'}</>
                        : isEdit ? 'Save changes' : 'Create product'}
                </button>
            </div>
        </form>
    );
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const GoodsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);
const ServiceIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export default ProductForm;
