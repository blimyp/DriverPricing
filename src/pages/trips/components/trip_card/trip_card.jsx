import {
    CalendarDays,
    CarFront,
    Clock3,
    MapPin,
    Navigation,
    Route,
} from 'lucide-react'
import BackgroundSection from '../../../../components/background_section/background_section'

import './trip_card.css'

function TripCard({ trip, index }) {
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

    function formatNumber(value, maximumFractionDigits = 1) {
        const numericValue = Number(value)

        if (!Number.isFinite(numericValue)) {
            return 'לא צוין'
        }

        return new Intl.NumberFormat('he-IL', {
            maximumFractionDigits,
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
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    function getTripTypeText(tripType) {
        switch (tripType) {
            case 'regular':
                return 'רכב רגיל'

            case 'large':
                return 'רכב גדול'

            default:
                return tripType || 'לא צוין'
        }
    }

    function getDurationText(duration) {
        const numericDuration = Number(duration)

        if (!Number.isFinite(numericDuration)) {
            return 'לא צוין'
        }

        return `${formatNumber(numericDuration)} שעות`
    }

    return (
        <BackgroundSection withMovingLines={false}>
            <article
                className="trip-card"
                key={trip.id}
                style={{ '--trip-index': index, }}
            >
                <div className="trip-card__accent" />

                <div className="trip-card__header">
                    <div className="trip-card__route-point">
                        <div className="trip-card__route-icon">
                            <MapPin strokeWidth={1.9} aria-hidden="true" />
                        </div>

                        <div>
                            <span>מוצא</span>
                            <strong>{trip.origin || 'לא צוין'}</strong>
                        </div>
                    </div>


                    <div className='trip-card--stops'>
                        <div className="trip-card--stop first-stop">
                            <div className="trip-card__route-dot" />
                        </div>

                        {(trip.stops ?? []).map((stop, index) => (
                            <div key={index} className="trip-card--stop">
                                <div className="trip-card__route-dot" />
                                <strong>{stop}</strong>
                            </div>
                        ))}

                        <div className="trip-card--stop last-stop">
                            <div className="trip-card__route-dot" />
                        </div>
                    </div>

                    <div className="trip-card__route-point">
                        <div className='trip-card__route-point-last'>
                            <span>יעד</span>
                            <strong>{trip.destination || 'לא צוין'}</strong>
                        </div>

                        <div className="trip-card__route-icon">
                            <Navigation strokeWidth={1.9} aria-hidden="true" />
                        </div>
                    </div>
                </div >

                <div className='trip-details'>
                    <div className="trip-card__detail">
                        <Route strokeWidth={1.8} aria-hidden="true" />

                        <div>
                            <span>מרחק</span>

                            <strong>
                                {trip.distance !== null && trip.distance !== undefined
                                    ? `${formatNumber(trip.distance)} ק"מ`
                                    : 'לא צוין'
                                }
                            </strong >
                        </div >
                    </div >

                    <div className="trip-card__detail">
                        <Clock3 strokeWidth={1.8} aria-hidden="true" />

                        <div>
                            <span>
                                משך נסיעה
                            </span>

                            <strong>
                                {getDurationText(trip.duration)}
                            </strong>
                        </div>
                    </div>

                    <div className="trip-card__detail">
                        <CarFront strokeWidth={1.8} aria-hidden="true" />

                        <div>
                            <span>סוג רכב</span>

                            <strong>
                                {getTripTypeText(trip.trip_type)}
                            </strong>
                        </div>
                    </div>
                </div>

                <footer className="trip-card__footer">
                    <CalendarDays
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <span>נשמר בתאריך</span>

                    <strong>
                        {formatDate(trip.created_at)}
                    </strong>

                    <div className="trip-card__price">
                        <span>מחיר נסיעה</span>

                        <strong>
                            {formatPrice(trip.calculated_price)}
                        </strong>
                    </div>
                </footer>
            </article >
        </BackgroundSection>
    )
}

export default TripCard

