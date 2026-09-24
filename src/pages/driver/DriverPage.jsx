import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    CarFront,
    LogOut,
    RefreshCw,
    Sparkles,
    Truck,
    Wallet,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { signOut } from '../../services/authService'
import EarningCard from './components/earning_card/earning_card'
import PaymentCard from './components/payment_card/payment_card'
import {
    getDriverPercentage,
    getTripDriverEarning,
} from '../../utils/driverBalance'
import './DriverPage.css'

function DriverPage() {
    const { user } = useAuth()

    const [trips, setTrips] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const driverPercentage = getDriverPercentage(user)

    const startingBalance = Number(user?.starting_balance) || 0

    const fetchLedger = useCallback(
        async ({ isRefresh = false } = {}) => {
            if (!user) {
                setTrips([])
                setPayments([])
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

                const [tripsResult, paymentsResult] = await Promise.all([
                    supabase
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
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('driver_payments')
                        .select('id, description, amount, created_at')
                        .eq('driver_id', user.id)
                        .order('created_at', { ascending: false }),
                ])

                if (tripsResult.error) {
                    throw tripsResult.error
                }

                if (paymentsResult.error) {
                    throw paymentsResult.error
                }

                setTrips(tripsResult.data || [])
                setPayments(paymentsResult.data || [])
            } catch (error) {
                console.error('Fetch driver ledger error:', error)

                setErrorMessage(
                    error?.message || 'אירעה שגיאה בטעינת הנתונים'
                )
            } finally {
                setLoading(false)
                setRefreshing(false)
            }
        },
        [user]
    )

    useEffect(() => {
        fetchLedger()
    }, [fetchLedger])

    const earnings = useMemo(
        () => trips.map((trip) => ({
            ...trip,
            kind: 'trip',
            driverEarning: getTripDriverEarning(trip, driverPercentage),
        })),
        [trips, driverPercentage]
    )

    const totalEarnings = useMemo(
        () => earnings.reduce(
            (sum, trip) => sum + trip.driverEarning,
            0
        ),
        [earnings]
    )

    const totalPaid = useMemo(
        () => payments.reduce(
            (sum, payment) => sum + (Number(payment.amount) || 0),
            0
        ),
        [payments]
    )

    const balance = startingBalance + totalEarnings - totalPaid

    const ledgerItems = useMemo(
        () => [
            ...earnings,
            ...payments.map((payment) => ({
                ...payment,
                kind: 'payment',
            })),
        ].sort(
            (a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
        ),
        [earnings, payments]
    )

    const handleLogout = async () => {
        await signOut()
    }

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

    const driverName = user?.full_name || user?.email || 'נהג'
    const driverInitial = driverName.charAt(0).toUpperCase()

    return (
        <main className="driver-page" dir="rtl">
            <div className="driver-page__container">
                <header className="driver-page__topbar">
                    <div className="driver-page__title">
                        <span className="driver-page__title-icon">
                            <Truck size={20} strokeWidth={2} aria-hidden="true" />
                        </span>

                        <h1>הנסיעות והתשלומים שלי</h1>
                    </div>

                    <div className="driver-page__user">
                        <div className="driver-page__user-avatar">
                            {driverInitial}
                        </div>

                        <span className="driver-page__user-name">
                            {driverName}
                        </span>

                        <button
                            type="button"
                            className="driver-page__logout"
                            onClick={handleLogout}
                            aria-label="התנתקות"
                        >
                            <LogOut size={17} strokeWidth={2} aria-hidden="true" />
                        </button>
                    </div>
                </header>

                <section className="driver-page__hero">
                    <span className="driver-page__hero-icon">
                        <Wallet strokeWidth={2} aria-hidden="true" />
                    </span>

                    <span className="driver-page__hero-label">
                        <Sparkles size={14} aria-hidden="true" />
                        יתרה לתשלום
                    </span>

                    <strong className="driver-page__hero-total">
                        {formatCurrency(balance)}
                    </strong>

                    <p className="driver-page__hero-sub">
                        {startingBalance !== 0 && (
                            <>יתרת פתיחה {formatCurrency(startingBalance)} · </>
                        )}
                        הרווחת {formatCurrency(totalEarnings)} · שולם לך {formatCurrency(totalPaid)}
                    </p>

                    <button
                        type="button"
                        className="driver-page__refresh"
                        onClick={() => fetchLedger({ isRefresh: true })}
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
                                onClick={() => fetchLedger()}
                            >
                                ניסיון נוסף
                            </button>
                        )}
                    </div>
                )}

                {!errorMessage && ledgerItems.length === 0 && (
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

                {!errorMessage && ledgerItems.length > 0 && (
                    <section className="driver-page__list">
                        <div className="driver-page__grid">
                            {ledgerItems.map((item, index) =>
                                item.kind === 'payment' ? (
                                    <PaymentCard
                                        key={`payment-${item.id}`}
                                        payment={item}
                                        index={index}
                                    />
                                ) : (
                                    <EarningCard
                                        key={`trip-${item.id}`}
                                        trip={item}
                                        index={index}
                                    />
                                )
                            )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}

export default DriverPage
