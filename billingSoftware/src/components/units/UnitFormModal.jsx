import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateUnit, useUpdateUnit } from '@hooks/useUnits.js';
import styles from '@styles/UnitFormModal.module.css';

export default function UnitFormModal({ unit, onClose }) {
    const isEdit = Boolean(unit);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { name: '', shortName: '' },
    });

    // Populate form when editing
    useEffect(() => {
        if (unit) reset({ name: unit.name, shortName: unit.shortName });
        else reset({ name: '', shortName: '' });
    }, [unit, reset]);

    const create = useCreateUnit();
    const update = useUpdateUnit();
    const isPending = create.isPending || update.isPending;

    const onSubmit = async (values) => {
        try {
            if (isEdit && unit) {
                await update.mutateAsync({ id: unit._id, payload: values });
            } else {
                await create.mutateAsync(values);
            }
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Something went wrong';
            // Surface duplicate errors on the right field
            if (msg.toLowerCase().includes('short name')) {
                setError('shortName', { message: msg });
            } else if (msg.toLowerCase().includes('name')) {
                setError('name', { message: msg });
            } else {
                setError('root', { message: msg });
            }
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                <div className={styles.header}>
                    <h3>{isEdit ? 'Edit Unit' : 'New Unit'}</h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className={styles.body}>

                        {errors.root && (
                            <p className={styles.rootError}>{errors.root.message}</p>
                        )}

                        <div className={styles.field}>
                            <label htmlFor="unit-name">Unit Name</label>
                            <input
                                id="unit-name"
                                type="text"
                                placeholder="e.g. Kilogram"
                                autoComplete="off"
                                {...register('name', {
                                    required: 'Unit name is required',
                                    maxLength: { value: 50, message: 'Max 50 characters' },
                                })}
                            />
                            {errors.name && (
                                <span className={styles.error}>{errors.name.message}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="unit-short">Short Name</label>
                            <input
                                id="unit-short"
                                type="text"
                                placeholder="e.g. kg"
                                autoComplete="off"
                                {...register('shortName', {
                                    required: 'Short name is required',
                                    maxLength: { value: 10, message: 'Max 10 characters' },
                                })}
                            />
                            <span className={styles.hint}>
                                Shown on invoices. Stored in lowercase.
                            </span>
                            {errors.shortName && (
                                <span className={styles.error}>{errors.shortName.message}</span>
                            )}
                        </div>

                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isPending || isSubmitting}
                        >
                            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Unit'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}