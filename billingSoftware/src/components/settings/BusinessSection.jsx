import { useFormContext } from 'react-hook-form';
import { Field } from '@components/settings/Field';

const BusinessSection = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <section aria-label="Business identity">
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

                <Field label="Tag Line" error={errors.tagLine} hint="Type your tag line">
                    <input type="text" className="form-input" placeholder="your business tag line"
                        {...register('tagLine')} />
                </Field>

                <Field label="GSTIN" error={errors.gstin} hint="15-character GST Identification Number">
                    <input
                        type="text" className={`form-input mono${errors.gstin ? ' form-input--error' : ''}`}
                        placeholder="27AAPFU0939F1ZV" maxLength={15}
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
    );
};

export default BusinessSection;