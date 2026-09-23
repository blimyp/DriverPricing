import { useState } from 'react'
import { Check, Mail, Pencil, X } from 'lucide-react'

import './driver_item.css'

function formatCurrency(value) {
    const numericValue = Number(value)

    if (!Number.isFinite(numericValue)) {
        return '₪0'
    }

    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue)
}

function DriverItem({ driver, onUpdateStartingBalance }) {
    const displayName =
        driver.full_name || driver.email || 'נהג'

    const [isEditingBalance, setIsEditingBalance] = useState(false)
    const [balanceInput, setBalanceInput] = useState('')
    const [savingBalance, setSavingBalance] = useState(false)

    const startBalanceEdit = () => {
        setBalanceInput(String(driver.starting_balance || 0))
        setIsEditingBalance(true)
    }

    const cancelBalanceEdit = () => {
        setIsEditingBalance(false)
        setSavingBalance(false)
    }

    const saveBalanceEdit = async () => {
        try {
            setSavingBalance(true)
            await onUpdateStartingBalance(Number(balanceInput) || 0)
            setIsEditingBalance(false)
        } catch (error) {
            console.error('Error updating starting balance:', error)
        } finally {
            setSavingBalance(false)
        }
    }

    return (
        <article className="driver-item">
            <div className="driver-item-main">
                <div className="driver-item-avatar">
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="driver-item-info">
                    <h3>{displayName}</h3>

                    <p>
                        <Mail size={13} strokeWidth={2} />
                        {driver.email}
                    </p>

                    {driver.pending && (
                        <p className="driver-item-pending-note">
                            ממתין להתחברות ראשונה למערכת
                        </p>
                    )}
                </div>
            </div>

            <div className="driver-item-actions">
                <span className="driver-item-balance-label">
                    יתרת פתיחה
                </span>

                {isEditingBalance ? (
                    <div className="driver-item-balance-edit">
                        <input
                            type="number"
                            step="1"
                            value={balanceInput}
                            onChange={(event) =>
                                setBalanceInput(event.target.value)
                            }
                            disabled={savingBalance}
                            autoFocus
                        />

                        <button
                            type="button"
                            onClick={saveBalanceEdit}
                            disabled={savingBalance}
                            aria-label="שמירה"
                        >
                            <Check size={14} strokeWidth={2.4} />
                        </button>

                        <button
                            type="button"
                            onClick={cancelBalanceEdit}
                            disabled={savingBalance}
                            aria-label="ביטול"
                        >
                            <X size={14} strokeWidth={2.4} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="driver-item-balance-value"
                        onClick={startBalanceEdit}
                    >
                        {formatCurrency(driver.starting_balance)}
                        <Pencil size={12} strokeWidth={2.2} />
                    </button>
                )}
            </div>
        </article>
    )
}

export default DriverItem
