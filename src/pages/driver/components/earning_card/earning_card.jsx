import {
    CalendarDays,
    MapPin,
} from 'lucide-react'

import './earning_card.css'

function EarningCard({ trip, index }) {
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

    function getTripDescription(trip) {
        if (trip.description && trip.description.trim()) {
            return trip.description
        }

        return `נסיעה מ${trip.origin || 'לא ידוע'} ל${trip.destination || 'לא ידוע'}`
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
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <article
            className="earning-card"
            style={{ '--trip-index': Math.min(index, 12) }}
        >
            <div className="earning-card__icon">
                <MapPin strokeWidth={2} aria-hidden="true" />
            </div>

            <div className="earning-card__body">
                <strong className="earning-card__label">
                    {getTripDescription(trip)}
                </strong>

                <span className="earning-card__date">
                    <CalendarDays size={12} strokeWidth={2} aria-hidden="true" />
                    {formatDate(trip.created_at)}
                </span>
            </div>

            <div className="earning-card__amount">
                <span className="earning-card__value">
                    {formatPrice(trip.driverEarning)}
                </span>
                <span className="earning-card__tag">רווח מנסיעה</span>
            </div>
        </article>
    )
}

export default EarningCard
