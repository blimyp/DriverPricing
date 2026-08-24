import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    updateProfileSetting,
    updateVehiclePrice,
} from '../../services/profileService'
import './PricesSettingsPage.css'

function PricesSettingsPage() {
    const { user } = useAuth()

    const [prices, setPrices] = useState([])

    const [generalSettings, setGeneralSettings] = useState([])

    const [editingVehicle, setEditingVehicle] = useState(null)
    const [editedVehicleValue, setEditedVehicleValue] = useState('')
    const [savingVehicle, setSavingVehicle] = useState(null)

    const [editingSetting, setEditingSetting] = useState(null)
    const [editedSettingValue, setEditedSettingValue] = useState('')
    const [savingSetting, setSavingSetting] = useState(null)

    useEffect(() => {
        if (!user) return

        setPrices([
            {
                vehicle_type: 'bus',
                km_cnt_in_liter: user.bus_km_per_liter,
            },
            {
                vehicle_type: 'minibus',
                km_cnt_in_liter: user.minibus_km_per_liter,
            },
            {
                vehicle_type: 'van',
                km_cnt_in_liter: user.van_km_per_liter,
            },
        ])

        setGeneralSettings([
            {
                key: 'fuel_price_per_liter',
                label: 'מחיר לליטר דלק',
                value: user.fuel_price_per_liter,
                suffix: '₪',
                step: '0.1',
            },
            {
                key: 'hourly_driver_price',
                label: 'מחיר לנהג לשעה',
                value: user.hourly_driver_price,
                suffix: '₪',
                step: '1',
            },
            {
                key: 'driver_percentage',
                label: 'אחוז לנהג',
                value: user.driver_percentage,
                suffix: '%',
                step: '1',
            },
        ])
    }, [user])

    const handleEditVehicle = (price) => {
        setEditingVehicle(price.vehicle_type)
        setEditedVehicleValue(price.km_cnt_in_liter ?? '')
    }

    const handleCancelVehicle = () => {
        setEditingVehicle(null)
        setEditedVehicleValue('')
    }

    const handleSaveVehicle = async (price) => {
        const value = Number(editedVehicleValue)

        if (!value || value <= 0) {
            alert('יש להזין כמות ק״מ תקינה')
            return
        }

        try {
            setSavingVehicle(price.vehicle_type)

            const updatedProfile = await updateVehiclePrice(
                user.id,
                price.vehicle_type,
                value
            )

            if (!updatedProfile) {
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
            setEditedVehicleValue('')
        } catch (err) {
            console.error('Error updating vehicle price:', err)
            alert('לא הצלחנו לשמור את השינוי')
        } finally {
            setSavingVehicle(null)
        }
    }

    const handleEditSetting = (setting) => {
        setEditingSetting(setting.key)
        setEditedSettingValue(setting.value ?? '')
    }

    const handleCancelSetting = () => {
        setEditingSetting(null)
        setEditedSettingValue('')
    }

    const handleSaveSetting = async (setting) => {
        const value = Number(editedSettingValue)

        if (
            Number.isNaN(value) ||
            value < 0
        ) {
            alert('יש להזין ערך תקין')
            return
        }

        if (
            setting.key === 'driver_percentage' &&
            value > 100
        ) {
            alert('אחוזים חייבים להיות בין 0 ל־100')
            return
        }

        try {
            setSavingSetting(setting.key)

            const updatedProfile = await updateProfileSetting(
                user.id,
                setting.key,
                value
            )

            if (!updatedProfile) {
                throw new Error('לא נמצאה רשומה לעדכון')
            }

            setGeneralSettings((currentSettings) =>
                currentSettings.map((item) =>
                    item.key === setting.key
                        ? {
                            ...item,
                            value,
                        }
                        : item
                )
            )

            setEditingSetting(null)
            setEditedSettingValue('')
        } catch (err) {
            console.error('Error updating setting:', err)
            alert('לא הצלחנו לשמור את השינוי')
        } finally {
            setSavingSetting(null)
        }
    }

    if (!user) {
        return (
            <div className="prices_settings_page">
                <div className="prices-settings-container">
                    <div className="prices-loading">
                        טוען נתונים...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="prices_settings_page">
            <div className="prices-settings-container">

                <div className="prices-section">
                    <h2>הגדרות כלליות</h2>

                    <div className="prices-table-wrapper">
                        <table className="prices-table">
                            <thead>
                                <tr>
                                    <th>הגדרה</th>
                                    <th>ערך</th>
                                </tr>
                            </thead>

                            <tbody>
                                {generalSettings.map((setting) => {
                                    const isEditing =
                                        editingSetting === setting.key

                                    const isSaving =
                                        savingSetting === setting.key

                                    return (
                                        <tr key={setting.key}>
                                            <td>
                                                <span className="vehicle-type">
                                                    {setting.label}
                                                </span>
                                            </td>

                                            <td>
                                                {isEditing ? (
                                                    <div className="price-edit-wrapper">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                setting.key ===
                                                                    'driver_percentage'
                                                                    ? '100'
                                                                    : undefined
                                                            }
                                                            step={setting.step}
                                                            value={
                                                                editedSettingValue
                                                            }
                                                            onChange={(e) =>
                                                                setEditedSettingValue(
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
                                                                handleSaveSetting(
                                                                    setting
                                                                )
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
                                                                handleCancelSetting
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            ביטול
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="price-value-wrapper">
                                                        <span>
                                                            {setting.value}{' '}
                                                            {setting.suffix}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className="price-edit-button"
                                                            onClick={() =>
                                                                handleEditSetting(
                                                                    setting
                                                                )
                                                            }
                                                            aria-label={`עריכת ${setting.label}`}
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
                </div>

                <div className="prices-section">
                    <h2>צריכת דלק לפי סוג רכב</h2>

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
                                                                value={
                                                                    editedVehicleValue
                                                                }
                                                                onChange={(e) =>
                                                                    setEditedVehicleValue(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="price-edit-input"
                                                                autoFocus
                                                            />

                                                            <button
                                                                type="button"
                                                                className="price-save-button"
                                                                onClick={() =>
                                                                    handleSaveVehicle(
                                                                        price
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSaving
                                                                }
                                                            >
                                                                {isSaving
                                                                    ? 'שומר...'
                                                                    : 'שמירה'}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="price-cancel-button"
                                                                onClick={
                                                                    handleCancelVehicle
                                                                }
                                                                disabled={
                                                                    isSaving
                                                                }
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
                                                                    handleEditVehicle(
                                                                        price
                                                                    )
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