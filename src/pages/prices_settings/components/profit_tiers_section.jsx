import { useEffect, useState } from 'react'
import { Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react'

import {
    getProfitTiers,
    saveProfitTiers,
} from '../../../services/profitTiersService'
import {
    getProfitTiersForType,
    validateProfitTiers,
} from '../../../utils/profitTiers'
import { VEHICLE_TYPE_LABELS } from '../../../utils/vehicles'
import SectionHeader from './section_header'

const formatNumber = (value) =>
    Number(value).toLocaleString('he-IL', { maximumFractionDigits: 2 })

// הטווח של כל מדרגה, כמו בטבלה: "עד 800", "801 – 2,000", "מעל 4,000"
function getRangeLabel(tiers, index) {
    const tier = tiers[index]
    const previousMax = index > 0 ? tiers[index - 1].maxCost : null

    if (tier.maxCost === null) {
        return previousMax === null ? 'כל עלות' : `מעל ${formatNumber(previousMax)} ₪`
    }

    if (previousMax === null) {
        return `עד ${formatNumber(tier.maxCost)} ₪`
    }

    return `${formatNumber(previousMax + 1)} – ${formatNumber(tier.maxCost)} ₪`
}

function ProfitTiersSection({ userId, isOpen, onToggle }) {
    const [savedTiers, setSavedTiers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [editingType, setEditingType] = useState(null)
    const [draft, setDraft] = useState([])
    const [draftError, setDraftError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!userId) return

        let isMounted = true

        getProfitTiers(userId)
            .then((data) => {
                if (isMounted) setSavedTiers(data)
            })
            .catch((err) => {
                console.error('Error loading profit tiers:', err)

                if (isMounted) setError('לא הצלחנו לטעון את מדרגות הרווח')
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [userId])

    const startEditing = (vehicleType) => {
        const tiers = getProfitTiersForType(savedTiers, vehicleType)

        setEditingType(vehicleType)
        setDraftError('')
        setDraft(
            tiers.length > 0
                ? tiers.map((tier) => ({
                    maxCost: tier.maxCost === null ? '' : String(tier.maxCost),
                    factor: String(tier.factor),
                }))
                // אין מדרגות במסד – מתחילים ממדרגה אחת ריקה
                : [{ maxCost: '', factor: '' }]
        )
    }

    const cancelEditing = () => {
        setEditingType(null)
        setDraft([])
        setDraftError('')
    }

    const updateDraft = (index, field, value) => {
        setDraft((current) =>
            current.map((tier, i) =>
                i === index ? { ...tier, [field]: value } : tier
            )
        )
        setDraftError('')
    }

    // מדרגה חדשה נכנסת לפני האחרונה, כי לאחרונה אין גבול עליון
    const addTier = () => {
        setDraft((current) => {
            const last = current[current.length - 1]

            return [
                ...current.slice(0, -1),
                { maxCost: '', factor: last.factor },
                last,
            ]
        })
        setDraftError('')
    }

    const removeTier = (index) => {
        setDraft((current) => current.filter((_, i) => i !== index))
        setDraftError('')
    }

    const handleSave = async () => {
        const validationError = validateProfitTiers(draft)

        if (validationError) {
            setDraftError(validationError)
            return
        }

        try {
            setSaving(true)

            const saved = await saveProfitTiers(editingType, draft)

            setSavedTiers((current) => [
                ...current.filter((tier) => tier.vehicleType !== editingType),
                ...saved,
            ])

            cancelEditing()
        } catch (err) {
            console.error('Error saving profit tiers:', err)
            setDraftError('לא הצלחנו לשמור את המדרגות')
        } finally {
            setSaving(false)
        }
    }

    const renderView = (vehicleType) => {
        const tiers = getProfitTiersForType(savedTiers, vehicleType)

        if (tiers.length === 0) {
            return (
                <p className="profit-tiers-note">
                    לא הוגדרו מדרגות. בלי מדרגות אי אפשר לתמחר את סוג הרכב הזה
                </p>
            )
        }

        return (
            <>
                {tiers.map((tier, index) => (
                    <div className="setting-row" key={index}>
                        <div className="setting-label">
                            <span>מדרגה {index + 1}</span>
                            <small>{getRangeLabel(tiers, index)}</small>
                        </div>

                        <span className="setting-value-number">
                            ×{formatNumber(tier.factor)}
                        </span>
                    </div>
                ))}
            </>
        )
    }

    const renderEdit = () => (
        <>
            {draft.map((tier, index) => {
                const isLast = index === draft.length - 1

                return (
                    <div className="setting-row editing profit-tier-edit-row" key={index}>
                        <div className="setting-label">
                            <span>מדרגה {index + 1}</span>
                        </div>

                        <div className="setting-edit">
                            {isLast ? (
                                <span className="profit-tier-no-limit">
                                    {draft.length > 1 ? 'כל השאר' : 'כל עלות'}
                                </span>
                            ) : (
                                <div className="setting-input-wrapper">
                                    <span>עד</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        inputMode="decimal"
                                        value={tier.maxCost}
                                        onChange={(e) =>
                                            updateDraft(index, 'maxCost', e.target.value)
                                        }
                                        disabled={saving}
                                        aria-label={`גבול עלות במדרגה ${index + 1}`}
                                    />
                                    <span>₪</span>
                                </div>
                            )}

                            <div className="setting-input-wrapper profit-tier-factor">
                                <span>×</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={tier.factor}
                                    onChange={(e) =>
                                        updateDraft(index, 'factor', e.target.value)
                                    }
                                    disabled={saving}
                                    aria-label={`מקדם במדרגה ${index + 1}`}
                                />
                            </div>

                            <button
                                type="button"
                                className="setting-icon-button danger"
                                onClick={() => removeTier(index)}
                                disabled={saving || draft.length === 1}
                                aria-label={`מחיקת מדרגה ${index + 1}`}
                                title="מחיקת מדרגה"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                )
            })}

            {draftError && (
                <p className="profit-tiers-error">{draftError}</p>
            )}

            <div className="profit-tiers-actions">
                <button
                    type="button"
                    className="prices-add-button"
                    onClick={addTier}
                    disabled={saving}
                >
                    <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                    הוספת מדרגה
                </button>

                <div className="profit-tiers-actions-end">
                    <button
                        type="button"
                        className="setting-icon-button save"
                        onClick={handleSave}
                        disabled={saving}
                        aria-label="שמירה"
                        title="שמירה"
                    >
                        <Check size={16} strokeWidth={2.6} />
                    </button>

                    <button
                        type="button"
                        className="setting-icon-button"
                        onClick={cancelEditing}
                        disabled={saving}
                        aria-label="ביטול"
                        title="ביטול"
                    >
                        <X size={16} strokeWidth={2.4} />
                    </button>
                </div>
            </div>
        </>
    )

    const vehicleTypes = Object.entries(VEHICLE_TYPE_LABELS)

    return (
        <section className={`prices-section${isOpen ? '' : ' collapsed'}`}>
            <SectionHeader
                icon={Layers}
                title="מדרגות רווח"
                description="מקדם שמכפיל את העלות, לפי סוג הרכב וגובה העלות"
                isOpen={isOpen}
                onToggle={onToggle}
            />

            {!isOpen ? null : loading ? (
                <div className="prices-empty">טוען מדרגות...</div>
            ) : error ? (
                <div className="prices-error">{error}</div>
            ) : (
                <div className={`settings-blocks blocks-${vehicleTypes.length}`}>
                    {vehicleTypes.map(([vehicleType, label]) => (
                        <div className="settings-block" key={vehicleType}>
                            <div className="profit-tiers-head">
                                <h3>{label}</h3>

                                {editingType !== vehicleType && (
                                    <button
                                        type="button"
                                        className="setting-icon-button"
                                        onClick={() => startEditing(vehicleType)}
                                        disabled={editingType !== null}
                                        aria-label={`עריכת מדרגות ${label}`}
                                        title="עריכה"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                )}
                            </div>

                            {editingType === vehicleType
                                ? renderEdit()
                                : renderView(vehicleType)}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ProfitTiersSection
