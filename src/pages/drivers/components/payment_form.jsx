import { useState } from 'react'

import './drivers_form.css'

function getTodayDate() {
    return new Date().toISOString().split('T')[0]
}

function PaymentForm({
    drivers,
    initialDriverId,
    lockDriver,
    onSubmit,
    onCancel,
}) {
    const [driverId, setDriverId] = useState(
        initialDriverId || ''
    )
    const [paymentDate, setPaymentDate] = useState(getTodayDate())
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')

    const [sending, setSending] =
        useState(false)

    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!driverId) {
            setError('יש לבחור נהג')
            return
        }

        if (!paymentDate) {
            setError('יש לבחור תאריך לתשלום')
            return
        }

        const numericAmount = Number(amount)

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            setError('יש להזין סכום תקין לתשלום')
            return
        }

        try {
            setSending(true)
            setError('')

            await onSubmit({
                driverId,
                paymentDate,
                amount: numericAmount,
                description: description.trim(),
            })
        } catch (error) {
            console.error(
                'Error adding driver payment:',
                error
            )

            setError(
                error.message ||
                'לא הצלחנו לשמור את התשלום'
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
                    הוספת תשלום
                </h2>

                <p>
                    מלא את פרטי התשלום ושייך אותו לנהג הרלוונטי
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
                    <label htmlFor="payment-driver">
                        נהג
                    </label>

                    <select
                        id="payment-driver"
                        value={driverId}
                        onChange={(event) =>
                            setDriverId(
                                event.target.value
                            )
                        }
                        disabled={sending || lockDriver}
                    >
                        <option value="">
                            בחרי נהג
                        </option>

                        {drivers.map((driver) => (
                            <option
                                key={driver.id}
                                value={driver.id}
                            >
                                {driver.full_name || driver.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="drivers-form-field">
                    <label htmlFor="payment-date">
                        תאריך התשלום
                    </label>

                    <input
                        id="payment-date"
                        type="date"
                        value={paymentDate}
                        onChange={(event) =>
                            setPaymentDate(
                                event.target.value
                            )
                        }
                        disabled={sending}
                    />
                </div>

                <div className="drivers-form-field">
                    <label htmlFor="payment-amount">
                        סכום התשלום
                    </label>

                    <div className="drivers-form-price-wrapper">
                        <input
                            id="payment-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(event) =>
                                setAmount(
                                    event.target.value
                                )
                            }
                            disabled={sending}
                        />

                        <span>₪</span>
                    </div>
                </div>

                <div className="drivers-form-field">
                    <label htmlFor="payment-description">
                        הערה (לא חובה)
                    </label>

                    <textarea
                        id="payment-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        placeholder="לדוגמה: העברה בנקאית"
                        rows="4"
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
                            ? 'שומר...'
                            : 'שמירת תשלום'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PaymentForm
