export const Field = ({ label, error, children, hint, required }) => (
    <div className="form-group">
        <label className="form-label">
            {label}{required && <span className="settings-required">*</span>}
        </label>
        {children}
        {hint && !error && <p className="form-hint">{hint}</p>}
        {error && <p className="form-error">{error.message}</p>}
    </div>
);