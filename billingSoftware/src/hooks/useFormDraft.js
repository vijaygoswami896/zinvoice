// @hooks/useFormDraft.js
import { useCallback, useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 500;

/**
 * useFormDraft
 *
 * Persists a react-hook-form's values to sessionStorage so an accidental
 * refresh or tab navigation doesn't lose in-progress input, and restores them
 * on mount.
 *
 * @param {object}   params
 * @param {string}   params.storageKey - sessionStorage key.
 * @param {boolean}  params.enabled    - Inactive when false (e.g. edit mode).
 * @param {Function} params.watch      - RHF's `watch` from useForm().
 * @param {Function} params.reset      - RHF's `reset` from useForm().
 * @param {Function} params.getValues  - RHF's `getValues` from useForm().
 * @returns {{
 *   clearDraft: () => void,
 *   hasRestoredDraft: boolean,
 *   setHasRestoredDraft: (val: boolean) => void,
 * }}
 */
export function useFormDraft({ storageKey, enabled, watch, reset, getValues }) {
    const timeoutRef = useRef(null);
    const restoredRef = useRef(false);

    // Lazy initialization: reads sessionStorage on frame 1.
    // Avoids cascading re-renders and eliminates synchronous setState in effects.
    const [hasRestoredDraft, setHasRestoredDraft] = useState(() => {
        if (!enabled || typeof window === 'undefined') return false;
        try {
            const raw = window.sessionStorage.getItem(storageKey);
            if (!raw) return false;
            JSON.parse(raw);
            return true;
        } catch {
            try {
                window.sessionStorage.removeItem(storageKey);
            } catch {
                /* noop */
            }
            return false;
        }
    });

    // Keep a ref to getValues so listeners and timeouts always access
    // the latest instance without triggering effect re-subscriptions.
    const getValuesRef = useRef(getValues);
    useEffect(() => {
        getValuesRef.current = getValues;
    }, [getValues]);

    // ── 1) Restore draft once on mount ─────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return undefined;

        try {
            const raw = window.sessionStorage.getItem(storageKey);
            if (raw) {
                const draft = JSON.parse(raw);
                reset(draft, { keepDefaultValues: true });
            }
        } catch {
            // Corrupt JSON or storage unavailable — clean up rather than throwing
            try {
                window.sessionStorage.removeItem(storageKey);
            } catch {
                /* noop */
            }
        } finally {
            restoredRef.current = true;
        }

        return undefined;
    }, [enabled, storageKey, reset]);

    // ── 2) Debounced autosave + flush on component unmount ─────────────────────
    useEffect(() => {
        if (!enabled) return undefined;

        const subscription = watch((values) => {
            if (!restoredRef.current) return; // avoid racing initial restore
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                try {
                    const currentValues = getValuesRef.current ? getValuesRef.current() : values;
                    window.sessionStorage.setItem(storageKey, JSON.stringify(currentValues));
                } catch {
                    // Storage quota full or unavailable
                }
            }, DEBOUNCE_MS);
        });

        return () => {
            subscription.unsubscribe();
            // If a save was pending when unmounting (e.g. sidebar navigation),
            // flush it immediately so the last keystrokes are preserved.
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                try {
                    if (getValuesRef.current) {
                        window.sessionStorage.setItem(storageKey, JSON.stringify(getValuesRef.current()));
                    }
                } catch {
                    /* noop */
                }
            }
        };
    }, [enabled, storageKey, watch]);

    // ── 3) Immediate flush on beforeunload (F5 / reload / close) ───────────────
    useEffect(() => {
        if (!enabled) return undefined;

        const handleBeforeUnload = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            try {
                if (getValuesRef.current) {
                    window.sessionStorage.setItem(storageKey, JSON.stringify(getValuesRef.current()));
                }
            } catch {
                /* noop */
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [enabled, storageKey]);

    // ── 4) Clear draft helper ──────────────────────────────────────────────────
    const clearDraft = useCallback(() => {
        if (!enabled) return;

        // 1. Cancel any pending debounce timer and nullify it
        // so unmount cleanup doesn't flush it back into storage
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        try {
            window.sessionStorage.removeItem(storageKey);
        } catch {
            /* noop */
        }
        setHasRestoredDraft(false);
    }, [enabled, storageKey]);

    return { clearDraft, hasRestoredDraft, setHasRestoredDraft };
}

export default useFormDraft;