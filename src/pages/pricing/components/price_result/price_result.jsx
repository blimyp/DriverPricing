import { useState } from "react"
import { useAuth } from "../../../../contexts/AuthContext"
import { saveTrip } from "../../../../services/tripsService"

function PriceResult({
    styles,
    price,
    form
}) {
    const { user } = useAuth()

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')

    async function handleSaveTrip() {
        if (!user) {
            setSaveError('יש להתחבר כדי לשמור את הנסיעה')
            return
        }

        if (price === null) {
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
                calculatedPrice: price,
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
                <span className={styles.resultLabel}>
                    המחיר המחושב
                </span>

                <h2 className={styles.resultTitle}>
                    מחיר הנסיעה
                </h2>

                <strong className={styles.resultPrice}>
                    ₪{price.toFixed(2)}
                </strong>

                <p className={styles.resultDescription}>
                    המחיר חושב לפי המרחק
                    וסוג הרכב שבחרת.
                </p>
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