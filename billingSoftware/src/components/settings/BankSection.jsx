import { useFormContext } from 'react-hook-form';
import { Field } from '@components/settings/Field';

const BankSection = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <section aria-label="Bank details">
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
    );
};

export default BankSection;