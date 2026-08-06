import { useCallback, useEffect, useState } from 'react'
import {
    CarFront,
    RefreshCw,
} from 'lucide-react'
import './TripsPage.css'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import TripCard from './components/trip_card/trip_card'

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
                                    <TripCard trip={trip} index={index} />
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

