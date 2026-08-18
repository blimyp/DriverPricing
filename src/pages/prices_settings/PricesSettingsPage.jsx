import { useEffect, useState } from 'react'
import {
    getVehiclePrices,
    updateVehiclePrice,
} from '../../services/vehiclePricesService'
import './PricesSettingsPage.css'

function PricesSettingsPage() {
    const [prices, setPrices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [editingVehicle, setEditingVehicle] = useState(null)
    const [editedValue, setEditedValue] = useState('')
    const [savingVehicle, setSavingVehicle] = useState(null)

    useEffect(() => {
        const loadPrices = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await getVehiclePrices()

                setPrices(data)
            } catch (err) {
                console.error('Error loading prices:', err)
                setError('לא הצלחנו לטעון את נתוני המחירים')
            } finally {
                setLoading(false)
            }
        }

        loadPrices()
    }, [])

    const handleEdit = (price) => {
        setEditingVehicle(price.vehicle_type)
        setEditedValue(price.km_cnt_in_liter)
    }

    const handleCancel = () => {
        setEditingVehicle(null)
        setEditedValue('')
    }

    const handleSave = async (price) => {
        const value = Number(editedValue)

        if (!value || value <= 0) {
            alert('יש להזין כמות ק״מ תקינה')
            return
        }

        try {
            setSavingVehicle(price.vehicle_type)

            const updatedPrice = await updateVehiclePrice(
                price.vehicle_type,
                value
            )

            if (!updatedPrice) {
                throw new Error('לא נמצאה רשומה לעדכון')
            }

            setPrices((currentPrices) =>
                currentPrices.map((item) =>
                    item.vehicle_type === price.vehicle_type
                        ? {
                            ...item,
                            km_cnt_in_liter: updatedPrice.km_cnt_in_liter,
                        }
                        : item
                )
            )

            setEditingVehicle(null)
            setEditedValue('')
        } catch (err) {
            console.error('Error updating vehicle price:', err)

            alert('לא הצלחנו לשמור את השינוי')
        } finally {
            setSavingVehicle(null)
        }
    }

    if (loading) {
        return (
            <div className="prices_settings_page">
                <div className="prices-loading">
                    טוען נתוני מחירים...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="prices_settings_page">
                <div className="prices-error">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="prices_settings_page">
            <div className="prices-settings-container">

                <div className="prices-settings-header">
                    <div>
                        <h1>הגדרות מחירים</h1>

                        <p>
                            ניהול מחירי הבסיס וצריכת הדלק לפי סוג רכב
                        </p>
                    </div>
                </div>

                {prices.length === 0 ? (
                    <div className="prices-empty">
                        לא נמצאו נתוני מחירים
                    </div>
                ) : (
                    <div className="prices-table-wrapper">
                        <table className="prices-table">
                            <thead>
                                <tr>
                                    <th>סוג רכב</th>
                                    <th>כמות ק״מ לליטר</th>
                                </tr>
                            </thead>

                            <tbody>
                                {prices.map((price) => {
                                    const isEditing =
                                        editingVehicle ===
                                        price.vehicle_type

                                    const isSaving =
                                        savingVehicle ===
                                        price.vehicle_type

                                    return (
                                        <tr key={price.vehicle_type}>
                                            <td>
                                                <span className="vehicle-type">
                                                    {getVehicleLabel(
                                                        price.vehicle_type
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {isEditing ? (
                                                    <div className="price-edit-wrapper">
                                                        <input
                                                            type="number"
                                                            min="0.1"
                                                            step="0.1"
                                                            value={editedValue}
                                                            onChange={(e) =>
                                                                setEditedValue(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="price-edit-input"
                                                            autoFocus
                                                        />

                                                        <button
                                                            type="button"
                                                            className="price-save-button"
                                                            onClick={() =>
                                                                handleSave(price)
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving
                                                                ? 'שומר...'
                                                                : 'שמירה'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="price-cancel-button"
                                                            onClick={
                                                                handleCancel
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            ביטול
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="price-value-wrapper">
                                                        <span>
                                                            {
                                                                price.km_cnt_in_liter
                                                            }
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className="price-edit-button"
                                                            onClick={() =>
                                                                handleEdit(price)
                                                            }
                                                            aria-label="עריכת כמות ק״מ לליטר"
                                                            title="עריכה"
                                                        >
                                                            ✎
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    )
}

const getVehicleLabel = (vehicleType) => {
    const labels = {
        bus: 'אוטובוס',
        minibus: 'מיניבוס',
        van: 'וואן',
    }

    return labels[vehicleType] || vehicleType
}

export default PricesSettingsPage