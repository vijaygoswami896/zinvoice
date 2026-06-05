import { useFormContext } from 'react-hook-form';
import { Field } from '@components/settings/Field';
import TemplatePickerSection from '@components/settings/TemplatePickerSection';

const InvoiceSection = () => {
    const { register, formState: { errors } } = useFormContext(); // ← watch/setValue gone

    return (
        <section aria-label="Invoice defaults">
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

                <TemplatePickerSection /> {/* ← no props at all */}

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
                <textarea rows={3}
                    className={`form-textarea${errors.invoiceNotes ? ' form-textarea--error' : ''}`}
                    placeholder="Thank you for your business!"
                    {...register('invoiceNotes')}
                />
            </Field>

            <Field label="Payment terms & conditions" error={errors.invoiceTerms}
                hint="Shown on invoices (e.g. late payment policy)">
                <textarea rows={5}
                    className={`form-textarea${errors.invoiceTerms ? ' form-textarea--error' : ''}`}
                    placeholder="Payment is due within 30 days. Interest at 2% per month on overdue amounts."
                    {...register('invoiceTerms')}
                />
            </Field>
        </section>
    );
};

export default InvoiceSection;