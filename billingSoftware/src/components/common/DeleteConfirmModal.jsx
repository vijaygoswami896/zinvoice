import { useEffect, useRef } from 'react';

/**
 * DeleteConfirmModal — lightweight, accessible confirmation dialog.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen
 * @param {string}   props.title
 * @param {string}   props.description
 * @param {Function} props.onConfirm     - Called when the action is confirmed
 * @param {Function} props.onCancel
 * @param {boolean}  [props.isDeleting]
 * @param {string}   [props.confirmLabel]
 * @param {'danger'|'neutral'} [props.variant] - Styles the confirm button.
 *   'danger' (default, unchanged): red btn-danger — for actually-destructive
 *   actions like deleting a record.
 *   'neutral': btn-secondary — for confirmations that aren't destructive
 *   themselves (e.g. "leave this page"), just guarding against data loss.
 */
const DeleteConfirmModal = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isDeleting = false,
  confirmLabel = 'Delete',
  variant = 'danger',
}) => {
  const cancelRef = useRef(null);

  // Focus the cancel button when modal opens (safer default)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmBtnClass = variant === 'neutral' ? 'btn btn-secondary btn-full' : 'btn btn-danger btn-full';

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal">
        {/* Icon */}
        <div className="modal-icon modal-icon--danger" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>

        <h2 id="modal-title" className="modal-title">{title}</h2>
        <p id="modal-desc" className="modal-desc">{description}</p>

        <div className="modal-actions">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-secondary btn-full"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={confirmBtnClass}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? <><span className="spinner spinner-sm" /> Deleting…</>
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
