import { CalendarDays, User, Wallet } from 'lucide-react'

import './driver_trip_item.css'

function DriverTripItem({ trip }) {
    function formatPrice(value) {
        const numericValue = Number(value)

        if (!Number.isFinite(numericValue)) {
            return 'לא צוין'
        }

        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numericValue)
    }

    function formatDate(value) {
        if (!value) {
            return 'לא צוין'
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return 'לא צוין'
        }

        return new Intl.DateTimeFormat('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date)
    }

    return (
        <article className="driver-trip-item">
            <div className="driver-trip-item-main">
                <div className="driver-trip-item-icon">
                    <User size={18} strokeWidth={2} />
                </div>

                <div className="driver-trip-item-info">
                    <h3>{trip.driverName}</h3>

                    {trip.description && (
                        <p>{trip.description}</p>
                    )}
                </div>
            </div>

            <div className="driver-trip-item-meta">
                <span className="driver-trip-item-date">
                    <CalendarDays size={13} strokeWidth={2} />
                    {formatDate(trip.created_at)}
                </span>

                <span className="driver-trip-item-price">
                    <Wallet size={13} strokeWidth={2} />
                    {formatPrice(trip.calculated_price)}
                </span>
            </div>
        </article>
    )
}

export default DriverTripItem
