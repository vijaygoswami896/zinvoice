import { useFormContext } from 'react-hook-form';
import { Field } from '@components/settings/Field';
import { INDIAN_STATES } from '@/constants';

const AddressSection = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <section aria-label="Registered address">
            <div className="settings-section-title">Registered Address</div>
            <p className="settings-section-desc">
                Used on invoices as your business address. Must match your GST registration.
            </p>
            <div className="settings-grid">

                <Field label="Address line 1" error={errors.address?.line1}>
                    <input type="text" className="form-input" placeholder="Building / street"
                        {...register('address.line1')} />
                </Field>

                <Field label="Address line 2" error={errors.address?.line2}>
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
                    <input type="text"
                        className={`form-input mono${errors.address?.pincode ? ' form-input--error' : ''}`}
                        placeholder="400001" maxLength={6}
                        {...register('address.pincode')} />
                </Field>

                <Field label="Country" error={errors.address?.country}>
                    <input type="text" className="form-input" defaultValue="India"
                        {...register('address.country')} />
                </Field>

            </div>
        </section>
    );
};

export default AddressSection;