import { useRef, useState, useCallback } from 'react';
import '@styles/ImageUpload.css';

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_LABEL = 'JPEG, PNG, WebP, SVG — max 2 MB';

/**
 * ImageUpload — drag-and-drop image upload with preview, progress and delete.
 *
 * Controlled via callbacks; actual upload is done by the parent using
 * useMutation hooks, keeping this component purely presentational.
 *
 * @param {object}   props
 * @param {string}   props.label        - Field label
 * @param {string}   props.fieldName    - 'logo' | 'signature'
 * @param {string}   [props.currentUrl] - Existing image URL from DB
 * @param {Function} props.onUpload     - (file: File) => void — called with selected file
 * @param {Function} [props.onDelete]   - () => void — called when user removes image
 * @param {boolean}  [props.isUploading]
 * @param {boolean}  [props.isDeleting]
 * @param {number}   [props.progress]   - 0–100
 * @param {string}   [props.error]
 * @param {string}   [props.hint]
 */
const ImageUpload = ({
  label,
  fieldName,
  currentUrl,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
  progress = 0,
  error,
  hint,
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);  // blob URL for instant preview
  const [localError, setLocalError] = useState('');

  const displayUrl = localPreview || currentUrl;
  const busy = isUploading || isDeleting;

  // ── File validation + selection ─────────────────────────────────────────────

  const processFile = useCallback((file) => {
    setLocalError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Only JPEG, PNG, WebP and SVG files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Show instant local preview before the upload completes
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onUpload(file);
  }, [onUpload]);

  // ── Drag handlers ───────────────────────────────────────────────────────────

  const handleDragEnter = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected after delete
    e.target.value = '';
  };

  const handleDelete = () => {
    setLocalPreview(null);
    setLocalError('');
    onDelete?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="img-upload">
      <label className="img-upload__label">{label}</label>

      {displayUrl ? (
        // ── Preview state ───────────────────────────────────────────────────
        <div className={`img-upload__preview ${fieldName === 'signature' ? 'img-upload__preview--sig' : ''}`}>
          <img
            src={displayUrl}
            alt={`${label} preview`}
            className="img-upload__img"
          />

          {/* Upload overlay */}
          {isUploading && (
            <div className="img-upload__overlay" aria-live="polite">
              <div className="img-upload__progress-ring">
                <svg viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeDasharray={`${(2 * Math.PI * 15 * progress) / 100} 999`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <span className="img-upload__progress-pct">{progress}%</span>
              </div>
            </div>
          )}

          {/* Action row */}
          {!isUploading && (
            <div className="img-upload__actions">
              <button
                type="button"
                className="img-upload__action-btn img-upload__action-btn--replace"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                aria-label={`Replace ${label}`}
              >
                <UploadIcon /> Replace
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="img-upload__action-btn img-upload__action-btn--delete"
                  onClick={handleDelete}
                  disabled={busy}
                  aria-label={`Remove ${label}`}
                >
                  {isDeleting ? <span className="spinner spinner-sm" /> : <TrashIcon />}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // ── Drop zone ───────────────────────────────────────────────────────
        <div
          className={`img-upload__zone ${dragOver ? 'img-upload__zone--over' : ''} ${error || localError ? 'img-upload__zone--error' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}. ${ALLOWED_LABEL}`}
        >
          <div className="img-upload__zone-inner">
            <div className="img-upload__icon" aria-hidden="true">
              <ImageIcon />
            </div>
            <p className="img-upload__cta">
              <span className="img-upload__link">Click to upload</span>
              {' '}or drag & drop
            </p>
            <p className="img-upload__hint-text">{hint || ALLOWED_LABEL}</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        id={`upload-${fieldName}`}
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Errors */}
      {(error || localError) && (
        <p className="form-error" role="alert">
          {error || localError}
        </p>
      )}
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const ImageIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default ImageUpload;
