import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    CarFront,
    RefreshCw,
    Sparkles,
    Wallet,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import EarningCard from './components/earning_card/earning_card'
import './DriverPage.css'

const DEFAULT_DRIVER_PERCENTAGE = 30

function DriverPage() {
    const { user } = useAuth()

    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const driverPercentage = Number(user?.driver_percentage) > 0
        ? Number(user.driver_percentage)
        : DEFAULT_DRIVER_PERCENTAGE

    const fetchTrips = useCallback(
        async ({ isRefresh = false } = {}) => {
            if (!user) {
                setTrips([])
                setLoading(false)
                setRefreshing(false)
                setErrorMessage('יש להתחבר כדי לצפות בנסיעות שלך')
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
                        description,
                        stops,
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
                console.error('Fetch driver trips error:', error)

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

    const earnings = useMemo(
        () => trips.map((trip) => {
            const price = Number(trip.calculated_price) || 0

            return {
                ...trip,
                driverEarning: price * (driverPercentage / 100),
            }
        }),
        [trips, driverPercentage]
    )

    const totalEarnings = useMemo(
        () => earnings.reduce(
            (sum, trip) => sum + trip.driverEarning,
            0
        ),
        [earnings]
    )

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

    if (loading) {
        return (
            <main className="driver-page" dir="rtl">
                <div className="driver-page__loading">
                    <span className="driver-page__spinner" />

                    <h2>טוען את הרווחים שלך</h2>

                    <p>רגע אחד, אנחנו סופרים...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="driver-page" dir="rtl">
            <div className="driver-page__container">
                <section className="driver-page__hero">
                    <span className="driver-page__hero-icon">
                        <Wallet strokeWidth={2} aria-hidden="true" />
                    </span>

                    <span className="driver-page__hero-label">
                        <Sparkles size={14} aria-hidden="true" />
                        סך כל הרווחים שלך
                    </span>

                    <strong className="driver-page__hero-total">
                        {formatCurrency(totalEarnings)}
                    </strong>

                    <p className="driver-page__hero-sub">
                        מתוך {earnings.length} נסיעות · {driverPercentage}% מכל נסיעה
                    </p>

                    <button
                        type="button"
                        className="driver-page__refresh"
                        onClick={() => fetchTrips({ isRefresh: true })}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? 'driver-page__refresh-icon spinning'
                                    : 'driver-page__refresh-icon'
                            }
                            aria-hidden="true"
                        />

                        {refreshing ? 'מרענן...' : 'רענון'}
                    </button>
                </section>

                {errorMessage && (
                    <div className="driver-page__error" role="alert">
                        <strong>לא ניתן להציג את הנתונים</strong>
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

                {!errorMessage && earnings.length === 0 && (
                    <section className="driver-page__empty">
                        <div className="driver-page__empty-icon">
                            <CarFront
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </div>

                        <span className="driver-page__empty-label">
                            אין עדיין נתונים להצגה
                        </span>

                        <h2>עדיין לא נשמרו נסיעות</h2>

                        <p>
                            לאחר חישוב ושמירת נסיעה, הרווח שלך
                            ממנה יופיע כאן באופן אוטומטי.
                        </p>
                    </section>
                )}

                {!errorMessage && earnings.length > 0 && (
                    <section className="driver-page__list">
                        <div className="driver-page__grid">
                            {earnings.map((trip, index) => (
                                <EarningCard
                                    key={trip.id}
                                    trip={trip}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}

export default DriverPage
