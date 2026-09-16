import {
    CalendarDays,
    MapPin,
    TrendingUp,
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
            key={trip.id}
            style={{ '--trip-index': index }}
        >
            <div className="earning-card__route">
                <div className="earning-card__description">
                    <MapPin strokeWidth={1.9} aria-hidden="true" />
                    <strong>{getTripDescription(trip)}</strong>
                </div>
            </div>

            <div className="earning-card__earning">
                <TrendingUp strokeWidth={2.2} aria-hidden="true" />

                <div>
                    <span>הרווחת בנסיעה זו</span>
                    <strong>{formatPrice(trip.driverEarning)}</strong>
                </div>
            </div>

            <footer className="earning-card__footer">
                <span className="earning-card__date">
                    <CalendarDays strokeWidth={1.8} aria-hidden="true" />
                    {formatDate(trip.created_at)}
                </span>
            </footer>
        </article>
    )
}

export default EarningCard
