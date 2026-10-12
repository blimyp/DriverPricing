import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfileSetting } from '../../services/profileService'
import { VEHICLE_TYPE_LABELS } from '../../utils/vehicles'
import VehiclesSection from './components/vehicles_section'
import './PricesSettingsPage.css'

const SETTINGS_GROUPS = [
    {
        title: 'לפי סוג רכב',
        fields: Object.entries(VEHICLE_TYPE_LABELS).flatMap(([type, label]) => [
            { key: `${type}_km_per_liter`, label: `צריכת דלק – ${label}`, suffix: 'ק״מ לליטר', step: '0.1' },
            { key: `${type}_min_trip_price`, label: `מחיר מינימום לנסיעה – ${label} (ללא מע״מ)`, suffix: '₪', step: '10' },
        ]),
    },
    {
        title: 'עלויות תפעול',
        fields: [
            { key: 'fuel_price_per_liter', label: 'מחיר לליטר דלק (ללא מע״מ)', suffix: '₪', step: '0.1' },
            { key: 'hourly_driver_price', label: 'עלות שעת נהג למעסיק', suffix: '₪', step: '1' },
            { key: 'driver_percentage', label: 'אחוז לנהג', suffix: '%', step: '1', max: 100 },
            { key: 'company_overhead_monthly', label: 'תקורת משרד חודשית (משרד, מוקד, תוכנה)', suffix: '₪', step: '100' },
            { key: 'deadhead_km', label: 'ק״מ מנהלתי לכל נסיעה (הגעה וחזרה לחניון)', suffix: 'ק״מ', step: '1' },
        ],
    },
    {
        title: 'פחת ובלאי לפי גיל רכב',
        fields: [
            { key: 'depreciation_rate_new', label: 'פחת שנתי – רכב בן 1–3 שנים', suffix: '%', step: '0.5', max: 100 },
            { key: 'depreciation_rate_mid', label: 'פחת שנתי – רכב בן 4–6 שנים', suffix: '%', step: '0.5', max: 100 },
            { key: 'depreciation_rate_old', label: 'פחת שנתי – רכב בן 7 ומעלה', suffix: '%', step: '0.5', max: 100 },
            { key: 'maintenance_per_km_new', label: 'בלאי לק״מ – רכב בן 1–3 שנים', suffix: '₪', step: '0.05' },
            { key: 'maintenance_per_km_mid', label: 'בלאי לק״מ – רכב בן 4–6 שנים', suffix: '₪', step: '0.05' },
            { key: 'maintenance_per_km_old', label: 'בלאי לק״מ – רכב בן 7 ומעלה', suffix: '₪', step: '0.05' },
        ],
    },
    {
        title: 'רווח, מקדמים ותשלום',
        fields: [
            { key: 'target_margin_percent', label: 'אחוז רווח יעד', suffix: '%', step: '1', max: 99 },
            { key: 'dedicated_surcharge_percent', label: 'תוספת לרכב צמוד', suffix: '%', step: '1' },
            { key: 'cash_discount_percent', label: 'הנחה במסלול מזומן / מקדמה', suffix: '%', step: '0.5', max: 100 },
            { key: 'vat_percent', label: 'מע״מ', suffix: '%', step: '1', max: 100 },
        ],
    },
]

function PricesSettingsPage() {
    const { user } = useAuth()

    const [generalSettings, setGeneralSettings] = useState([])

    const [editingSetting, setEditingSetting] = useState(null)
    const [editedSettingValue, setEditedSettingValue] = useState('')
    const [savingSetting, setSavingSetting] = useState(null)

    useEffect(() => {
        if (!user) return

        setGeneralSettings(
            SETTINGS_GROUPS.flatMap((group) =>
                group.fields.map((field) => ({
                    ...field,
                    group: group.title,
                    value: user[field.key],
                }))
            )
        )
    }, [user])

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

        if (setting.max !== undefined && value > setting.max) {
            alert(`הערך חייב להיות בין 0 ל־${setting.max}`)
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

                <VehiclesSection userId={user.id} />

                {SETTINGS_GROUPS.map((group) => (
                <div className="prices-section" key={group.title}>
                    <h2>{group.title}</h2>

                    <div className="prices-table-wrapper">
                        <table className="prices-table">
                            <thead>
                                <tr>
                                    <th>הגדרה</th>
                                    <th>ערך</th>
                                </tr>
                            </thead>

                            <tbody>
                                {generalSettings
                                    .filter((setting) => setting.group === group.title)
                                    .map((setting) => {
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
                                                            max={setting.max}
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
                ))}

            </div>
        </div>
    )
}

export default PricesSettingsPage