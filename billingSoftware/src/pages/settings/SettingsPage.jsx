import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageTitle } from '@hooks/usePageTitle';
import {
  useSettings, useUpdateSettings,
  useUploadLogo, useUploadSignature,
  useDeleteLogo, useDeleteSignature,
} from '@hooks/useSettings';
import { SettingsFormSchema } from '@schemas/settings.schema.client';
import BusinessSection from '@components/settings/BusinessSection';
import AddressSection from '@components/settings/AddressSection';
import BankSection from '@components/settings/BankSection';
import InvoiceSection from '@components/settings/InvoiceSection';
import BrandingSection from '@components/settings/BrandingSection';
import '@styles/SettingsPage.css';

const TABS = [
  { id: 'business', label: 'Business', icon: '🏢' },
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'bank', label: 'Bank Details', icon: '🏦' },
  { id: 'invoice', label: 'Invoice', icon: '📄' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
];

const getApiError = (err) =>
  err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

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

  const methods = useForm({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      businessName: '', legalName: '', gstin: '', pan: '',
      gstRegistrationType: 'regular',
      email: '', phone: '', website: '',
      address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
      bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '', branch: '', upiId: '' },
      invoicePrefix: 'INV', invoiceNotes: '', invoiceTerms: '', defaultDueDays: 30,
      invoiceTemplate: 'classic', showGstBreakdown: true,
    },
  });

  const { handleSubmit, reset, formState: { isDirty } } = methods;

  useEffect(() => {
    if (settings) {
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
        invoiceTemplate: settings.invoiceTemplate ?? 'classic',
        showGstBreakdown: settings.showGstBreakdown ?? true,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch { /* surfaced via mutation.error */ }
  };

  const handleLogoUpload = (file) => { setLogoProgress(0); uploadLogoMutation.mutate({ file, onProgress: setLogoProgress }); };
  const handleSigUpload = (file) => { setSigProgress(0); uploadSigMutation.mutate({ file, onProgress: setSigProgress }); };

  if (isLoading) return <div className="settings-loading"><span className="spinner spinner-lg" /></div>;
  if (isError) return <div className="alert alert-error" style={{ maxWidth: 480, margin: '40px auto' }}>Failed to load settings. Please refresh the page.</div>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your business profile and invoice defaults.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary"
            disabled={!isDirty || updateMutation.isPending}
            onClick={() => reset()}>
            Discard
          </button>
          <button type="submit" form="settings-form" className="btn btn-primary"
            disabled={updateMutation.isPending}>
            {updateMutation.isPending
              ? <><span className="spinner spinner-sm" /> Saving…</>
              : 'Save changes'}
          </button>
        </div>
      </div>

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
        <nav className="settings-tabs" aria-label="Settings sections">
          {TABS.map((tab) => (
            <button
              key={tab.id} type="button"
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

        <FormProvider {...methods}>
          <form id="settings-form" onSubmit={handleSubmit(onSubmit)} noValidate className="settings-form">
            {activeTab === 'business' && <BusinessSection />}
            {activeTab === 'address' && <AddressSection />}
            {activeTab === 'bank' && <BankSection />}
            {activeTab === 'invoice' && <InvoiceSection />}
            {activeTab === 'branding' && (
              <BrandingSection
                settings={settings}
                onLogoUpload={handleLogoUpload}
                onSigUpload={handleSigUpload}
                onLogoDelete={() => deleteLogoMutation.mutate()}
                onSigDelete={() => deleteSigMutation.mutate()}
                logoUploading={uploadLogoMutation.isPending}
                sigUploading={uploadSigMutation.isPending}
                logoDeleting={deleteLogoMutation.isPending}
                sigDeleting={deleteSigMutation.isPending}
                logoProgress={logoProgress}
                sigProgress={sigProgress}
                logoError={uploadLogoMutation.isError ? getApiError(uploadLogoMutation.error) : ''}
                sigError={uploadSigMutation.isError ? getApiError(uploadSigMutation.error) : ''}
              />
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default SettingsPage;