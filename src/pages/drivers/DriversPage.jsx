import { useEffect, useState } from 'react'
import {
    BusFront,
    HandCoins,
    LayoutGrid,
    Rows3,
    Users,
} from 'lucide-react'

import {
    addDriverByEmail,
    getAllDrivers,
    removeDriver,
    updateDriverStartingBalance,
} from '../../services/driversService'
import {
    deleteDriverTrip,
    getDriverTrips,
    saveDriverTrip,
    updateDriverTrip,
} from '../../services/tripsService'
import {
    deletePayment,
    getDriverPayments,
    savePayment,
    updatePayment,
} from '../../services/paymentsService'
import { getUserProfile } from '../../services/profileService'
import { useAuth } from '../../contexts/AuthContext'
import {
    calculateDriverBalance,
    getVatPercent,
} from '../../utils/driverBalance'

import './DriversPage.css'
import ConfirmDeleteForm from './components/confirm_delete_form'
import DriverForm from './components/driver_form'
import DriverGroupCard from './components/driver_group_card'
import DriverItem from './components/driver_item'
import DriversSection from './components/drivers_section'
import DriverTripForm from './components/driver_trip_form'
import DriverTripItem from './components/driver_trip_item'
import PaymentForm from './components/payment_form'
import PaymentItem from './components/payment_item'
import Popup from '../../components/popup/popup'

function formatCurrency(value) {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)
}

function formatDate(value) {
    const date = new Date(value)

    if (!value || Number.isNaN(date.getTime())) {
        return 'לא צוין'
    }

    return new Intl.DateTimeFormat('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date)
}

function DriversPage() {
    const { user } = useAuth()
    const [vatPercent, setVatPercent] = useState(getVatPercent(user))

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

    const [editingTrip, setEditingTrip] = useState(null)
    const [editingPayment, setEditingPayment] = useState(null)

    // { type: 'trip' | 'payment' | 'driver', item }
    const [deleteTarget, setDeleteTarget] = useState(null)

    const [viewMode, setViewMode] = useState('category')
    const [selectedDriverId, setSelectedDriverId] =
        useState(null)

    const registeredDrivers = drivers.filter(
        (driver) => !driver.pending
    )

    const driverGroups = drivers.map((driver) => {
        const driverTrips = trips.filter(
            (trip) => trip.user_id === driver.id
        )

        const driverPayments = payments.filter(
            (payment) => payment.driver_id === driver.id
        )

        return {
            driver,
            trips: driverTrips,
            payments: driverPayments,
            balance: calculateDriverBalance(
                driver,
                driverTrips,
                driverPayments
            ),
        }
    })

    const balancesLoading = tripsLoading || paymentsLoading

    useEffect(() => {
        initialize()
    }, [])

    // אחוז המע״מ נלקח מעמוד ההגדרות
    useEffect(() => {
        if (!user?.id) return

        getUserProfile(user.id)
            .then((profile) => setVatPercent(getVatPercent(profile)))
            .catch((error) =>
                console.error('Error loading VAT settings:', error)
            )
    }, [user])

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

    const closeTripPopup = () => {
        setIsAddTripPopupOpen(false)
        setSelectedDriverId(null)
        setEditingTrip(null)
    }

    const closePaymentPopup = () => {
        setIsAddPaymentPopupOpen(false)
        setSelectedDriverId(null)
        setEditingPayment(null)
    }

    const openEditTripPopup = (trip) => {
        setEditingTrip(trip)
        setIsAddTripPopupOpen(true)
    }

    const openEditPaymentPopup = (payment) => {
        setEditingPayment(payment)
        setIsAddPaymentPopupOpen(true)
    }

    // Only send the date when it was changed, so the original time
    // of the record is kept.
    const getChangedDate = (newDate, originalValue) => {
        const original = new Date(originalValue)

        if (
            !Number.isNaN(original.getTime()) &&
            original.toISOString().split('T')[0] === newDate
        ) {
            return null
        }

        return newDate
    }

    const handleEditTrip = async ({
        tripDate,
        price,
        description,
    }) => {
        const updatedTrip = await updateDriverTrip(editingTrip.id, {
            tripDate: getChangedDate(tripDate, editingTrip.created_at),
            price,
            description,
        })

        setTrips((current) =>
            current.map((item) =>
                item.id === updatedTrip.id
                    ? { ...item, ...updatedTrip }
                    : item
            )
        )

        closeTripPopup()
    }

    const handleEditPayment = async ({
        paymentDate,
        amount,
        description,
    }) => {
        const updatedPayment = await updatePayment(editingPayment.id, {
            paymentDate: getChangedDate(
                paymentDate,
                editingPayment.created_at
            ),
            amount,
            description,
        })

        setPayments((current) =>
            current.map((item) =>
                item.id === updatedPayment.id
                    ? { ...item, ...updatedPayment }
                    : item
            )
        )

        closePaymentPopup()
    }

    const handleDeleteTrip = async (trip) => {
        await deleteDriverTrip(trip.id)

        setTrips((current) =>
            current.filter((item) => item.id !== trip.id)
        )

        setDeleteTarget(null)
    }

    const handleDeletePayment = async (payment) => {
        await deletePayment(payment.id)

        setPayments((current) =>
            current.filter((item) => item.id !== payment.id)
        )

        setDeleteTarget(null)
    }

    const handleDeleteDriver = async (driver) => {
        await removeDriver(driver)

        setDrivers((current) =>
            current.filter((item) => item.id !== driver.id)
        )
        setTrips((current) =>
            current.filter((item) => item.user_id !== driver.id)
        )
        setPayments((current) =>
            current.filter((item) => item.driver_id !== driver.id)
        )

        setDeleteTarget(null)
    }

    const getDeletePopupProps = () => {
        if (!deleteTarget) {
            return null
        }

        const { type, item } = deleteTarget

        if (type === 'trip') {
            return {
                title: 'מחיקת נסיעה',
                itemLabel: 'הנסיעה',
                details: [
                    { label: 'נהג', value: item.driverName },
                    { label: 'תאריך', value: formatDate(item.created_at) },
                    {
                        label: 'מחיר',
                        value: formatCurrency(item.calculated_price),
                    },
                    {
                        label: 'תיאור',
                        value:
                            item.description ||
                            `נסיעה מ${item.origin || 'לא ידוע'} ל${item.destination || 'לא ידוע'}`,
                    },
                ],
                onConfirm: () => handleDeleteTrip(item),
            }
        }

        if (type === 'payment') {
            return {
                title: 'מחיקת תשלום',
                itemLabel: 'התשלום',
                details: [
                    { label: 'נהג', value: item.driverName },
                    { label: 'תאריך', value: formatDate(item.created_at) },
                    { label: 'סכום', value: formatCurrency(item.amount) },
                    ...(item.description
                        ? [{ label: 'הערה', value: item.description }]
                        : []),
                ],
                onConfirm: () => handleDeletePayment(item),
            }
        }

        const group = driverGroups.find(
            ({ driver }) => driver.id === item.id
        )

        return {
            title: 'מחיקת נהג',
            itemLabel: `הנהג ${item.full_name || item.email}`,
            details: [
                { label: 'שם', value: item.full_name || 'לא צוין' },
                { label: 'מייל', value: item.email },
                ...(item.pending
                    ? []
                    : [
                        {
                            label: 'נסיעות',
                            value: group?.trips.length ?? 0,
                        },
                        {
                            label: 'תשלומים',
                            value: group?.payments.length ?? 0,
                        },
                    ]),
                {
                    label: 'יתרה לתשלום',
                    value: formatCurrency(group?.balance),
                },
            ],
            note: item.pending
                ? 'ההזמנה תבוטל, והמשתמש לא יוגדר כנהג כשיתחבר.'
                : 'הנהג וכל הנסיעות והתשלומים שלו יסומנו כמחוקים, והנהג לא יוכל להיכנס יותר כנהג.',
            onConfirm: () => handleDeleteDriver(item),
        }
    }

    const deletePopupProps = getDeletePopupProps()

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
                                    balance,
                                }) => (
                                    <DriverGroupCard
                                        key={driver.id}
                                        driver={driver}
                                        trips={driverTrips}
                                        payments={driverPayments}
                                        balance={balance}
                                        vatPercent={vatPercent}
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
                                        onEditTrip={openEditTripPopup}
                                        onEditPayment={openEditPaymentPopup}
                                        onDeleteTrip={(trip) =>
                                            setDeleteTarget({
                                                type: 'trip',
                                                item: trip,
                                            })
                                        }
                                        onDeletePayment={(payment) =>
                                            setDeleteTarget({
                                                type: 'payment',
                                                item: payment,
                                            })
                                        }
                                        onDeleteDriver={() =>
                                            setDeleteTarget({
                                                type: 'driver',
                                                item: driver,
                                            })
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
                <DriversSection
                    title="נהגים"
                    description="כל הנהגים במקום אחד"
                    icon={Users}
                    countLabel={`סך נהגים ${drivers.length}`}
                    addLabel="הוספת נהג"
                    onAdd={() => setIsAddPopupOpen(true)}
                >

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
                            {driverGroups.map(({ driver, balance }) => (
                                <DriverItem
                                    key={driver.id}
                                    driver={driver}
                                    balance={balance}
                                    balanceLoading={balancesLoading}
                                    onDelete={() =>
                                        setDeleteTarget({
                                            type: 'driver',
                                            item: driver,
                                        })
                                    }
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
                </DriversSection>

                {tripsError && (
                    <div className="drivers-error">
                        {tripsError}
                    </div>
                )}

                <DriversSection
                    title="נסיעות"
                    description="כל הנסיעות שהוקצו לנהגים"
                    icon={BusFront}
                    countLabel={`סך נסיעות ${trips.length}`}
                    addLabel="הוספת נסיעה"
                    onAdd={() => openAddTripPopup()}
                    addDisabled={registeredDrivers.length === 0}
                >

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
                                    vatPercent={vatPercent}
                                    onEdit={() =>
                                        openEditTripPopup(trip)
                                    }
                                    onDelete={() =>
                                        setDeleteTarget({
                                            type: 'trip',
                                            item: trip,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    )}
                </DriversSection>

                {paymentsError && (
                    <div className="drivers-error">
                        {paymentsError}
                    </div>
                )}

                <DriversSection
                    title="תשלומים"
                    description="כל התשלומים שבוצעו לנהגים"
                    icon={HandCoins}
                    countLabel={`סך תשלומים ${payments.length}`}
                    addLabel="הוספת תשלום"
                    onAdd={() => openAddPaymentPopup()}
                    addDisabled={registeredDrivers.length === 0}
                >

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
                                    onEdit={() =>
                                        openEditPaymentPopup(payment)
                                    }
                                    onDelete={() =>
                                        setDeleteTarget({
                                            type: 'payment',
                                            item: payment,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    )}
                </DriversSection>
                    </>
                )}
            </div>

            <Popup
                isOpen={isAddPopupOpen}
                onClose={() => setIsAddPopupOpen(false)}
                titleId="driver-form-title"
            >
                <DriverForm
                    onSubmit={handleAddDriver}
                    onCancel={() => setIsAddPopupOpen(false)}
                />
            </Popup>

            <Popup
                isOpen={isAddTripPopupOpen}
                onClose={closeTripPopup}
                titleId="driver-trip-form-title"
            >
                <DriverTripForm
                    key={editingTrip?.id || 'new-trip'}
                    drivers={registeredDrivers}
                    initialDriverId={selectedDriverId}
                    lockDriver={Boolean(selectedDriverId)}
                    trip={editingTrip}
                    vatPercent={vatPercent}
                    onSubmit={
                        editingTrip ? handleEditTrip : handleAddTrip
                    }
                    onCancel={closeTripPopup}
                />
            </Popup>

            <Popup
                isOpen={isAddPaymentPopupOpen}
                onClose={closePaymentPopup}
                titleId="payment-form-title"
            >
                <PaymentForm
                    key={editingPayment?.id || 'new-payment'}
                    drivers={registeredDrivers}
                    initialDriverId={selectedDriverId}
                    lockDriver={Boolean(selectedDriverId)}
                    payment={editingPayment}
                    onSubmit={
                        editingPayment
                            ? handleEditPayment
                            : handleAddPayment
                    }
                    onCancel={closePaymentPopup}
                />
            </Popup>

            <Popup
                isOpen={Boolean(deletePopupProps)}
                onClose={() => setDeleteTarget(null)}
                titleId="confirm-delete-title"
            >
                {deletePopupProps && (
                    <ConfirmDeleteForm
                        {...deletePopupProps}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}
            </Popup>
        </div>
    )
}

export default DriversPage
