import { useState, useRef, useEffect, useId } from 'react';

import { useAllUnits } from '@hooks/useUnits.js';
import styles from '@styles/UnitPicker.module.css';

export default function UnitPicker({
    valueKey,
    value,
    onChange,
    placeholder = 'Select unit',
    disabled = false,
    error,
    label,
    required,
}) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const { data, isLoading } = useAllUnits();
    const units = data?.items ?? [];

    // Resolve display label from current value
    const selected = units.find((u) => u[valueKey] === value) ?? null;

    // Filter by search
    const filtered = search.trim()
        ? units.filter(
            (u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.shortName.toLowerCase().includes(search.toLowerCase()),
        )
        : units;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const handleSelect = (unit) => {
        onChange(unit[valueKey]);
        setOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={styles.wrapper} ref={containerRef}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <button
                id={id}
                type="button"
                className={`${styles.trigger} ${error ? styles.triggerError : ''} ${open ? styles.triggerOpen : ''}`}
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {isLoading ? (
                    <span className={styles.placeholder}>Loading…</span>
                ) : selected ? (
                    <span className={styles.selectedValue}>
                        <span className={styles.selectedName}>{selected.name}</span>
                        <span className={styles.selectedShort}>{selected.shortName}</span>
                    </span>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}

                <span className={styles.triggerActions}>
                    {value && !disabled && (
                        <span
                            className={styles.clearBtn}
                            onClick={handleClear}
                            role="button"
                            aria-label="Clear"
                        >
                            ✕
                        </span>
                    )}
                    <span className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}>▾</span>
                </span>
            </button>

            {open && (
                <div className={styles.dropdown} role="listbox">
                    <div className={styles.searchWrap}>
                        <input
                            ref={searchRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search units…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ul className={styles.list}>
                        {filtered.length === 0 ? (
                            <li className={styles.empty}>No units found</li>
                        ) : (
                            filtered.map((unit) => (
                                <li
                                    key={unit._id}
                                    role="option"
                                    aria-selected={unit[valueKey] === value}
                                    className={`${styles.option} ${unit[valueKey] === value ? styles.optionSelected : ''}`}
                                    onClick={() => handleSelect(unit)}
                                >
                                    <span className={styles.optionName}>{unit.name}</span>
                                    <span className={styles.optionShort}>{unit.shortName}</span>
                                    {unit.isDefault && (
                                        <span className={styles.defaultBadge}>default</span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && <span className={styles.errorMsg}>{error}</span>}
        </div>
    );
}