import { Mail } from 'lucide-react'

import StartingBalanceEditor from './starting_balance_editor'

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

function DriverItem({
    driver,
    balance,
    balanceLoading,
    onUpdateStartingBalance,
}) {
    const displayName =
        driver.full_name || driver.email || 'נהג'

    return (
        <article className="driver-item">
            <div className="driver-item-main">
                <div className="driver-item-avatar">
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="driver-item-info">
                    <div className="driver-item-name-row">
                        <h3>{displayName}</h3>

                        <StartingBalanceEditor
                            initialValue={driver.starting_balance}
                            onSave={onUpdateStartingBalance}
                        />
                    </div>

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
                    יתרה לתשלום
                </span>

                <span
                    className={
                        balance < 0
                            ? 'driver-item-balance-value negative'
                            : 'driver-item-balance-value'
                    }
                    dir="ltr"
                >
                    {balanceLoading ? '...' : formatCurrency(balance)}
                </span>
            </div>
        </article>
    )
}

export default DriverItem
