import { useState } from "react"
import { useAuth } from "../../../../contexts/AuthContext"
import { saveTrip } from "../../../../services/tripsService"

const vehiclePrices = {
    van: {
        basePrice: 20,
        kmCntInLiter: 8.5,
    },
    minibus: {
        basePrice: 30,
        kmCntInLiter: 6.0,
    },
    bus: {
        basePrice: 40,
        kmCntInLiter: 6.0,
    }
}

const literPrice = 7.5;

function PriceResult({
    styles,
    form
}) {
    const { user } = useAuth()

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')

    const distance = Number(form.distanceKm)
    const selectedVehicle = vehiclePrices[form.vehicleType]
    const fuelPrice = distance / selectedVehicle.kmCntInLiter * literPrice;
    let driverPrice = 0;
    let totalPrice = 0;

    if (form.driverPaymentType == 'hourly') {
        driverPrice = form.duration * form.driverHourlyRate;
        totalPrice = driverPrice + fuelPrice;
    } else {
        totalPrice = fuelPrice / 0.7;
        driverPrice = totalPrice * 0.3;
    }

    async function handleSaveTrip() {
        if (!user) {
            setSaveError('יש להתחבר כדי לשמור את הנסיעה')
            return
        }

        if (fuelPrice === null) {
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
                duration: form.duration,
                calculatedPrice: fuelPrice,
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
        <section className={styles.priceResult} >
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
                    ₪{(fuelPrice + driverPrice).toFixed(2)}
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

export default PriceResult;