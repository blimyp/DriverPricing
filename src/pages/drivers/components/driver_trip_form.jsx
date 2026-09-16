import { useState } from 'react'

import './driver_trip_form.css'

function getTodayDate() {
    return new Date().toISOString().split('T')[0]
}

function DriverTripForm({ drivers, onSubmit, onCancel }) {
    const [driverId, setDriverId] = useState('')
    const [tripDate, setTripDate] = useState(getTodayDate())
    const [price, setPrice] = useState('')
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

        if (!tripDate) {
            setError('יש לבחור תאריך לנסיעה')
            return
        }

        const numericPrice = Number(price)

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {
            setError('יש להזין מחיר תקין לנסיעה')
            return
        }

        try {
            setSending(true)
            setError('')

            await onSubmit({
                driverId,
                tripDate,
                price: numericPrice,
                description: description.trim(),
            })
        } catch (error) {
            console.error(
                'Error adding driver trip:',
                error
            )

            setError(
                error.message ||
                'לא הצלחנו לשמור את הנסיעה'
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="driver-trip-form-popup"
            dir="rtl"
        >
            <div className="driver-trip-form-header">
                <h2>
                    הוספת נסיעה
                </h2>

                <p>
                    מלאי את פרטי הנסיעה ושייכי אותה לנהג הרלוונטי
                </p>
            </div>

            {error && (
                <div className="driver-trip-form-error">
                    {error}
                </div>
            )}

            <form
                className="driver-trip-form"
                onSubmit={handleSubmit}
            >
                <div className="driver-trip-form-field">
                    <label htmlFor="trip-driver">
                        נהג
                    </label>

                    <select
                        id="trip-driver"
                        value={driverId}
                        onChange={(event) =>
                            setDriverId(
                                event.target.value
                            )
                        }
                        disabled={sending}
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

                <div className="driver-trip-form-field">
                    <label htmlFor="trip-date">
                        תאריך הנסיעה
                    </label>

                    <input
                        id="trip-date"
                        type="date"
                        value={tripDate}
                        onChange={(event) =>
                            setTripDate(
                                event.target.value
                            )
                        }
                        disabled={sending}
                    />
                </div>

                <div className="driver-trip-form-field">
                    <label htmlFor="trip-price">
                        מחיר הנסיעה
                    </label>

                    <div className="driver-trip-price-wrapper">
                        <input
                            id="trip-price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={price}
                            onChange={(event) =>
                                setPrice(
                                    event.target.value
                                )
                            }
                            disabled={sending}
                        />

                        <span>₪</span>
                    </div>
                </div>

                <div className="driver-trip-form-field">
                    <label htmlFor="trip-description">
                        תיאור הנסיעה
                    </label>

                    <textarea
                        id="trip-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        placeholder="לדוגמה: נסיעה מתל אביב לירושלים"
                        rows="4"
                        disabled={sending}
                    />
                </div>

                <div className="driver-trip-form-actions">
                    <button
                        type="button"
                        className="driver-trip-form-cancel"
                        onClick={onCancel}
                        disabled={sending}
                    >
                        ביטול
                    </button>

                    <button
                        type="submit"
                        className="driver-trip-form-submit"
                        disabled={sending}
                    >
                        {sending
                            ? 'שומר...'
                            : 'שמירת נסיעה'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default DriverTripForm
