import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    CarFront,
    HandCoins,
    LogOut,
    PiggyBank,
    RefreshCw,
    TrendingUp,
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

const FILTERS = [
    { value: 'all', label: 'הכל' },
    { value: 'trip', label: 'נסיעות' },
    { value: 'payment', label: 'תשלומים' },
]

function getGreeting() {
    const hour = new Date().getHours()

    if (hour < 12) {
        return 'בוקר טוב'
    }

    if (hour < 18) {
        return 'צהריים טובים'
    }

    return 'ערב טוב'
}

function DriverPage() {
    const { user } = useAuth()

    const [trips, setTrips] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [filter, setFilter] = useState('all')

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

    const filterCounts = {
        all: ledgerItems.length,
        trip: earnings.length,
        payment: payments.length,
    }

    const monthGroups = useMemo(() => {
        const monthFormatter = new Intl.DateTimeFormat('he-IL', {
            month: 'long',
            year: 'numeric',
        })

        const groups = []

        ledgerItems
            .filter((item) => filter === 'all' || item.kind === filter)
            .forEach((item, index) => {
                const date = new Date(item.created_at)
                const isValid = !Number.isNaN(date.getTime())
                const key = isValid
                    ? `${date.getFullYear()}-${date.getMonth()}`
                    : 'unknown'

                let group = groups[groups.length - 1]

                if (!group || group.key !== key) {
                    group = {
                        key,
                        label: isValid
                            ? monthFormatter.format(date)
                            : 'ללא תאריך',
                        items: [],
                    }
                    groups.push(group)
                }

                group.items.push({ item, index })
            })

        return groups
    }, [ledgerItems, filter])

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
                <div className="driver-page__band" aria-hidden="true" />

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
            <div className="driver-page__band" aria-hidden="true" />

            <div className="driver-page__container">
                <header className="driver-page__topbar">
                    <div className="driver-page__user">
                        <div className="driver-page__user-avatar">
                            {driverInitial}
                        </div>

                        <div className="driver-page__greeting">
                            <span>{getGreeting()},</span>
                            <strong>{driverName}</strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="driver-page__logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                        <span>התנתקות</span>
                    </button>
                </header>

                <section className="driver-page__hero">
                    <div className="driver-page__hero-head">
                        <span className="driver-page__hero-label">
                            <span className="driver-page__hero-icon">
                                <Wallet strokeWidth={2} aria-hidden="true" />
                            </span>
                            יתרה לתשלום
                        </span>

                        <button
                            type="button"
                            className="driver-page__refresh"
                            onClick={() => fetchLedger({ isRefresh: true })}
                            disabled={refreshing}
                            aria-label="רענון"
                            title="רענון"
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
                        </button>
                    </div>

                    <strong className="driver-page__hero-total">
                        {formatCurrency(balance)}
                    </strong>

                    <div className="driver-page__stats">
                        <div className="driver-page__stat driver-page__stat--earned">
                            <span className="driver-page__stat-icon">
                                <TrendingUp aria-hidden="true" />
                            </span>

                            <div className="driver-page__stat-text">
                                <span className="driver-page__stat-label">הרווחת</span>
                                <strong className="driver-page__stat-value">
                                    {formatCurrency(totalEarnings)}
                                </strong>
                            </div>
                        </div>

                        <div className="driver-page__stat driver-page__stat--paid">
                            <span className="driver-page__stat-icon">
                                <HandCoins aria-hidden="true" />
                            </span>

                            <div className="driver-page__stat-text">
                                <span className="driver-page__stat-label">שולם לך</span>
                                <strong className="driver-page__stat-value">
                                    {formatCurrency(totalPaid)}
                                </strong>
                            </div>
                        </div>

                        {startingBalance !== 0 && (
                            <div className="driver-page__stat driver-page__stat--start">
                                <span className="driver-page__stat-icon">
                                    <PiggyBank aria-hidden="true" />
                                </span>

                                <div className="driver-page__stat-text">
                                    <span className="driver-page__stat-label">יתרת פתיחה</span>
                                    <strong className="driver-page__stat-value">
                                        {formatCurrency(startingBalance)}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
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
                        <div className="driver-page__list-head">
                            <h2>היסטוריית פעולות</h2>

                            <div
                                className="driver-page__filters"
                                role="tablist"
                                aria-label="סינון פעולות"
                            >
                                {FILTERS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={filter === option.value}
                                        className={
                                            filter === option.value
                                                ? 'driver-page__filter active'
                                                : 'driver-page__filter'
                                        }
                                        onClick={() => setFilter(option.value)}
                                    >
                                        {option.label}

                                        <span className="driver-page__filter-count">
                                            {filterCounts[option.value]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {monthGroups.length === 0 ? (
                            <p className="driver-page__no-results">
                                אין פעולות מסוג זה
                            </p>
                        ) : (
                            monthGroups.map((group) => (
                                <div
                                    key={group.key}
                                    className="driver-page__month"
                                >
                                    <h3 className="driver-page__month-title">
                                        {group.label}
                                    </h3>

                                    <div className="driver-page__grid">
                                        {group.items.map(({ item, index }) =>
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
                                </div>
                            ))
                        )}
                    </section>
                )}
            </div>
        </main>
    )
}

export default DriverPage
