// @hooks/useUnsavedChangesGuard.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useUnsavedChangesGuard
 *
 * Protects a dirty form against three kinds of accidental data loss:
 *
 *   1. Refresh / close tab            -> native `beforeunload` prompt
 *   2. Browser or mobile Back button  -> intercepted via a single history
 *                                         "buffer" entry + the confirm modal
 *   3. In-app navigation (Cancel etc.)-> call `guardedNavigate(path)`
 *                                         instead of react-router's `navigate`
 *
 * Fully inert (no listeners, no history writes) whenever `isDirty` is false.
 * Built for classic <BrowserRouter> (react-router-dom v6, non-data-router
 * mode), where `useBlocker` / `usePrompt` are not available.
 *
 * Stack hygiene: repeated Back-then-Cancel cycles do NOT grow the history
 * stack (we restore the buffer entry with `history.go(1)` rather than
 * pushing a new one each time), and a successful save can hand off via
 * `releaseAndNavigate(path)` so the buffer entry is collapsed away instead
 * of left behind as a dead duplicate.
 *
 * @param {boolean} isDirty
 * @returns {{
 *   isConfirmOpen: boolean,
 *   confirmLeave: () => void,
 *   cancelLeave: () => void,
 *   guardedNavigate: (path: string) => void,
 *   releaseAndNavigate: (path: string) => void,
 * }}
 */
export function useUnsavedChangesGuard(isDirty) {
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // True while effect #2 currently has an extra "buffer" entry pushed
    // above the page's natural history entry.
    const bufferActiveRef = useRef(false);

    // Number of upcoming popstate events to ignore because WE triggered them
    // programmatically (via history.go), not the user.
    const skipPopstateRef = useRef(0);

    // ── 1) Refresh / close-tab guard ───────────────────────────────────────────
    useEffect(() => {
        if (!isDirty) return undefined;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // required by Chrome; text itself is ignored by modern browsers
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // ── 2) Browser / mobile Back-button guard ──────────────────────────────────
    const pendingPathRef = useRef(null);
    const isBackPendingRef = useRef(false);

    useEffect(() => {
        if (!isDirty) return undefined;

        // One buffer entry so the first Back press doesn't leave before we can
        // react. This is the ONLY pushState this effect ever does per mount.
        window.history.pushState({ __unsavedGuard: true }, '', window.location.href);
        bufferActiveRef.current = true;

        const handlePopState = () => {
            if (skipPopstateRef.current > 0) {
                skipPopstateRef.current -= 1;
                return;
            }
            // User pressed Back and landed on the natural entry below our buffer.
            // Restore the buffer by going forward to it again — this reuses the
            // existing forward entry instead of pushing a new one, so the stack
            // never grows no matter how many times this happens.
            skipPopstateRef.current += 1;
            window.history.go(1);
            isBackPendingRef.current = true;
            pendingPathRef.current = null;
            setIsConfirmOpen(true);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            bufferActiveRef.current = false;
        };
    }, [isDirty]);

    // Internal: if a buffer entry is active, step back onto the natural entry
    // first (which truncates the buffer from the stack per normal history
    // semantics), THEN run `after` once we've actually landed there. If no
    // buffer is active, just run `after` immediately.
    const landOnNaturalEntryThen = useCallback((after) => {
        if (!bufferActiveRef.current) {
            after();
            return;
        }
        skipPopstateRef.current += 1;
        const handleLanded = () => {
            window.removeEventListener('popstate', handleLanded);
            bufferActiveRef.current = false;
            after();
        };
        window.addEventListener('popstate', handleLanded);
        window.history.go(-1);
    }, []);

    // ── 3) In-app navigation guard (Cancel button, links, etc.) ────────────────
    const guardedNavigate = useCallback((path) => {
        if (!isDirty) {
            navigate(path);
            return;
        }
        isBackPendingRef.current = false;
        pendingPathRef.current = path;
        setIsConfirmOpen(true);
    }, [isDirty, navigate]);

    const confirmLeave = useCallback(() => {
        setIsConfirmOpen(false);

        if (isBackPendingRef.current) {
            isBackPendingRef.current = false;
            // Currently sitting back on the buffer entry (see handlePopState).
            // Go past both it and the natural entry to reach the page that was
            // truly before this one.
            skipPopstateRef.current += 2;
            bufferActiveRef.current = false;
            window.history.go(-2);
            return;
        }

        const path = pendingPathRef.current;
        pendingPathRef.current = null;
        if (path) landOnNaturalEntryThen(() => navigate(path));
    }, [navigate, landOnNaturalEntryThen]);

    const cancelLeave = useCallback(() => {
        setIsConfirmOpen(false);
        isBackPendingRef.current = false;
        pendingPathRef.current = null;
    }, []);

    // ── 4) Clean hand-off after a successful save ───────────────────────────────
    // Call this instead of react-router's `navigate` right after a save
    // succeeds. It collapses the buffer entry (if any) before navigating, so
    // no dead duplicate is left in history for the user to Back through.
    const releaseAndNavigate = useCallback((path) => {
        landOnNaturalEntryThen(() => navigate(path));
    }, [landOnNaturalEntryThen]);

    return { isConfirmOpen, confirmLeave, cancelLeave, guardedNavigate, releaseAndNavigate };
}

export default useUnsavedChangesGuard;