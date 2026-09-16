import { useEffect, useState } from 'react'
import { BusFront, HandCoins, Plus, Users } from 'lucide-react'

import {
    addDriverByEmail,
    getAllDrivers,
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

            const driverIds = driversList.map(
                (driver) => driver.id
            )

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

            const driverIds = driversList.map(
                (driver) => driver.id
            )

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

    const handleAddDriver = async ({ email }) => {
        const newDriver = await addDriverByEmail(email)

        setDrivers((current) => [
            newDriver,
            ...current,
        ])

        setIsAddPopupOpen(false)
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
    }

    return (
        <div className="drivers-page">
            <div className="drivers-container">
                <button
                    type="button"
                    className="add-driver-button"
                    onClick={() => setIsAddPopupOpen(true)}
                >
                    <Plus size={18} strokeWidth={2.2} />
                    <span>הוספת נהג</span>
                </button>

                {error && (
                    <div className="drivers-error">
                        {error}
                    </div>
                )}

                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <h2>נהגים</h2>
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
                                />
                            ))}
                        </div>
                    )}
                </section>

                <button
                    type="button"
                    className="add-driver-button add-trip-button"
                    onClick={() => setIsAddTripPopupOpen(true)}
                    disabled={drivers.length === 0}
                >
                    <Plus size={18} strokeWidth={2.2} />
                    <span>הוספת נסיעה</span>
                </button>

                {tripsError && (
                    <div className="drivers-error">
                        {tripsError}
                    </div>
                )}

                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <h2>נסיעות</h2>
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

                <button
                    type="button"
                    className="add-driver-button add-trip-button"
                    onClick={() => setIsAddPaymentPopupOpen(true)}
                    disabled={drivers.length === 0}
                >
                    <Plus size={18} strokeWidth={2.2} />
                    <span>הוספת תשלום</span>
                </button>

                {paymentsError && (
                    <div className="drivers-error">
                        {paymentsError}
                    </div>
                )}

                <section className="drivers-section">
                    <div className="drivers-section-header">
                        <div>
                            <h2>תשלומים</h2>
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
                onClose={() => setIsAddTripPopupOpen(false)}
            >
                <DriverTripForm
                    drivers={drivers}
                    onSubmit={handleAddTrip}
                    onCancel={() => setIsAddTripPopupOpen(false)}
                />
            </Popup>

            <Popup
                isOpen={isAddPaymentPopupOpen}
                onClose={() => setIsAddPaymentPopupOpen(false)}
            >
                <PaymentForm
                    drivers={drivers}
                    onSubmit={handleAddPayment}
                    onCancel={() => setIsAddPaymentPopupOpen(false)}
                />
            </Popup>
        </div>
    )
}

export default DriversPage
