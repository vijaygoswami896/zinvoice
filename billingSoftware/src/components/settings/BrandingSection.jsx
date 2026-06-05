import ImageUpload from '@components/settings/ImageUpload';

const BrandingSection = ({
    settings,
    onLogoUpload, onSigUpload,
    onLogoDelete, onSigDelete,
    logoUploading, sigUploading,
    logoDeleting, sigDeleting,
    logoProgress, sigProgress,
    logoError, sigError,
}) => (
    <section aria-label="Branding">
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
                    onUpload={onLogoUpload}
                    onDelete={onLogoDelete}
                    isUploading={logoUploading}
                    isDeleting={logoDeleting}
                    progress={logoProgress}
                    error={logoError}
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
                    onUpload={onSigUpload}
                    onDelete={onSigDelete}
                    isUploading={sigUploading}
                    isDeleting={sigDeleting}
                    progress={sigProgress}
                    error={sigError}
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
);

export default BrandingSection;