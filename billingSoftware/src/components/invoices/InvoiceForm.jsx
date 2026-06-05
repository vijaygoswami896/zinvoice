import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormSchema } from '@schemas/invoice.schema.client';
import { INVOICE_STATUSES } from '@constants';
import { computeInvoiceTotals } from '@/utils/tax';
import { useCustomers } from '@hooks/useCustomers';
import LineItemRow from '@/components/invoices/LineItemRow';
import { ROUTES } from '@constants';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
});
const fmt = (n) => INR.format(n ?? 0);

const today = () => new Date().toISOString().split('T')[0];
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const BLANK_ITEM = {
  productId: null, name: '', description: '', hsnSacCode: '',
  unit: 'PCS', itemType: 'goods', quantity: 1, rate: '', gstRate: 18,
  taxIncluded: false, discountPct: 0,
};

const DEFAULTS = {
  customerId: '', invoiceDate: today(), dueDate: addDays(30),
  items: [{ ...BLANK_ITEM }],
  status: 'draft', notes: '', termsAndConditions: '', internalNotes: '',
};

const getApiError = (err) =>
  err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

/**
 * InvoiceForm — shared for create and edit pages.
 *
 * @param {object}   props
 * @param {object}   [props.invoice]      Existing invoice for edit pre-fill
 * @param {Function} props.onSubmit       async (formData) => void
 * @param {boolean}  [props.isSubmitting]
 * @param {Error}    [props.submitError]
 */
const InvoiceForm = ({ invoice, onSubmit, isSubmitting = false, submitError }) => {
  const navigate = useNavigate();
  const isEdit = !!invoice;

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // ── Populate form on edit ───────────────────────────────────────────────────
  useEffect(() => {
    if (!invoice) return;
    reset({
      customerId: invoice.customerId?._id ?? invoice.customerId ?? '',
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : today(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      items: invoice.items.map((item) => ({
        productId: item.productId ?? null,
        name: item.name ?? '',
        description: item.description ?? '',
        hsnSacCode: item.hsnSacCode ?? '',
        unit: item.unit ?? 'PCS',
        itemType: item.itemType ?? 'goods',
        quantity: item.quantity,
        rate: item.rate,
        gstRate: item.gstRate,
        taxIncluded: item.taxIncluded ?? false,
        discountPct: item.discountPct ?? 0,
      })),
      status: invoice.status ?? 'draft',
      notes: invoice.notes ?? '',
      termsAndConditions: invoice.termsAndConditions ?? '',
      internalNotes: invoice.internalNotes ?? '',
    });
  }, [invoice, reset]);

  // ── Customer list for picker ────────────────────────────────────────────────
  // const { data: customerData } = useCustomers({ limit: 200, sortBy: 'name', sortDir: 'asc' });
  const { data: customerData } = useCustomers({ sortBy: 'name', sortDir: 'asc' });
  const customers = customerData?.items ?? [];

  const selectedCustomerId = watch('customerId');
  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  // IGST proxy: form can't know seller state code; server recomputes definitively.
  // We use customer.gstType === 'export' as a safe heuristic for form preview.
  const applyIGST = selectedCustomer?.gstType === 'export';

  // ── Live totals ─────────────────────────────────────────────────────────────
  // const watchedItems = watch('items');
  const watchedItems = useWatch({ control, name: 'items' });
  const totals = useMemo(
    () => computeInvoiceTotals(watchedItems ?? [], applyIGST),
    [watchedItems, applyIGST],
  );

  // useEffect(() => {
  //   console.log('watchedItems==>', watchedItems)
  // }, [watchedItems])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="inv-form">
      {submitError && (
        <div className="alert alert-error inv-form__alert" role="alert">
          {getApiError(submitError)}
        </div>
      )}

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="card inv-form__header-card">
        <div className="inv-form__header-grid">

          {/* Customer */}
          <div className="form-group inv-form__customer-col">
            <label className="form-label">
              Bill to <span className="inv-form__req">*</span>
            </label>
            <select
              className={`form-select${errors.customerId ? ' form-select--error' : ''}`}
              disabled={isEdit}
              {...register('customerId')}
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}{c.gstin ? ` — ${c.gstin}` : ''}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="form-error">{errors.customerId.message}</p>}
            {selectedCustomer && (
              <div className="inv-form__customer-preview">
                {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                {selectedCustomer.billingAddress?.city && (
                  <span>
                    {selectedCustomer.billingAddress.city}
                    {selectedCustomer.billingAddress.state ? `, ${selectedCustomer.billingAddress.state}` : ''}
                  </span>
                )}
                {selectedCustomer.customerGstin && (
                  <span className="mono">{selectedCustomer.gstin}</span>
                )}
                <span className={`badge ${selectedCustomer.gstType === 'B2B' ? 'badge-info' : 'badge-neutral'}`}>
                  {selectedCustomer.gstType}
                </span>
              </div>
            )}
          </div>

          {/* Date fields */}
          <div className="inv-form__dates">
            <div className="form-group">
              <label className="form-label">
                Invoice date <span className="inv-form__req">*</span>
              </label>
              <input
                type="date"
                className={`form-input mono${errors.invoiceDate ? ' form-input--error' : ''}`}
                {...register('invoiceDate')}
              />
              {errors.invoiceDate && <p className="form-error">{errors.invoiceDate.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Due date</label>
              <input type="date" className="form-input mono" {...register('dueDate')} />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" {...register('status')}>
                {INVOICE_STATUSES.filter((s) => s !== 'overdue').map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Line items card ──────────────────────────────────────────────────── */}
      <div className="card inv-form__items-card">
        <div className="inv-form__items-heading">
          <h3 className="inv-form__section-title">Line items</h3>
          {errors.items?.root?.message && (
            <p className="form-error">{errors.items.root.message}</p>
          )}
          {typeof errors.items === 'object' && errors.items.message && (
            <p className="form-error">{errors.items.message}</p>
          )}
        </div>

        <div className="inv-form__items-list">
          {fields.map((field, index) => (
            <LineItemRow
              key={field.id}
              index={index}
              errors={errors.items?.[index]}
              register={register}
              setValue={setValue}
              watch={watch}
              onRemove={() => remove(index)}
              applyIGST={applyIGST}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary inv-form__add-row"
          onClick={() => append({ ...BLANK_ITEM })}
        >
          <PlusIcon /> Add line item
        </button>
      </div>

      {/* ── Bottom: notes + totals ───────────────────────────────────────────── */}
      <div className="inv-form__bottom">

        {/* Notes panel (left) */}
        <div className="card inv-form__notes-card">
          <h3 className="inv-form__section-title">Notes & Terms</h3>

          <div className="form-group">
            <label className="form-label">Customer notes</label>
            <textarea rows={3} className="form-textarea"
              placeholder="Thank you for your business!"
              {...register('notes')} />
          </div>

          <div className="form-group">
            <label className="form-label">Terms & conditions</label>
            <textarea rows={3} className="form-textarea"
              placeholder="Payment due within 30 days. Interest charged on overdue amounts."
              {...register('termsAndConditions')} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Internal notes <span className="text-tertiary">(not printed on invoice)</span>
            </label>
            <textarea rows={2} className="form-textarea"
              placeholder="Internal memo, follow-up notes…"
              {...register('internalNotes')} />
          </div>
        </div>

        {/* Totals panel (right) */}
        <div className="card inv-form__totals-card">
          <h3 className="inv-form__section-title">Summary</h3>
          <div className="inv-totals">

            <div className="inv-totals__row">
              <span>Subtotal (excl. GST)</span>
              <span className="mono">{fmt(totals.subtotal)}</span>
            </div>

            {!applyIGST ? (
              <>
                <div className="inv-totals__row">
                  <span>CGST</span>
                  <span className="mono">{fmt(totals.totalCgst)}</span>
                </div>
                <div className="inv-totals__row">
                  <span>SGST</span>
                  <span className="mono">{fmt(totals.totalSgst)}</span>
                </div>
              </>
            ) : (
              <div className="inv-totals__row">
                <span>IGST</span>
                <span className="mono">{fmt(totals.totalIgst)}</span>
              </div>
            )}

            <div className="inv-totals__row inv-totals__row--subtax">
              <span>Total tax</span>
              <span className="mono">{fmt(totals.totalTax)}</span>
            </div>

            <div className="inv-totals__row inv-totals__row--grand">
              <span>Grand total</span>
              <span className="mono">{fmt(totals.grandTotal)}</span>
            </div>

            <p className="inv-totals__igst-note">
              {applyIGST
                ? '⚠ IGST applies (export / inter-state)'
                : 'CGST + SGST applies (intra-state)'}
            </p>
            <p className="inv-totals__igst-note" style={{ marginTop: 2, fontSize: 'var(--text-xs)' }}>
              Server recomputes tax based on actual state codes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form actions ─────────────────────────────────────────────────────── */}
      <div className="inv-form__actions">
        <button type="button" className="btn btn-secondary"
          onClick={() => navigate(ROUTES.INVOICES)}
          disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary"
          disabled={isSubmitting || (isEdit && !isDirty)}>
          {isSubmitting
            ? <><span className="spinner spinner-sm" /> {isEdit ? 'Saving…' : 'Creating…'}</>
            : isEdit ? 'Save changes' : 'Create invoice'}
        </button>
      </div>
    </form>
  );
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export default InvoiceForm;
