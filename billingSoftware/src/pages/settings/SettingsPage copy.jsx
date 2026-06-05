import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageTitle } from '@hooks/usePageTitle';
import {
  useSettings,
  useUpdateSettings,
  useUploadLogo,
  useUploadSignature,
  useDeleteLogo,
  useDeleteSignature,
} from '@hooks/useSettings';
import { SettingsFormSchema } from '@schemas/settings.schema.client';
import ImageUpload from '@components/settings/ImageUpload';
import { INDIAN_STATES } from '@/constants';
import '@styles/SettingsPage.css';
import TemplatePickerSection from '@/features/settings/TemplatePickerSection';

// ── Section tab config ────────────────────────────────────────────────────────

const TABS = [
  { id: 'business', label: 'Business', icon: '🏢' },
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'bank', label: 'Bank Details', icon: '🏦' },
  { id: 'invoice', label: 'Invoice', icon: '📄' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
];

// ── Helper ────────────────────────────────────────────────────────────────────

const getApiError = (err) =>
  err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

const Field = ({ label, error, children, hint, required }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span className="settings-required">*</span>}
    </label>
    {children}
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="form-error">{error.message}</p>}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  usePageTitle('Settings');

  const [activeTab, setActiveTab] = useState('business');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [sigProgress, setSigProgress] = useState(0);

  const { data: settingsData, isLoading, isError } = useSettings();
  const { settings } = settingsData ?? {};

  const updateMutation = useUpdateSettings();
  const uploadLogoMutation = useUploadLogo();
  const uploadSigMutation = useUploadSignature();
  const deleteLogoMutation = useDeleteLogo();
  const deleteSigMutation = useDeleteSignature();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      businessName: '',
      legalName: '',
      gstin: '',
      pan: '',
      gstRegistrationType: 'regular',
      email: '',
      phone: '',
      website: '',
      address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
      bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '', branch: '', upiId: '' },
      invoicePrefix: 'INV',
      invoiceNotes: '',
      invoiceTerms: '',
      defaultDueDays: 30,
    },
  });

  // Populate form once data loads
  useEffect(() => {

    if (settings) {
      // const { settings } = settings;
      console.log("settings==>", settings);
      console.log("settings.businessName==>", settings.businessName);

      // const { setting: { settings } } = yourData;

      reset({
        businessName: settings.businessName ?? '',
        legalName: settings.legalName ?? '',
        gstin: settings.gstin ?? '',
        pan: settings.pan ?? '',
        gstRegistrationType: settings.gstRegistrationType ?? 'regular',
        email: settings.email ?? '',
        phone: settings.phone ?? '',
        website: settings.website ?? '',
        address: {
          line1: settings.address?.line1 ?? '',
          line2: settings.address?.line2 ?? '',
          city: settings.address?.city ?? '',
          state: settings.address?.state ?? '',
          pincode: settings.address?.pincode ?? '',
          country: settings.address?.country ?? 'India',
        },
        bankDetails: {
          bankName: settings.bankDetails?.bankName ?? '',
          accountName: settings.bankDetails?.accountName ?? '',
          accountNumber: settings.bankDetails?.accountNumber ?? '',
          ifscCode: settings.bankDetails?.ifscCode ?? '',
          branch: settings.bankDetails?.branch ?? '',
          upiId: settings.bankDetails?.upiId ?? '',
        },
        invoicePrefix: settings.invoicePrefix ?? 'INV',
        invoiceNotes: settings.invoiceNotes ?? '',
        invoiceTerms: settings.invoiceTerms ?? '',
        defaultDueDays: settings.defaultDueDays ?? 30,
      });
    }
  }, [settings, reset]);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch { /* error surfaced via mutation.error */ }
  };

  // ── Upload handlers ─────────────────────────────────────────────────────────

  const handleLogoUpload = (file) => {
    setLogoProgress(0);
    uploadLogoMutation.mutate({ file, onProgress: setLogoProgress });
  };
  const handleSigUpload = (file) => {
    setSigProgress(0);
    uploadSigMutation.mutate({ file, onProgress: setSigProgress });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="settings-loading">
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error" style={{ maxWidth: 480, margin: '40px auto' }}>
        Failed to load settings. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your business profile and invoice defaults.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!isDirty || updateMutation.isPending}
            onClick={() => reset()}
          >
            Discard
          </button>
          <button
            type="submit"
            form="settings-form"
            className="btn btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? <><span className="spinner spinner-sm" /> Saving…</>
              : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Success / error banners */}
      {saveSuccess && (
        <div className="alert alert-success settings-banner" role="status">
          Settings saved successfully.
        </div>
      )}
      {updateMutation.isError && (
        <div className="alert alert-error settings-banner" role="alert">
          {getApiError(updateMutation.error)}
        </div>
      )}

      <div className="settings-layout">
        {/* Tab sidebar */}
        <nav className="settings-tabs" aria-label="Settings sections">
          {TABS.map((tab) => (
            // <button
            //   key={tab.id}
            //   type="button"
            //   className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
            //   onClick={() => setActiveTab(tab.id)}
            //   aria-current={activeTab === tab.id ? 'page' : undefined}
            // >
            //   <span className="settings-tab-icon" aria-hidden="true">{tab.icon}</span>
            //   <span>{tab.label}</span>
            // </button>

            <button
              key={tab.id}
              type="button"
              className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.label}
            >
              <span className="settings-tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="settings-tab-label">{tab.label}</span>
            </button>

          ))}
        </nav>

        {/* Form panels */}
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} noValidate className="settings-form">

          {/* ── Business identity ─────────────────────────────────────────── */}
          <section hidden={activeTab !== 'business'} aria-label="Business identity">
            <div className="settings-section-title">Business Identity</div>

            <div className="settings-grid">
              <Field label="Business name" error={errors.businessName} required>
                <input
                  type="text" autoComplete="organization"
                  className={`form-input${errors.businessName ? ' form-input--error' : ''}`}
                  placeholder="Acme Pvt. Ltd."
                  {...register('businessName')}
                />
              </Field>

              <Field label="Legal name" error={errors.legalName} hint="If different from display name">
                <input type="text" className="form-input" placeholder="Acme Private Limited"
                  {...register('legalName')} />
              </Field>

              <Field label="GSTIN" error={errors.gstin} hint="15-character GST Identification Number">
                <input
                  type="text" className={`form-input mono${errors.gstin ? ' form-input--error' : ''}`}
                  placeholder="27AAPFU0939F1ZV"
                  maxLength={15}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  {...register('gstin')}
                />
              </Field>

              <Field label="PAN" error={errors.pan}>
                <input
                  type="text" className={`form-input mono${errors.pan ? ' form-input--error' : ''}`}
                  placeholder="AAPFU0939F" maxLength={10}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  {...register('pan')}
                />
              </Field>

              <Field label="GST registration type" error={errors.gstRegistrationType}>
                <select className="form-select" {...register('gstRegistrationType')}>
                  <option value="regular">Regular taxpayer</option>
                  <option value="composition">Composition scheme</option>
                  <option value="unregistered">Unregistered</option>
                </select>
              </Field>

              <Field label="Business email" error={errors.email}>
                <input type="email" className={`form-input${errors.email ? ' form-input--error' : ''}`}
                  placeholder="billing@acme.com" {...register('email')} />
              </Field>

              <Field label="Phone" error={errors.phone} hint="10-digit Indian mobile number">
                <input
                  type="tel" className={`form-input${errors.phone ? ' form-input--error' : ''}`}
                  placeholder="9876543210" maxLength={10}
                  {...register('phone')}
                />
              </Field>

              <Field label="Website" error={errors.website}>
                <input type="url" className="form-input" placeholder="https://acme.com"
                  {...register('website')} />
              </Field>
            </div>
          </section>

          {/* ── Address ───────────────────────────────────────────────────── */}
          <section hidden={activeTab !== 'address'} aria-label="Registered address">
            <div className="settings-section-title">Registered Address</div>
            <p className="settings-section-desc">
              Used on invoices as your business address. Must match your GST registration.
            </p>

            <div className="settings-grid">
              <Field label="Address line 1" error={errors.address?.line1}
                style={{ gridColumn: '1 / -1' }}>
                <input type="text" className="form-input" placeholder="Building / street"
                  {...register('address.line1')} />
              </Field>

              <Field label="Address line 2" error={errors.address?.line2}
                style={{ gridColumn: '1 / -1' }}>
                <input type="text" className="form-input" placeholder="Area / landmark"
                  {...register('address.line2')} />
              </Field>

              <Field label="City" error={errors.address?.city}>
                <input type="text" className="form-input" placeholder="Mumbai"
                  {...register('address.city')} />
              </Field>

              <Field label="State" error={errors.address?.state}>
                <select className={`form-select${errors.address?.state ? ' form-select--error' : ''}`}
                  {...register('address.state')}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Pincode" error={errors.address?.pincode}>
                <input type="text" className={`form-input mono${errors.address?.pincode ? ' form-input--error' : ''}`}
                  placeholder="400001" maxLength={6} {...register('address.pincode')} />
              </Field>

              <Field label="Country" error={errors.address?.country}>
                <input type="text" className="form-input" defaultValue="India"
                  {...register('address.country')} />
              </Field>
            </div>
          </section>

          {/* ── Bank details ─────────────────────────────────────────────── */}
          <section hidden={activeTab !== 'bank'} aria-label="Bank details">
            <div className="settings-section-title">Bank Details</div>
            <p className="settings-section-desc">
              Printed on invoices to help customers make direct bank transfers.
            </p>

            <div className="settings-grid">
              <Field label="Bank name" error={errors.bankDetails?.bankName}>
                <input type="text" className="form-input" placeholder="State Bank of India"
                  {...register('bankDetails.bankName')} />
              </Field>

              <Field label="Account holder name" error={errors.bankDetails?.accountName}>
                <input type="text" className="form-input" placeholder="Acme Pvt. Ltd."
                  {...register('bankDetails.accountName')} />
              </Field>

              <Field label="Account number" error={errors.bankDetails?.accountNumber}>
                <input
                  type="text"
                  className={`form-input mono${errors.bankDetails?.accountNumber ? ' form-input--error' : ''}`}
                  placeholder="00000012345678"
                  {...register('bankDetails.accountNumber')}
                />
              </Field>

              <Field label="IFSC code" error={errors.bankDetails?.ifscCode}>
                <input
                  type="text"
                  className={`form-input mono${errors.bankDetails?.ifscCode ? ' form-input--error' : ''}`}
                  placeholder="SBIN0001234" maxLength={11}
                  style={{ textTransform: 'uppercase' }}
                  {...register('bankDetails.ifscCode')}
                />
              </Field>

              <Field label="Branch" error={errors.bankDetails?.branch}>
                <input type="text" className="form-input" placeholder="Fort Branch, Mumbai"
                  {...register('bankDetails.branch')} />
              </Field>

              <Field label="UPI ID" error={errors.bankDetails?.upiId}
                hint="Optional — shown as a payment shortcut on invoices">
                <input type="text" className="form-input" placeholder="acme@upi"
                  {...register('bankDetails.upiId')} />
              </Field>
            </div>
          </section>

          {/* ── Invoice defaults ─────────────────────────────────────────── */}
          <section hidden={activeTab !== 'invoice'} aria-label="Invoice defaults">
            <div className="settings-section-title">Invoice Defaults</div>

            <div className="settings-grid">
              <Field label="Invoice prefix" error={errors.invoicePrefix}
                hint="Invoices will be numbered: INV-2026-0001">
                <div className="settings-prefix-row">
                  <input
                    type="text"
                    className={`form-input mono${errors.invoicePrefix ? ' form-input--error' : ''}`}
                    placeholder="INV" maxLength={10}
                    style={{ width: 120, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    {...register('invoicePrefix')}
                  />
                  <span className="settings-prefix-preview">-2026-0001</span>
                </div>
              </Field>

              <TemplatePickerSection />

              <Field label="Default payment due (days)" error={errors.defaultDueDays}>
                <input
                  type="number" min={0} max={365}
                  className={`form-input mono${errors.defaultDueDays ? ' form-input--error' : ''}`}
                  style={{ width: 100 }}
                  {...register('defaultDueDays')}
                />
              </Field>
            </div>

            <Field label="Default invoice notes" error={errors.invoiceNotes}
              hint="Shown at the bottom of every invoice (e.g. 'Thank you for your business')">
              <textarea
                rows={3}
                className={`form-textarea${errors.invoiceNotes ? ' form-textarea--error' : ''}`}
                placeholder="Thank you for your business!"
                {...register('invoiceNotes')}
              />
            </Field>

            <Field label="Payment terms & conditions" error={errors.invoiceTerms}
              hint="Shown on invoices (e.g. late payment policy)">
              <textarea
                rows={5}
                className={`form-textarea${errors.invoiceTerms ? ' form-textarea--error' : ''}`}
                placeholder="Payment is due within 30 days. Interest at 2% per month on overdue amounts."
                {...register('invoiceTerms')}
              />
            </Field>
          </section>

          {/* ── Branding ─────────────────────────────────────────────────── */}
          <section hidden={activeTab !== 'branding'} aria-label="Branding">
            <div className="settings-section-title">Branding</div>
            <p className="settings-section-desc">
              Your logo and signature appear on generated PDF invoices.
              Recommended: transparent PNG, max 2 MB.
            </p>

            <div className="settings-uploads">
              <div className="settings-upload-item">
                <ImageUpload
                  label="Company logo"
                  fieldName="logo"
                  currentUrl={settings?.logo?.url}
                  onUpload={handleLogoUpload}
                  onDelete={() => deleteLogoMutation.mutate()}
                  isUploading={uploadLogoMutation.isPending}
                  isDeleting={deleteLogoMutation.isPending}
                  progress={logoProgress}
                  error={uploadLogoMutation.isError ? getApiError(uploadLogoMutation.error) : ''}
                  hint="Appears top-left of your invoice. Transparent PNG preferred."
                />
                {settings?.logo && (
                  <p className="settings-file-meta">
                    {settings.logo.originalName} &middot;{' '}
                    {(settings.logo.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>

              <div className="settings-upload-item">
                <ImageUpload
                  label="Authorised signature"
                  fieldName="signature"
                  currentUrl={settings?.signature?.url}
                  onUpload={handleSigUpload}
                  onDelete={() => deleteSigMutation.mutate()}
                  isUploading={uploadSigMutation.isPending}
                  isDeleting={deleteSigMutation.isPending}
                  progress={sigProgress}
                  error={uploadSigMutation.isError ? getApiError(uploadSigMutation.error) : ''}
                  hint="Printed on the invoice footer. Use a dark ink on white/transparent background."
                />
                {settings?.signature && (
                  <p className="settings-file-meta">
                    {settings.signature.originalName} &middot;{' '}
                    {(settings.signature.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
