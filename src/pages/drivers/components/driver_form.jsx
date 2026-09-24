import { useState } from 'react'

import './drivers_form.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function DriverForm({ onSubmit, onCancel }) {
    const [email, setEmail] = useState('')
    const [startingBalance, setStartingBalance] = useState('')

    const [sending, setSending] =
        useState(false)

    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()

        const cleanEmail = email.trim()

        if (!cleanEmail) {
            setError('יש להזין כתובת מייל')
            return
        }

        if (!EMAIL_PATTERN.test(cleanEmail)) {
            setError('כתובת המייל אינה תקינה')
            return
        }

        const cleanStartingBalance = Number(startingBalance) || 0

        try {
            setSending(true)
            setError('')

            await onSubmit({
                email: cleanEmail,
                startingBalance: cleanStartingBalance,
            })
        } catch (error) {
            console.error(
                'Error adding driver:',
                error
            )

            setError(
                error.message ||
                'לא הצלחנו להוסיף את הנהג'
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="drivers-form-popup"
            dir="rtl"
        >
            <div className="drivers-form-header">
                <h2>
                    הוספת נהג
                </h2>

                <p>
                    הזן את כתובת המייל של המשתמש שברצונך
                    להגדיר כנהג.
                </p>
            </div>

            {error && (
                <div className="drivers-form-error">
                    {error}
                </div>
            )}

            <form
                className="drivers-form"
                onSubmit={handleSubmit}
            >
                <div className="drivers-form-field">
                    <label htmlFor="driver-email">
                        כתובת מייל
                    </label>

                    <input
                        id="driver-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="driver@example.com"
                        disabled={sending}
                        autoFocus
                    />
                </div>

                <div className="drivers-form-field">
                    <label htmlFor="driver-starting-balance">
                        יתרת פתיחה (מחיר התחלתי)
                    </label>

                    <input
                        id="driver-starting-balance"
                        type="number"
                        min="0"
                        step="1"
                        value={startingBalance}
                        onChange={(event) =>
                            setStartingBalance(
                                event.target.value
                            )
                        }
                        placeholder="לדוגמה: 10000"
                        disabled={sending}
                    />
                </div>

                <div className="drivers-form-actions">
                    <button
                        type="button"
                        className="drivers-form-cancel"
                        onClick={onCancel}
                        disabled={sending}
                    >
                        ביטול
                    </button>

                    <button
                        type="submit"
                        className="drivers-form-submit"
                        disabled={sending}
                    >
                        {sending
                            ? 'מוסיף...'
                            : 'הוספת נהג'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default DriverForm
