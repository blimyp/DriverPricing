import { Clock, Mail, Plus } from 'lucide-react'

import DriverTripItem from './driver_trip_item'
import PaymentItem from './payment_item'
import './driver_group_card.css'

function DriverGroupCard({
    driver,
    trips,
    payments,
    onAddTrip,
    onAddPayment,
}) {
    const displayName =
        driver.full_name || driver.email || 'נהג'

    const activity = [
        ...trips.map((trip) => ({
            ...trip,
            activityType: 'trip',
        })),
        ...payments.map((payment) => ({
            ...payment,
            activityType: 'payment',
        })),
    ].sort(
        (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
    )

    return (
        <article className="driver-group-card">
            <div className="driver-group-card-header">
                <div className="driver-group-card-main">
                    <div className="driver-group-card-avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="driver-group-card-info">
                        <h3>{displayName}</h3>

                        <p>
                            <Mail size={13} strokeWidth={2} />
                            {driver.email}
                        </p>
                    </div>

                    {driver.pending && (
                        <span className="driver-group-card-badge-pending">
                            <Clock size={13} strokeWidth={2} />
                            ממתין
                        </span>
                    )}
                </div>

                {!driver.pending && (
                    <div className="driver-group-card-actions">
                        <button
                            type="button"
                            className="section-add-button"
                            onClick={onAddTrip}
                            aria-label="הוספת נסיעה לנהג"
                            data-tooltip="הוספת נסיעה"
                        >
                            <Plus size={16} strokeWidth={2.4} />
                        </button>

                        <button
                            type="button"
                            className="section-add-button section-add-button-secondary"
                            onClick={onAddPayment}
                            aria-label="הוספת תשלום לנהג"
                            data-tooltip="הוספת תשלום"
                        >
                            <Plus size={16} strokeWidth={2.4} />
                        </button>
                    </div>
                )}
            </div>

            <div className="driver-group-card-section">
                {activity.length === 0 ? (
                    <p className="driver-group-card-empty">
                        אין עדיין פעילות לנהג זה
                    </p>
                ) : (
                    <div className="driver-group-card-list">
                        {activity.map((item) =>
                            item.activityType === 'trip' ? (
                                <DriverTripItem
                                    key={`trip-${item.id}`}
                                    trip={item}
                                    compact
                                />
                            ) : (
                                <PaymentItem
                                    key={`payment-${item.id}`}
                                    payment={item}
                                    compact
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </article>
    )
}

export default DriverGroupCard
