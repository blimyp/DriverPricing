import { useState } from 'react'
import {
    BusFront,
    Check,
    Gauge,
    HandCoins,
    Pencil,
    Percent,
    Wrench,
    X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfileSetting } from '../../services/profileService'
import { VEHICLE_TYPE_LABELS } from '../../utils/vehicles'
import { DRIVER_COST_DEFAULTS } from '../../utils/driverCost'
import VehiclesSection from './components/vehicles_section'
import './PricesSettingsPage.css'

const SETTINGS_GROUPS = [
    {
        id: 'vehicle_types',
        title: 'לפי סוג רכב',
        description: 'צריכת דלק ומחיר מינימום לכל סוג רכב',
        icon: BusFront,
        blocks: Object.entries(VEHICLE_TYPE_LABELS).map(([type, label]) => ({
            title: label,
            fields: [
                { key: `${type}_km_per_liter`, label: 'צריכת דלק', suffix: 'ק״מ לליטר', step: '0.1' },
                { key: `${type}_min_trip_price`, label: 'מחיר מינימום לנסיעה', hint: 'ללא מע״מ', suffix: '₪', step: '10' },
            ],
        })),
    },
    {
        id: 'operations',
        title: 'עלויות תפעול',
        description: 'דלק, נהגים והוצאות קבועות של המשרד',
        icon: Gauge,
        blocks: [
            {
                fields: [
                    { key: 'fuel_price_per_liter', label: 'מחיר לליטר דלק', hint: 'ללא מע״מ', suffix: '₪', step: '0.1' },
                    { key: 'driver_percentage', label: 'אחוז לנהג', suffix: '%', step: '1', max: 100 },
                    { key: 'company_overhead_monthly', label: 'תקורת משרד חודשית', hint: 'משרד, מוקד, תוכנה', suffix: '₪', step: '100' },
                    { key: 'deadhead_km', label: 'ק״מ מנהלתי לנסיעה', hint: 'הגעה וחזרה לחניון', suffix: 'ק״מ', step: '1' },
                ],
            },
        ],
    },
    {
        id: 'driver_cost',
        title: 'עלות נהג',
        description: 'שכר, עלויות נלוות ותוספות לשעות נוספות, לילה, שבת וחג',
        icon: HandCoins,
        blocks: [
            {
                title: 'עלות שעה',
                fields: [
                    { key: 'driver_gross_hourly', label: 'שכר ברוטו לשעה', hint: 'מה שהנהג מקבל לפני ניכויים', suffix: '₪', step: '1' },
                    { key: 'driver_cost_factor', label: 'מקדם עלויות נלוות', hint: 'פנסיה, ביטוח לאומי, חופשה, הבראה ומחלה', suffix: '×', step: '0.01' },
                    { key: 'employer_national_insurance_percent', label: 'ביטוח לאומי (חלק מעסיק)', hint: 'מתווסף לתוספת של שעות נוספות, שבת וחג', suffix: '%', step: '0.1', max: 100 },
                ],
            },
            {
                title: 'תוספות',
                fields: [
                    { key: 'regular_shift_hours', label: 'יום עבודה רגיל', suffix: 'שעות', step: '0.5' },
                    { key: 'night_shift_hours', label: 'משמרת לילה', hint: 'שעתיים לפחות בין 22:00 ל־06:00', suffix: 'שעות', step: '0.5' },
                    { key: 'overtime_rate_first', label: 'שעות נוספות', hint: 'השעתיים הראשונות', suffix: '%', step: '5' },
                    { key: 'overtime_rate_after', label: 'שעות נוספות', hint: 'מהשעה השלישית', suffix: '%', step: '5' },
                    { key: 'rest_day_rate', label: 'שבת וחג', hint: 'בשעות נוספות מתווספת גם תוספת השעות הנוספות', suffix: '%', step: '5' },
                ],
            },
        ],
    },
    {
        id: 'depreciation',
        title: 'פחת ובלאי',
        description: 'לפי גיל הרכב',
        icon: Wrench,
        blocks: [
            {
                title: 'פחת שנתי',
                fields: [
                    { key: 'depreciation_rate_new', label: 'בן 1–3 שנים', suffix: '%', step: '0.5', max: 100 },
                    { key: 'depreciation_rate_mid', label: 'בן 4–6 שנים', suffix: '%', step: '0.5', max: 100 },
                    { key: 'depreciation_rate_old', label: 'בן 7 ומעלה', suffix: '%', step: '0.5', max: 100 },
                ],
            },
            {
                title: 'בלאי לק״מ',
                fields: [
                    { key: 'maintenance_per_km_new', label: 'בן 1–3 שנים', suffix: '₪', step: '0.05' },
                    { key: 'maintenance_per_km_mid', label: 'בן 4–6 שנים', suffix: '₪', step: '0.05' },
                    { key: 'maintenance_per_km_old', label: 'בן 7 ומעלה', suffix: '₪', step: '0.05' },
                ],
            },
        ],
    },
    {
        id: 'profit',
        title: 'רווח, מקדמים ותשלום',
        description: 'מה מוסיפים על העלות כדי להגיע למחיר',
        icon: Percent,
        blocks: [
            {
                fields: [
                    { key: 'target_margin_percent', label: 'אחוז רווח יעד', suffix: '%', step: '1', max: 99 },
                    { key: 'dedicated_surcharge_percent', label: 'תוספת לרכב צמוד', suffix: '%', step: '1' },
                    { key: 'cash_discount_percent', label: 'הנחת מזומן / מקדמה', suffix: '%', step: '0.5', max: 100 },
                    { key: 'vat_percent', label: 'מע״מ', suffix: '%', step: '1', max: 100 },
                ],
            },
        ],
    },
]

const formatValue = (value) =>
    value === null || value === undefined || value === ''
        ? '—'
        : Number(value).toLocaleString('he-IL', { maximumFractionDigits: 2 })

function PricesSettingsPage() {
    const { user } = useAuth()

    // ערכים שנשמרו בעמוד הזה, גוברים על הערכים שנטענו עם המשתמש
    const [savedValues, setSavedValues] = useState({})

    const [editingSetting, setEditingSetting] = useState(null)
    const [editedSettingValue, setEditedSettingValue] = useState('')
    const [savingSetting, setSavingSetting] = useState(null)
    const [savedSetting, setSavedSetting] = useState(null)

    // שדה שעוד לא נשמר מציג את ברירת המחדל שבה משתמש החישוב
    const getValue = (key) =>
        (key in savedValues ? savedValues[key] : user?.[key]) ??
        DRIVER_COST_DEFAULTS[key]

    const handleEditSetting = (setting) => {
        setEditingSetting(setting.key)
        setEditedSettingValue(getValue(setting.key) ?? '')
    }

    const handleCancelSetting = () => {
        setEditingSetting(null)
        setEditedSettingValue('')
    }

    const handleSaveSetting = async (setting) => {
        const value = Number(editedSettingValue)

        if (
            editedSettingValue === '' ||
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

            setSavedValues((current) => ({ ...current, [setting.key]: value }))

            setEditingSetting(null)
            setEditedSettingValue('')

            setSavedSetting(setting.key)
            setTimeout(() => {
                setSavedSetting((current) =>
                    current === setting.key ? null : current
                )
            }, 1500)
        } catch (err) {
            console.error('Error updating setting:', err)
            alert('לא הצלחנו לשמור את השינוי')
        } finally {
            setSavingSetting(null)
        }
    }

    const handleKeyDown = (event, setting) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleSaveSetting(setting)
        } else if (event.key === 'Escape') {
            handleCancelSetting()
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

    const renderField = (setting) => {
        const isEditing = editingSetting === setting.key
        const isSaving = savingSetting === setting.key
        const isSaved = savedSetting === setting.key

        return (
            <div
                key={setting.key}
                className={`setting-row${isEditing ? ' editing' : ''}${isSaved ? ' saved' : ''}`}
            >
                <div className="setting-label">
                    <span>{setting.label}</span>
                    {setting.hint && (
                        <small>{setting.hint}</small>
                    )}
                </div>

                {isEditing ? (
                    <div className="setting-edit">
                        <div className="setting-input-wrapper">
                            <input
                                type="number"
                                min="0"
                                max={setting.max}
                                step={setting.step}
                                inputMode="decimal"
                                value={editedSettingValue}
                                onChange={(e) =>
                                    setEditedSettingValue(e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(e, setting)}
                                disabled={isSaving}
                                autoFocus
                                aria-label={setting.label}
                            />
                            <span>{setting.suffix}</span>
                        </div>

                        <button
                            type="button"
                            className="setting-icon-button save"
                            onClick={() => handleSaveSetting(setting)}
                            disabled={isSaving}
                            aria-label="שמירה"
                            title="שמירה"
                        >
                            <Check size={16} strokeWidth={2.6} />
                        </button>

                        <button
                            type="button"
                            className="setting-icon-button"
                            onClick={handleCancelSetting}
                            disabled={isSaving}
                            aria-label="ביטול"
                            title="ביטול"
                        >
                            <X size={16} strokeWidth={2.4} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="setting-value"
                        onClick={() => handleEditSetting(setting)}
                        aria-label={`עריכת ${setting.label}`}
                        title="לחצי לעריכה"
                    >
                        <span className="setting-value-number">
                            {formatValue(getValue(setting.key))}
                        </span>
                        <span className="setting-value-suffix">
                            {setting.suffix}
                        </span>
                        {isSaved ? (
                            <Check size={14} className="setting-value-icon saved" />
                        ) : (
                            <Pencil size={13} className="setting-value-icon" />
                        )}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="prices_settings_page">
            <div className="prices-settings-container">

                <header className="prices-page-header">
                    <h1>הגדרות תמחור</h1>
                    <p>הנתונים כאן משמשים לחישוב המחיר של כל נסיעה. לחצי על ערך כדי לשנות אותו.</p>
                </header>

                <VehiclesSection userId={user.id} />

                {SETTINGS_GROUPS.map((group) => {
                    const Icon = group.icon

                    return (
                        <section className="prices-section" key={group.id}>
                            <div className="prices-section-header">
                                <div className="prices-section-title">
                                    <span className="prices-section-icon">
                                        <Icon size={18} />
                                    </span>
                                    <div>
                                        <h2>{group.title}</h2>
                                        <p>{group.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`settings-blocks blocks-${group.blocks.length}`}>
                                {group.blocks.map((block, index) => (
                                    <div className="settings-block" key={block.title || index}>
                                        {block.title && (
                                            <h3>{block.title}</h3>
                                        )}
                                        {block.fields.map(renderField)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                })}

            </div>
        </div>
    )
}

export default PricesSettingsPage
