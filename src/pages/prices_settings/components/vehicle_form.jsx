import { useState } from 'react'

import { VEHICLE_TYPE_LABELS } from '../../../utils/vehicles'
import '../../drivers/components/drivers_form.css'
import './vehicle_form.css'

const NUMBER_FIELDS = [
    {
        key: 'purchase_price',
        label: 'מחיר רכישה (ללא מע״מ)',
        suffix: '₪',
        step: '1',
    },
    {
        key: 'financing_monthly_interest',
        label: 'ריבית מימון חודשית (ללא קרן)',
        suffix: '₪',
        step: '1',
    },
    {
        key: 'insurance_yearly',
        label: 'ביטוח שנתי',
        suffix: '₪',
        step: '1',
    },
    {
        key: 'other_fixed_yearly',
        label: 'טסט, רישוי וקצין בטיחות (שנתי)',
        suffix: '₪',
        step: '1',
    },
    {
        key: 'annual_km_estimate',
        label: 'צפי ק״מ שנתי',
        step: '1000',
        required: true,
    },
]

const DEFAULT_VALUES = {
    annual_km_estimate: '80000',
}

function getInitialValues(vehicle) {
    const values = {
        name: vehicle?.name || '',
        vehicle_type: vehicle?.vehicle_type || 'bus',
        manufacture_year: vehicle?.manufacture_year
            ? String(vehicle.manufacture_year)
            : '',
    }

    NUMBER_FIELDS.forEach((field) => {
        values[field.key] =
            vehicle?.[field.key] !== undefined &&
            vehicle?.[field.key] !== null
                ? String(vehicle[field.key])
                : DEFAULT_VALUES[field.key] || ''
    })

    return values
}

function VehicleForm({ vehicle = null, onSubmit, onCancel }) {
    const isEdit = Boolean(vehicle)

    const [values, setValues] = useState(() =>
        getInitialValues(vehicle)
    )
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const setValue = (key, value) => {
        setValues((current) => ({ ...current, [key]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const currentYear = new Date().getFullYear()
        const year = Number(values.manufacture_year)

        if (
            !Number.isInteger(year) ||
            year < 1980 ||
            year > currentYear + 1
        ) {
            setError('יש להזין שנת ייצור תקינה')
            return
        }

        const payload = {
            name: values.name.trim(),
            vehicle_type: values.vehicle_type,
            manufacture_year: year,
        }

        for (const field of NUMBER_FIELDS) {
            const number = Number(values[field.key] || 0)

            if (!Number.isFinite(number) || number < 0) {
                setError(`יש להזין ערך תקין בשדה "${field.label}"`)
                return
            }

            if (field.required && number <= 0) {
                setError(`יש למלא את השדה "${field.label}"`)
                return
            }

            payload[field.key] = number
        }

        try {
            setSending(true)
            setError('')

            await onSubmit(payload)
        } catch (error) {
            console.error('Error saving vehicle:', error)

            setError(error.message || 'לא הצלחנו לשמור את הרכב')
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="drivers-form-popup vehicle-form-popup"
            dir="rtl"
        >
            <div className="drivers-form-header">
                <h2>{isEdit ? 'עריכת רכב' : 'הוספת רכב'}</h2>

                <p>
                    הנתונים משמשים לחישוב העלות הקבועה והמשתנה של
                    כל נסיעה ברכב
                </p>
            </div>

            {error && (
                <div className="drivers-form-error">{error}</div>
            )}

            <form className="drivers-form" onSubmit={handleSubmit}>
                <div className="vehicle-form-grid">
                    <div className="drivers-form-field">
                        <label htmlFor="vehicle-name">
                            שם / מספר רישוי
                        </label>

                        <input
                            id="vehicle-name"
                            type="text"
                            placeholder="לדוגמה: אוטובוס 12-345-67"
                            value={values.name}
                            onChange={(event) =>
                                setValue('name', event.target.value)
                            }
                            disabled={sending}
                        />
                    </div>

                    <div className="drivers-form-field">
                        <label htmlFor="vehicle-type">סוג רכב</label>

                        <select
                            id="vehicle-type"
                            value={values.vehicle_type}
                            onChange={(event) =>
                                setValue(
                                    'vehicle_type',
                                    event.target.value
                                )
                            }
                            disabled={sending}
                        >
                            {Object.entries(VEHICLE_TYPE_LABELS).map(
                                ([type, label]) => (
                                    <option key={type} value={type}>
                                        {label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="drivers-form-field">
                        <label htmlFor="vehicle-year">שנת ייצור</label>

                        <input
                            id="vehicle-year"
                            type="number"
                            min="1980"
                            step="1"
                            inputMode="numeric"
                            placeholder={String(
                                new Date().getFullYear()
                            )}
                            value={values.manufacture_year}
                            onChange={(event) =>
                                setValue(
                                    'manufacture_year',
                                    event.target.value
                                )
                            }
                            disabled={sending}
                        />
                    </div>

                    {NUMBER_FIELDS.map((field) => (
                        <div
                            key={field.key}
                            className="drivers-form-field"
                        >
                            <label htmlFor={`vehicle-${field.key}`}>
                                {field.label}
                            </label>

                            <div className="drivers-form-price-wrapper">
                                <input
                                    id={`vehicle-${field.key}`}
                                    type="number"
                                    min="0"
                                    step={field.step}
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={values[field.key]}
                                    onChange={(event) =>
                                        setValue(
                                            field.key,
                                            event.target.value
                                        )
                                    }
                                    disabled={sending}
                                />

                                {field.suffix && (
                                    <span>{field.suffix}</span>
                                )}
                            </div>
                        </div>
                    ))}
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
                            : isEdit
                                ? 'שמירת שינויים'
                                : 'שמירת רכב'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default VehicleForm
