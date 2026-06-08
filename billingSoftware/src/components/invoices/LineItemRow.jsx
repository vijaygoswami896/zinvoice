import { useState, useRef, useEffect } from 'react';
import { useProductSearch } from '@hooks/useProducts';
import { GST_RATE_OPTIONS, FLAT_UNITS } from '@constants';
import { computeLineItem } from '@/utils/tax';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import { FaTrash } from 'react-icons/fa6';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0);

/**
 * LineItemRow — a single editable invoice line.
 *
 * Two modes in one:
 *   A) Type in the name field → product search dropdown appears → select → fields auto-fill
 *   B) Type a custom name → fill all fields manually (productId stays null)
 *
 * Live tax computation runs on every field change using computeLineItem()
 * which mirrors the server's gstCalculator exactly.
 */
const LineItemRow = ({ index, errors, register, setValue, watch, onRemove, applyIGST, canRemove }) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dropdownRef = useRef(null);
  const p = `items.${index}`; // RHF field prefix

  // Watch only the fields needed for live computation
  const qty = watch(`${p}.quantity`) ?? 0;
  const rate = watch(`${p}.rate`) ?? 0;
  const gstRate = watch(`${p}.gstRate`) ?? 18;
  const taxIncluded = watch(`${p}.taxIncluded`) ?? false;
  const discountPct = watch(`${p}.discountPct`) ?? 0;

  const { taxableAmount, cgst, sgst, igst, lineTotal } = computeLineItem(
    { quantity: +qty, rate: +rate, gstRate: +gstRate, taxIncluded, discountPct: +discountPct },
    applyIGST,
  );

  // ── Product search ──────────────────────────────────────────────────────────
  const { data: results = [], isFetching: searching } = useProductSearch(query);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleProductSelect = (product) => {
    setValue(`${p}.productId`, product._id, { shouldDirty: true });
    setValue(`${p}.name`, product.name, { shouldDirty: true });
    setValue(`${p}.description`, product.description || '', { shouldDirty: true });
    setValue(`${p}.hsnSacCode`, product.hsnSacCode || '', { shouldDirty: true });
    setValue(`${p}.unit`, product.unit, { shouldDirty: true });
    setValue(`${p}.itemType`, product.type, { shouldDirty: true });
    setValue(`${p}.rate`, product.price, { shouldDirty: true });
    setValue(`${p}.gstRate`, product.gstRate, { shouldDirty: true, shouldValidate: true });
    setValue(`${p}.taxIncluded`, product.taxIncluded, { shouldDirty: true });
    setQuery('');
    setShowDropdown(false);
  };

  const taxLabel = applyIGST ? 'IGST' : 'CGST+SGST';
  const taxAmount = applyIGST ? igst : round2(cgst + sgst);

  return (
    <div className="li-row">
      {/* Row index + remove */}
      <div className="li-row__top">
        <span className="li-row__index">{index + 1}</span>

        {/* {canRemove && (
          <button type="button" className="btn btn-ghost btn-sm li-row__remove"
            onClick={onRemove} aria-label={`Remove item ${index + 1}`}>
            <TrashIcon />
          </button>
        )} */}

        {canRemove && (
          <>
            <button
              type="button"
              className="btn btn-ghost btn-sm li-row__remove"
              onClick={() => setShowConfirm(true)}
              aria-label={`Remove item ${index + 1}`}
            >
              {/* <TrashIcon /> */}
              <FaTrash />
            </button>

            <DeleteConfirmModal
              isOpen={showConfirm}
              title="Remove item?"
              description={`Item ${index + 1} will be removed from this invoice.`}
              confirmLabel="Remove"
              onConfirm={() => { onRemove(); setShowConfirm(false); }}
              onCancel={() => setShowConfirm(false)}
            />
          </>
        )}

      </div>

      {/* Name / product search */}
      <div className="li-row__name-wrap" ref={dropdownRef}>
        <div className="form-group li-row__name-field">
          <label className="form-label">
            Item / Service <span className="li-row__req">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className={`form-input${errors?.name ? ' form-input--error' : ''}`}
              placeholder="Search saved products or type a name…"
              autoComplete="off"
              {...register(`${p}.name`)}
              onChange={(e) => {
                register(`${p}.name`).onChange(e);
                // When user edits manually, unlink product reference
                setValue(`${p}.productId`, null);
                setQuery(e.target.value);
                setShowDropdown(e.target.value.length >= 1);
              }}
              onFocus={() => { if (query.length >= 1) setShowDropdown(true); }}
            />
            {searching && (
              <span className="li-row__search-spin spinner spinner-sm" aria-hidden="true" />
            )}
          </div>
          {errors?.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        {/* Search results dropdown */}
        {showDropdown && results.length > 0 && (
          <div className="li-row__dropdown" role="listbox" aria-label="Product suggestions">
            {results.map((prod) => (
              <button
                key={prod._id}
                type="button"
                className="li-row__dropdown-item"
                onMouseDown={() => handleProductSelect(prod)}
                role="option"
              >
                <span className="li-row__dp-name">{prod.name}</span>
                <span className="li-row__dp-meta">
                  {prod.type === 'goods' ? '📦' : '⚙️'} {prod.unit}
                  {' · '}₹{fmt(prod.price)}
                  {' · '}{prod.gstRate}% GST
                  {prod.hsnSacCode ? ` · ${prod.hsnSacCode}` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HSN / Description */}
      <div className="li-row__meta">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">HSN / SAC</label>
          <input type="text" className="form-input mono" placeholder="8471" maxLength={8}
            {...register(`${p}.hsnSacCode`)} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <label className="form-label">Description</label>
          <input type="text" className="form-input" placeholder="Optional"
            {...register(`${p}.description`)} />
        </div>
      </div>

      {/* Numbers grid: qty | rate | discount | gst% | unit */}
      <div className="li-row__numbers">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Qty <span className="li-row__req">*</span></label>
          <input type="number" step="1" min="0"
            className={`form-input mono${errors?.quantity ? ' form-input--error' : ''}`}
            placeholder="1"
            {...register(`${p}.quantity`, { valueAsNumber: true })}
          />
          {errors?.quantity && <p className="form-error">{errors.quantity.message}</p>}
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Rate (₹) <span className="li-row__req">*</span></label>
          <div className="li-row__rate-wrap">
            <span className="li-row__rupee" aria-hidden="true">₹</span>
            {/* <input type="number" step="0.01" min="0" */}
            <input type="number" min="0"
              className={`form-input mono li-row__rate-input${errors?.rate ? ' form-input--error' : ''}`}
              placeholder="0.00"
              {...register(`${p}.rate`, { valueAsNumber: true })}
            />
          </div>
          {errors?.rate && <p className="form-error">{errors.rate.message}</p>}
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Disc %</label>
          <input type="number" step="0.01" min="0" max="100"
            className="form-input mono" placeholder="0"
            {...register(`${p}.discountPct`, { valueAsNumber: true })} />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">GST % <span className="li-row__req">*</span></label>
          <select
            className={`form-select mono${errors?.gstRate ? ' form-select--error' : ''}`}
            {...register(`${p}.gstRate`, { valueAsNumber: true })}
          >
            {GST_RATE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Unit</label>
          <select className="form-select" {...register(`${p}.unit`)}>
            {FLAT_UNITS.map(({ value }) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax-inclusive toggle */}
      <label className="li-row__tax-toggle">
        <input type="checkbox" {...register(`${p}.taxIncluded`)} />
        <span>Rate is tax-inclusive</span>
      </label>

      {/* Live computed totals */}
      <div className="li-row__computed">
        <div className="li-row__computed-item">
          <span className="li-row__computed-label">Taxable</span>
          <span className="li-row__computed-val">₹{fmt(taxableAmount)}</span>
        </div>
        <div className="li-row__computed-item">
          <span className="li-row__computed-label">{taxLabel}</span>
          <span className="li-row__computed-val">₹{fmt(taxAmount)}</span>
        </div>
        <div className="li-row__computed-item li-row__computed-item--total">
          <span className="li-row__computed-label">Line total</span>
          <span className="li-row__computed-val li-row__computed-val--bold">₹{fmt(lineTotal)}</span>
        </div>
      </div>

      {/* Hidden RHF fields */}
      <input type="hidden" {...register(`${p}.productId`)} />
      <input type="hidden" {...register(`${p}.itemType`)} />
    </div>
  );
};

// Helper needed in component (not imported from schema to keep component self-contained)
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// const TrashIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6M9 6V4h6v2" />
//   </svg>
// );

export default LineItemRow;
