import { useEffect, useState } from "react"
import { useAuth } from "../../../../contexts/AuthContext"
import { saveTrip } from "../../../../services/tripsService"
import { getVehiclePrices } from "../../../../services/vehiclePricesService"

const literPrice = 7.5

function PriceResult({
    styles,
    form
}) {
    const { user } = useAuth()

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')

    const [vehiclePrices, setVehiclePrices] = useState([])
    const [pricesLoading, setPricesLoading] = useState(true)
    const [pricesError, setPricesError] = useState('')

    useEffect(() => {
        async function loadPrices() {
            try {
                setPricesLoading(true)
                setPricesError('')

                const data = await getVehiclePrices()

                setVehiclePrices(data)
            } catch (error) {
                console.error('Get vehicle prices error:', error)

                setPricesError(
                    error?.message ||
                    'אירעה שגיאה בטעינת מחירי הרכבים'
                )
            } finally {
                setPricesLoading(false)
            }
        }

        loadPrices()
    }, [])

    if (pricesLoading) {
        return (
            <section className={styles.priceResult}>
                <p>טוען מחירים...</p>
            </section>
        )
    }

    if (pricesError) {
        return (
            <section className={styles.priceResult}>
                <p className={styles.saveError}>
                    {pricesError}
                </p>
            </section>
        )
    }

    const selectedVehicle = vehiclePrices.find(
        vehicle => vehicle.vehicle_type === form.vehicleType
    )

    if (!selectedVehicle) {
        return (
            <section className={styles.priceResult}>
                <p className={styles.saveError}>
                    לא נמצא מחיר עבור סוג הרכב שנבחר
                </p>
            </section>
        )
    }

    const distance = Number(form.distanceKm)

    const fuelPrice =
        (distance / Number(selectedVehicle.km_cnt_in_liter)) *
        literPrice

    let driverPrice = 0
    let totalPrice = 0

    if (form.driverPaymentType === 'hourly') {
        driverPrice =
            Number(form.routeDuration) *
            Number(form.driverHourlyRate)

        totalPrice = driverPrice + fuelPrice
    } else {
        totalPrice = fuelPrice / 0.7
        driverPrice = totalPrice * 0.3
    }

    async function handleSaveTrip() {
        if (!user) {
            setSaveError('יש להתחבר כדי לשמור את הנסיעה')
            return
        }

        if (!Number.isFinite(totalPrice)) {
            setSaveError('יש לחשב את מחיר הנסיעה לפני השמירה')
            return
        }

        try {
            setSaveLoading(true)
            setSaveMessage('')
            setSaveError('')

            await saveTrip({
                userId: user.id,
                origin: form.origin,
                destination: form.destination,
                stops: form.stops,
                distance: form.distanceKm,
                duration: form.routeDuration,
                calculatedPrice: totalPrice,
                tripType: form.vehicleType,
                driverPaymentType: form.driverPaymentType,
                driverHourlyRate: form.driverHourlyRate,
                driverPercentage: form.driverPercentage,
            })

            setSaveMessage('הנסיעה נשמרה בהצלחה')
        } catch (error) {
            console.error('Save trip error:', error)

            setSaveError(
                error?.message ||
                'אירעה שגיאה בשמירת הנסיעה'
            )
        } finally {
            setSaveLoading(false)
        }
    }

    return (
        <section className={styles.priceResult}>
            <div className={styles.resultDecoration}>
                <span
                    className={`
                        ${styles.resultRing}
                        ${styles.resultRingOne}
                    `}
                />

                <span
                    className={`
                        ${styles.resultRing}
                        ${styles.resultRingTwo}
                    `}
                />
            </div>

            <div className={styles.resultContent}>
                <p className={styles.resultTitle}>
                    מחיר דלק לנסיעה זו: {fuelPrice.toFixed(2)}
                </p>

                <p className={styles.resultTitle}>
                    מחיר נהג לנסיעה זו: {driverPrice.toFixed(2)}
                </p>

                <strong className={styles.resultPrice}>
                    ₪{totalPrice.toFixed(2)}
                </strong>
            </div>

            <div className={styles.saveTripArea}>
                <button
                    type="button"
                    onClick={handleSaveTrip}
                    disabled={saveLoading}
                >
                    {saveLoading
                        ? 'שומר נסיעה...'
                        : 'שמירת נסיעה'}
                </button>

                {saveMessage && (
                    <p className={styles.saveSuccess}>
                        {saveMessage}
                    </p>
                )}

                {saveError && (
                    <p className={styles.saveError}>
                        {saveError}
                    </p>
                )}
            </div>
        </section>
    )
}

export default PriceResult