import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    CalendarDays,
    CarFront,
    Clock3,
    MapPin,
    Navigation,
    RefreshCw,
    Route,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import './TripsPage.css'

function TripsPage() {
    const { user } = useAuth()

    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const fetchTrips = useCallback(
        async ({ isRefresh = false } = {}) => {
            if (!user) {
                setTrips([])
                setLoading(false)
                setRefreshing(false)
                setErrorMessage('יש להתחבר כדי לצפות בנסיעות השמורות')
                return
            }

            try {
                if (isRefresh) {
                    setRefreshing(true)
                } else {
                    setLoading(true)
                }

                setErrorMessage('')

                const { data, error } = await supabase
                    .from('trips')
                    .select(
                        ` 
                        id,
                        user_id,
                        origin,
                        destination,
                        distance,
                        duration,
                        calculated_price,
                        trip_type,
                        created_at
                            `
                    )
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) {
                    throw error
                }

                setTrips(data || [])
            } catch (error) {
                console.error('Fetch trips error:', error)

                setErrorMessage(
                    error?.message || 'אירעה שגיאה בטעינת הנסיעות'
                )
            } finally {
                setLoading(false)
                setRefreshing(false)
            }
        },
        [user]
    )

    useEffect(() => {
        fetchTrips()
    }, [fetchTrips])

    const totalPrice = useMemo(() => {
        return trips.reduce((total, trip) => {
            const tripPrice = Number(trip.calculated_price)

            return total + (Number.isFinite(tripPrice) ? tripPrice : 0)
        }, 0)
    }, [trips])

    const totalDistance = useMemo(() => {
        return trips.reduce((total, trip) => {
            const tripDistance = Number(trip.distance)

            return total + (Number.isFinite(tripDistance) ? tripDistance : 0)
        }, 0)
    }, [trips])

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

    if (loading) {
        return (
            <main className="trips-page" dir="rtl">
                <div className="trips-page__background trips-page__background--one" />
                <div className="trips-page__background trips-page__background--two" />

                <div className="trips-page__container">
                    <div className="trips-page__loading">
                        <span className="trips-page__spinner" />

                        <h2>טוען את הנסיעות שלך</h2>

                        <p>הנתונים נטענים מהמערכת</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="trips-page" dir="rtl">
            <div className="trips-page__container">
                <header className="trips-page__header">

                    <button
                        type="button"
                        className="trips-page__refresh-button"
                        onClick={() =>
                            fetchTrips({
                                isRefresh: true,
                            })
                        }
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={
                                refreshing
                                    ? 'trips-page__refresh-icon trips-page__refresh-icon--active'
                                    : 'trips-page__refresh-icon'
                            }
                            strokeWidth={2}
                            aria-hidden="true"
                        />

                        <span>
                            {refreshing
                                ? 'מרענן נתונים...'
                                : 'רענון נסיעות'}
                        </span>
                    </button>
                </header>

                {errorMessage && (
                    <div
                        className="trips-page__error"
                        role="alert"
                    >
                        <strong>לא ניתן להציג את הנסיעות</strong>
                        <span>{errorMessage}</span>

                        {user && (
                            <button
                                type="button"
                                onClick={() => fetchTrips()}
                            >
                                ניסיון נוסף
                            </button>
                        )}
                    </div>
                )}

                {!errorMessage && trips.length === 0 && (
                    <section className="trips-page__empty">
                        <div className="trips-page__empty-icon">
                            <CarFront
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </div>

                        <span className="trips-page__empty-label">
                            אין עדיין נתונים להצגה
                        </span>

                        <h2>עדיין לא שמרת נסיעות</h2>

                        <p>
                            לאחר חישוב ושמירת נסיעה, הפרטים שלה
                            יופיעו כאן באופן אוטומטי.
                        </p>
                    </section>
                )}

                {!errorMessage && trips.length > 0 && (
                    <>

                        <section className="trips-page__list">
                            <div className="trips-page__grid">
                                {trips.map((trip, index) => (
                                    <article
                                        className="trip-card"
                                        key={trip.id}
                                        style={{
                                            '--trip-index': index,
                                        }}
                                    >
                                        <div className="trip-card__accent" />

                                        <div className="trip-card__header">
                                            <div className="trip-card__route">
                                                <div className="trip-card__route-point">
                                                    <div className="trip-card__route-icon">
                                                        <MapPin
                                                            strokeWidth={1.9}
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <div>
                                                        <span>מוצא</span>

                                                        <strong>
                                                            {trip.origin ||
                                                                'לא צוין'}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="trip-card__route-point">
                                                    <div className="trip-card__route-icon">
                                                        <Navigation
                                                            strokeWidth={1.9}
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <div>
                                                        <span>יעד</span>

                                                        <strong>
                                                            {trip.destination ||
                                                                'לא צוין'}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="trip-card__detail">
                                                <Route
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />

                                                <div>
                                                    <span>מרחק</span>

                                                    <strong>
                                                        {trip.distance !==
                                                            null &&
                                                            trip.distance !==
                                                            undefined
                                                            ? `${formatNumber(
                                                                trip.distance
                                                            )
                                                            } ק"מ`
                                                            : 'לא צוין'}
                                                    </strong >
                                                </div >
                                            </div >

                                            <div className="trip-card__detail">
                                                <Clock3
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />

                                                <div>
                                                    <span>
                                                        משך נסיעה
                                                    </span>

                                                    <strong>
                                                        {getDurationText(
                                                            trip.duration
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="trip-card__detail">
                                                <CarFront
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />

                                                <div>
                                                    <span>סוג רכב</span>

                                                    <strong>
                                                        {getTripTypeText(
                                                            trip.trip_type
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="trip-card__price">
                                                <span>מחיר נסיעה</span>

                                                <strong>
                                                    {formatPrice(
                                                        trip.calculated_price
                                                    )}
                                                </strong>
                                            </div>

                                        </div >

                                        <footer className="trip-card__footer">
                                            <CalendarDays
                                                strokeWidth={1.8}
                                                aria-hidden="true"
                                            />

                                            <span>נשמר בתאריך</span>

                                            <strong>
                                                {formatDate(
                                                    trip.created_at
                                                )}
                                            </strong>
                                        </footer>
                                    </article >
                                ))}
                            </div >
                        </section >
                    </>
                )}
            </div >
        </main >
    )
}

export default TripsPage

