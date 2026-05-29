import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerFormSchema, INDIAN_STATES, GST_TYPE_OPTIONS } from '@schemas/customer.schema.client';

const getApiError = (err) =>
  err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

/**
 * Field wrapper — keeps form markup DRY.
 */
const Field = ({ label, error, hint, children, required, half }) => (
  <div className={`form-group${half ? ' cform__half' : ''}`}>
    <label className="form-label">
      {label}
      {required && <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="form-error">{error.message}</p>}
  </div>
);

/**
 * Address sub-form block.
 */
const AddressFields = ({ prefix, register, errors }) => (
  <div className="cform__grid">
    <Field label="Line 1" error={errors?.[prefix]?.line1} half>
      <input type="text" className="form-input" placeholder="Building / street"
        {...register(`${prefix}.line1`)} />
    </Field>
    <Field label="Line 2" error={errors?.[prefix]?.line2} half>
      <input type="text" className="form-input" placeholder="Area / landmark"
        {...register(`${prefix}.line2`)} />
    </Field>
    <Field label="City" error={errors?.[prefix]?.city} half>
      <input type="text" className="form-input" placeholder="Mumbai"
        {...register(`${prefix}.city`)} />
    </Field>
    <Field label="Pincode" error={errors?.[prefix]?.pincode} half>
      <input type="text" className="form-input mono" placeholder="400001" maxLength={6}
        {...register(`${prefix}.pincode`)} />
    </Field>
    <Field label="State" error={errors?.[prefix]?.state}>
      <select className="form-select" {...register(`${prefix}.state`)}>
        <option value="">Select state</option>
        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </Field>
  </div>
);

// ── Default values ────────────────────────────────────────────────────────────

const DEFAULTS = {
  name: '', gstin: '', gstType: 'B2C', email: '', phone: '', notes: '',
  sameAsShipping: true,
  billingAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  shippingAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
};

/**
 * CustomerForm — reused for create and edit.
 *
 * @param {object}   props
 * @param {object}   [props.customer]    - Existing customer for edit mode
 * @param {Function} props.onSubmit      - (data) => Promise<void>
 * @param {Function} [props.onCancel]
 * @param {boolean}  [props.isSubmitting]
 * @param {Error}    [props.submitError]
 */
const CustomerForm = ({ customer, onSubmit, onCancel, isSubmitting = false, submitError }) => {
  const isEdit = !!customer;

  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: DEFAULTS,
  });

  // Populate on edit
  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name ?? '',
        gstin: customer.gstin ?? '',
        gstType: customer.gstType ?? 'B2C',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        notes: customer.notes ?? '',
        sameAsShipping: customer.sameAsShipping ?? true,
        billingAddress: {
          line1: customer.billingAddress?.line1 ?? '',
          line2: customer.billingAddress?.line2 ?? '',
          city: customer.billingAddress?.city ?? '',
          state: customer.billingAddress?.state ?? '',
          pincode: customer.billingAddress?.pincode ?? '',
          country: customer.billingAddress?.country ?? 'India',
        },
        shippingAddress: {
          line1: customer.shippingAddress?.line1 ?? '',
          line2: customer.shippingAddress?.line2 ?? '',
          city: customer.shippingAddress?.city ?? '',
          state: customer.shippingAddress?.state ?? '',
          pincode: customer.shippingAddress?.pincode ?? '',
          country: customer.shippingAddress?.country ?? 'India',
        },
      });
    }
  }, [customer, reset]);

  const sameAsShipping = watch('sameAsShipping');
  const gstType = watch('gstType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="cform">
      {submitError && (
        <div className="alert alert-error cform__alert" role="alert">
          {getApiError(submitError)}
        </div>
      )}

      {/* ── Section: Identity ───────────────────────────────────────────── */}
      <div className="cform__section">
        <h3 className="cform__section-title">Customer details</h3>

        <div className="cform__grid">
          <Field label="Customer name" error={errors.name} required>
            <input
              type="text" autoComplete="organization"
              className={`form-input${errors.name ? ' form-input--error' : ''}`}
              placeholder="Raj Enterprises"
              {...register('name')}
            />
          </Field>

          <Field label="GST type" error={errors.gstType} required>
            <select className="form-select" {...register('gstType')}>
              {GST_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* GSTIN — only shown for B2B and export */}
          {(gstType === 'B2B' || gstType === 'export') && (
            <Field
              label="GSTIN"
              error={errors.gstin}
              hint="15-character GST Identification Number"
              required={gstType === 'B2B'}
            >
              <input
                type="text"
                className={`form-input mono${errors.gstin ? ' form-input--error' : ''}`}
                placeholder="27AAPFU0939F1ZV"
                maxLength={15}
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                {...register('gstin')}
              />
            </Field>
          )}

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className={`form-input${errors.email ? ' form-input--error' : ''}`}
              placeholder="raj@example.com"
              {...register('email')}
            />
          </Field>

          <Field label="Phone" error={errors.phone} hint="10-digit Indian mobile number" half>
            <input
              type="tel"
              className={`form-input${errors.phone ? ' form-input--error' : ''}`}
              placeholder="9876543210" maxLength={10}
              {...register('phone')}
            />
          </Field>
        </div>
      </div>

      {/* ── Section: Billing address ─────────────────────────────────────── */}
      <div className="cform__section">
        <h3 className="cform__section-title">Billing address</h3>
        <AddressFields prefix="billingAddress" register={register} errors={errors} />
      </div>

      {/* ── Section: Shipping address ────────────────────────────────────── */}
      <div className="cform__section">
        <div className="cform__section-header">
          <h3 className="cform__section-title" style={{ marginBottom: 0 }}>Shipping address</h3>
          <label className="cform__checkbox-label">
            <input
              type="checkbox"
              className="cform__checkbox"
              {...register('sameAsShipping')}
              onChange={(e) => setValue('sameAsShipping', e.target.checked)}
            />
            Same as billing
          </label>
        </div>

        {!sameAsShipping && (
          <AddressFields prefix="shippingAddress" register={register} errors={errors} />
        )}
      </div>

      {/* ── Section: Notes ───────────────────────────────────────────────── */}
      <div className="cform__section">
        <h3 className="cform__section-title">Internal notes</h3>
        <Field label="Notes" error={errors.notes} hint="Not shown on invoices">
          <textarea
            rows={3}
            className="form-textarea"
            placeholder="Payment terms, preferences…"
            {...register('notes')}
          />
        </Field>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="cform__actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}
            disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || (isEdit && !isDirty)}
        >
          {isSubmitting
            ? <><span className="spinner spinner-sm" /> {isEdit ? 'Saving…' : 'Creating…'}</>
            : isEdit ? 'Save changes' : 'Create customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
