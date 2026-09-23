import { useEffect, useState } from 'react'
import {
    BusFront,
    HandCoins,
    LayoutGrid,
    Plus,
    Rows3,
    Users,
} from 'lucide-react'

import {
    addDriverByEmail,
    getAllDrivers,
    updateDriverStartingBalance,
} from '../../services/driversService'
import {
    getDriverTrips,
    saveDriverTrip,
} from '../../services/tripsService'
import {
    getDriverPayments,
    savePayment,
} from '../../services/paymentsService'

import './DriversPage.css'
import DriverForm from './components/driver_form'
import DriverGroupCard from './components/driver_group_card'
import DriverItem from './components/driver_item'
import DriverTripForm from './components/driver_trip_form'
import DriverTripItem from './components/driver_trip_item'
import PaymentForm from './components/payment_form'
import PaymentItem from './components/payment_item'
import Popup from '../../components/popup/popup'

function DriversPage() {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [isAddPopupOpen, setIsAddPopupOpen] =
        useState(false)

    const [trips, setTrips] = useState([])
    const [tripsLoading, setTripsLoading] = useState(true)
    const [tripsError, setTripsError] = useState('')

    const [isAddTripPopupOpen, setIsAddTripPopupOpen] =
        useState(false)

    const [payments, setPayments] = useState([])
    const [paymentsLoading, setPaymentsLoading] = useState(true)
    const [paymentsError, setPaymentsError] = useState('')

    const [isAddPaymentPopupOpen, setIsAddPaymentPopupOpen] =
        useState(false)

    const [viewMode, setViewMode] = useState('category')
    const [selectedDriverId, setSelectedDriverId] =
        useState(null)

    const registeredDrivers = drivers.filter(
        (driver) => !driver.pending
    )

    const driverGroups = drivers.map((driver) => ({
        driver,
        trips: trips.filter(
            (trip) => trip.user_id === driver.id
        ),
        payments: payments.filter(
            (payment) => payment.driver_id === driver.id
        ),
    }))

    useEffect(() => {
        initialize()
    }, [])

    const initialize = async () => {
        const driversData = await loadDrivers()
        await Promise.all([
            loadTrips(driversData),
            loadPayments(driversData),
        ])
    }

    const loadDrivers = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAllDrivers()

            setDrivers(data)

            return data
        } catch (error) {
            console.error(
                'Error loading drivers:',
                error
            )

            setError('לא הצלחנו לטעון את רשימת הנהגים')

            return []
        } finally {
            setLoading(false)
        }
    }

    const loadTrips = async (driversList) => {
        try {
            setTripsLoading(true)
            setTripsError('')

            const driverIds = driversList
                .filter((driver) => !driver.pending)
                .map((driver) => driver.id)

            const data = await getDriverTrips(driverIds)

            const driversById = new Map(
                driversList.map((driver) => [
                    driver.id,
                    driver,
                ])
            )

            const tripsWithDriverNames = data.map(
                (trip) => {
                    const driver = driversById.get(
                        trip.user_id
                    )

                    return {
                        ...trip,
                        driverName:
                            driver?.full_name ||
                            driver?.email ||
                            'נהג',
                    }
                }
            )

            setTrips(tripsWithDriverNames)
        } catch (error) {
            console.error(
                'Error loading driver trips:',
                error
            )

            setTripsError('לא הצלחנו לטעון את רשימת הנסיעות')
        } finally {
            setTripsLoading(false)
        }
    }

    const loadPayments = async (driversList) => {
        try {
            setPaymentsLoading(true)
            setPaymentsError('')

            const driverIds = driversList
                .filter((driver) => !driver.pending)
                .map((driver) => driver.id)

            const data = await getDriverPayments(driverIds)

            const driversById = new Map(
                driversList.map((driver) => [
                    driver.id,
                    driver,
                ])
            )

            const paymentsWithDriverNames = data.map(
                (payment) => {
                    const driver = driversById.get(
                        payment.driver_id
                    )

                    return {
                        ...payment,
                        driverName:
                            driver?.full_name ||
                            driver?.email ||
                            'נהג',
                    }
                }
            )

            setPayments(paymentsWithDriverNames)
        } catch (error) {
            console.error(
                'Error loading driver payments:',
                error
            )

            setPaymentsError('לא הצלחנו לטעון את רשימת התשלומים')
        } finally {
            setPaymentsLoading(false)
        }
    }

    const openAddTripPopup = (driverId = null) => {
        setSelectedDriverId(driverId)
        setIsAddTripPopupOpen(true)
    }

    const openAddPaymentPopup = (driverId = null) => {
        setSelectedDriverId(driverId)
        setIsAddPaymentPopupOpen(true)
    }

    const handleAddDriver = async ({ email, startingBalance }) => {
        const newDriver = await addDriverByEmail(email, startingBalance)

        setDrivers((current) => [
            newDriver,
            ...current,
        ])

        setIsAddPopupOpen(false)
    }

    const handleUpdateStartingBalance = async (driver, value) => {
        const updatedDriver = await updateDriverStartingBalance(
            driver,
            value
        )

        setDrivers((current) =>
            current.map((item) =>
                item.id === driver.id ? updatedDriver : item
            )
        )
    }

    const handleAddTrip = async ({
        driverId,
        tripDate,
        price,
        description,
    }) => {
        const newTrip = await saveDriverTrip({
            driverId,
            tripDate,
            price,
            description,
        })

        const driver = drivers.find(
            (item) => item.id === driverId
        )

        setTrips((current) => [
            {
                ...newTrip,
                driverName:
                    driver?.full_name ||
                    driver?.email ||
                    'נהג',
            },
            ...current,
        ])

        setIsAddTripPopupOpen(false)
        setSelectedDriverId(null)
    }

    const handleAddPayment = async ({
        driverId,
        paymentDate,
        amount,
        description,
    }) => {
        const newPayment = await savePayment({
            driverId,
            paymentDate,
            amount,
            description,
        })

        const driver = drivers.find(
            (item) => item.id === driverId
        )

        setPayments((current) => [
            {
                ...newPayment,
                driverName:
                    driver?.full_name ||
                    driver?.email ||
                    'נהג',
            },
            ...current,
        ])

        setIsAddPaymentPopupOpen(false)
        setSelectedDriverId(null)
    }

    return (
        <div className="drivers-page">
            <div className="drivers-container">
                {error && (
                    <div className="drivers-error">
                        {error}
                    </div>
                )}

                <div className="drivers-view-toggle">
                    <button
                        type="button"
                        className={
                            viewMode === 'category'
                                ? 'drivers-view-toggle-button active'
                                : 'drivers-view-toggle-button'
                        }
                        onClick={() => setViewMode('category')}
                    >
                        <Rows3 size={15} strokeWidth={2.2} />
                        לפי קטגוריה
                    </button>

                    <button
                        type="button"
                        className={
                            viewMode === 'driver'
                                ? 'drivers-view-toggle-button active'
                                : 'drivers-view-toggle-button'
                        }
                        onClick={() => setViewMode('driver')}
                    >
                        <LayoutGrid size={15} strokeWidth={2.2} />
                        לפי נהג
                    </button>
                </div>

                {viewMode === 'driver' ? (
                    <div className="drivers-by-driver-view">
                        <div className="drivers-by-driver-header">
                            <div>
                                <h2>נהגים</h2>

                                <div className="drivers-section-span">
                                    <Users size={15} />
                                    <p>כל הפעולות של כל נהג במקום אחד</p>
                                </div>
                            </div>

                            <span className="drivers-count">
                                סך נהגים {drivers.length}
                            </span>
                        </div>

                        {loading || tripsLoading || paymentsLoading ? (
                            <div className="drivers-empty">
                                טוען נתונים...
                            </div>
                        ) : drivers.length === 0 ? (
                            <div className="drivers-empty">
                                <div className="drivers-empty-icon">
                                    <Users size={28} strokeWidth={1.8} />
                                </div>

                                <h3>
                                    אין עדיין נהגים
                                </h3>

                                <p>
                                    לחץ על "הוספת נהג" כדי להוסיף
                                    נהג לפי כתובת המייל שלו
                                </p>
                            </div>
                        ) : (
                            driverGroups.map(
                                ({
                                    driver,
                                    trips: driverTrips,
                                    payments: driverPayments,
                                }) => (
                                    <DriverGroupCard
                                        key={driver.id}
                                        driver={driver}
                                        trips={driverTrips}
                                        payments={driverPayments}
                                        onAddTrip={() =>
                                            openAddTripPopup(
                                                driver.id
                                            )
                                        }
                                        onAddPayment={() =>
                                            openAddPaymentPopup(
                                                driver.id
                                            )
                                        }
                                        onUpdateStartingBalance={(value) =>
                                            handleUpdateStartingBalance(
                                                driver,
                                                value
                                            )
                                        }
                                    />
                                )
                            )
                        )}
                    </div>
                ) : (
                    <>
                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <div className="drivers-section-title-row">
                                <h2>נהגים</h2>

                                <button
                                    type="button"
                                    className="section-add-button"
                                    onClick={() => setIsAddPopupOpen(true)}
                                    aria-label="הוספת נהג"
                                    data-tooltip="הוספת נהג"
                                >
                                    <Plus size={18} strokeWidth={2.4} />
                                </button>
                            </div>

                            <div className="drivers-section-span">
                                <Users size={15} />
                                <p>כל הנהגים במקום אחד</p>
                            </div>
                        </div>

                        <span className="drivers-count">
                            סך נהגים {drivers.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="drivers-empty">
                            טוען נהגים...
                        </div>
                    ) : drivers.length === 0 ? (
                        <div className="drivers-empty">
                            <div className="drivers-empty-icon">
                                <Users size={28} strokeWidth={1.8} />
                            </div>

                            <h3>
                                אין עדיין נהגים
                            </h3>

                            <p>
                                לחץ על "הוספת נהג" כדי להוסיף
                                נהג לפי כתובת המייל שלו
                            </p>
                        </div>
                    ) : (
                        <div className="drivers-list">
                            {drivers.map((driver) => (
                                <DriverItem
                                    key={driver.id}
                                    driver={driver}
                                    onUpdateStartingBalance={(value) =>
                                        handleUpdateStartingBalance(
                                            driver,
                                            value
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>

                {tripsError && (
                    <div className="drivers-error">
                        {tripsError}
                    </div>
                )}

                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <div className="drivers-section-title-row">
                                <h2>נסיעות</h2>

                                <button
                                    type="button"
                                    className="section-add-button"
                                    onClick={() => openAddTripPopup()}
                                    disabled={registeredDrivers.length === 0}
                                    aria-label="הוספת נסיעה"
                                    data-tooltip="הוספת נסיעה"
                                >
                                    <Plus size={18} strokeWidth={2.4} />
                                </button>
                            </div>

                            <div className="drivers-section-span">
                                <BusFront size={15} />
                                <p>כל הנסיעות שהוקצו לנהגים</p>
                            </div>
                        </div>

                        <span className="drivers-count">
                            סך נסיעות {trips.length}
                        </span>
                    </div>

                    {tripsLoading ? (
                        <div className="drivers-empty">
                            טוען נסיעות...
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="drivers-empty">
                            <div className="drivers-empty-icon">
                                <BusFront size={28} strokeWidth={1.8} />
                            </div>

                            <h3>
                                אין עדיין נסיעות
                            </h3>

                            <p>
                                לחץ על "הוספת נסיעה" כדי לשייך
                                נסיעה לאחד הנהגים
                            </p>
                        </div>
                    ) : (
                        <div className="drivers-list">
                            {trips.map((trip) => (
                                <DriverTripItem
                                    key={trip.id}
                                    trip={trip}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {paymentsError && (
                    <div className="drivers-error">
                        {paymentsError}
                    </div>
                )}

                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <div className="drivers-section-title-row">
                                <h2>תשלומים</h2>

                                <button
                                    type="button"
                                    className="section-add-button"
                                    onClick={() => openAddPaymentPopup()}
                                    disabled={registeredDrivers.length === 0}
                                    aria-label="הוספת תשלום"
                                    data-tooltip="הוספת תשלום"
                                >
                                    <Plus size={18} strokeWidth={2.4} />
                                </button>
                            </div>

                            <div className="drivers-section-span">
                                <HandCoins size={15} />
                                <p>כל התשלומים שבוצעו לנהגים</p>
                            </div>
                        </div>

                        <span className="drivers-count">
                            סך תשלומים {payments.length}
                        </span>
                    </div>

                    {paymentsLoading ? (
                        <div className="drivers-empty">
                            טוען תשלומים...
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="drivers-empty">
                            <div className="drivers-empty-icon">
                                <HandCoins size={28} strokeWidth={1.8} />
                            </div>

                            <h3>
                                אין עדיין תשלומים
                            </h3>

                            <p>
                                לחץ על "הוספת תשלום" כדי לשייך
                                תשלום לאחד הנהגים
                            </p>
                        </div>
                    ) : (
                        <div className="drivers-list">
                            {payments.map((payment) => (
                                <PaymentItem
                                    key={payment.id}
                                    payment={payment}
                                />
                            ))}
                        </div>
                    )}
                </section>
                    </>
                )}
            </div>

            <Popup
                isOpen={isAddPopupOpen}
                onClose={() => setIsAddPopupOpen(false)}
            >
                <DriverForm
                    onSubmit={handleAddDriver}
                    onCancel={() => setIsAddPopupOpen(false)}
                />
            </Popup>

            <Popup
                isOpen={isAddTripPopupOpen}
                onClose={() => {
                    setIsAddTripPopupOpen(false)
                    setSelectedDriverId(null)
                }}
            >
                <DriverTripForm
                    drivers={registeredDrivers}
                    initialDriverId={selectedDriverId}
                    lockDriver={Boolean(selectedDriverId)}
                    onSubmit={handleAddTrip}
                    onCancel={() => {
                        setIsAddTripPopupOpen(false)
                        setSelectedDriverId(null)
                    }}
                />
            </Popup>

            <Popup
                isOpen={isAddPaymentPopupOpen}
                onClose={() => {
                    setIsAddPaymentPopupOpen(false)
                    setSelectedDriverId(null)
                }}
            >
                <PaymentForm
                    drivers={registeredDrivers}
                    initialDriverId={selectedDriverId}
                    lockDriver={Boolean(selectedDriverId)}
                    onSubmit={handleAddPayment}
                    onCancel={() => {
                        setIsAddPaymentPopupOpen(false)
                        setSelectedDriverId(null)
                    }}
                />
            </Popup>
        </div>
    )
}

export default DriversPage
