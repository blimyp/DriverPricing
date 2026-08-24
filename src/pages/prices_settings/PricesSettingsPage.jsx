import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { updateVehiclePrice } from '../../services/profileService';
import './PricesSettingsPage.css'

function PricesSettingsPage() {
    const { user } = useAuth();
    const [prices, setPrices] = useState([
        {
            vehicle_type: 'bus',
            km_cnt_in_liter: user?.bus_km_per_liter,
        },
        {
            vehicle_type: 'minibus',
            km_cnt_in_liter: user?.minibus_km_per_liter,
        },
        {
            vehicle_type: 'van',
            km_cnt_in_liter: user?.van_km_per_liter,
        },
    ]);

    const [editingVehicle, setEditingVehicle] = useState(null)
    const [editedValue, setEditedValue] = useState('')
    const [savingVehicle, setSavingVehicle] = useState(null)

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
                user.id,
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
                            km_cnt_in_liter: value,
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
        van: 'מונית',
    }

    return labels[vehicleType] || vehicleType
}

export default PricesSettingsPage