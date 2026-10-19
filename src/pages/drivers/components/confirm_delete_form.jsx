import { useState } from 'react'

import './drivers_form.css'

function ConfirmDeleteForm({
    title,
    itemLabel,
    details = [],
    note,
    onConfirm,
    onCancel,
}) {
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        try {
            setDeleting(true)
            setError('')

            await onConfirm()
        } catch (error) {
            console.error('Error deleting item:', error)

            setError(error.message || 'לא הצלחנו למחוק')
            setDeleting(false)
        }
    }

    return (
        <div
            className="drivers-form-popup"
            dir="rtl"
        >
            <div className="drivers-form-header">
                <h2 id="confirm-delete-title">
                    {title}
                </h2>

                <p>
                    האם את/ה בטוח/ה שברצונך למחוק את {itemLabel}?
                </p>
            </div>

            {error && (
                <div className="drivers-form-error">
                    {error}
                </div>
            )}

            {details.length > 0 && (
                <dl className="confirm-delete-details">
                    {details.map(({ label, value }) => (
                        <div
                            key={label}
                            className="confirm-delete-detail"
                        >
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {note && (
                <p className="confirm-delete-note">
                    {note}
                </p>
            )}

            <div className="drivers-form-actions">
                <button
                    type="button"
                    className="drivers-form-cancel"
                    onClick={onCancel}
                    disabled={deleting}
                >
                    ביטול
                </button>

                <button
                    type="button"
                    className="drivers-form-submit confirm-delete-submit"
                    onClick={handleConfirm}
                    disabled={deleting}
                >
                    {deleting ? 'מוחק...' : 'אישור מחיקה'}
                </button>
            </div>
        </div>
    )
}

export default ConfirmDeleteForm
