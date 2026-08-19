import { useState } from 'react'

import './inbox_form.css'

function InboxForm({
    onSubmit,
    onCancel,
}) {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')

    const [sending, setSending] =
        useState(false)

    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()

        const cleanTitle = title.trim()
        const cleanMessage = message.trim()

        if (!cleanTitle || !cleanMessage) {
            setError(
                'יש למלא כותרת ותוכן לפנייה'
            )

            return
        }

        try {
            setSending(true)
            setError('')

            await onSubmit({
                title: cleanTitle,
                message: cleanMessage,
            })
        } catch (error) {
            console.error(
                'Error submitting inbox:',
                error
            )

            setError(
                'לא הצלחנו לשלוח את הפנייה'
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="inbox-form-popup"
            dir="rtl"
        >
            <div className="inbox-form-header">
                <h2>
                    פתיחת פנייה חדשה
                </h2>

                <p>
                    כתבי את נושא הפנייה ואת
                    ההודעה שברצונך לשלוח
                </p>
            </div>

            {error && (
                <div className="inbox-form-error">
                    {error}
                </div>
            )}

            <form
                className="inbox-form"
                onSubmit={handleSubmit}
            >
                <div className="inbox-form-field">
                    <label htmlFor="inbox-title">
                        כותרת
                    </label>

                    <input
                        id="inbox-title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="נושא הפנייה"
                        disabled={sending}
                        autoFocus
                    />
                </div>

                <div className="inbox-form-field">
                    <label htmlFor="inbox-message">
                        תוכן הפנייה
                    </label>

                    <textarea
                        id="inbox-message"
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        placeholder="כתבי כאן את פרטי הפנייה..."
                        rows="6"
                        disabled={sending}
                    />
                </div>

                <div className="inbox-form-actions">
                    <button
                        type="button"
                        className="inbox-form-cancel"
                        onClick={onCancel}
                        disabled={sending}
                    >
                        ביטול
                    </button>

                    <button
                        type="submit"
                        className="inbox-form-submit"
                        disabled={sending}
                    >
                        {sending
                            ? 'שולח...'
                            : 'שליחת פנייה'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default InboxForm