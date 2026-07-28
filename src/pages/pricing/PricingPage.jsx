import { useState } from 'react';
import {
    MapPin,
    Navigation,
    Route,
    CarFront,
    Calculator,
    CircleAlert,
    BadgeCheck,
} from 'lucide-react';
import { saveTrip } from '../../services/tripsService'
import styles from './PricingPage.module.css'
import { useAuth } from '../../contexts/AuthContext';
import DriverPayment from './components/driver_payment/driver_payment';
import BackgroundSection from '../../components/background_section/background_section';

const vehiclePrices = {
    regular: {
        basePrice: 20,
        pricePerKm: 4,
    },
    large: {
        basePrice: 30,
        pricePerKm: 5.5,
    },
}

function PricingPage() {
    const { user } = useAuth()

    const [form, setForm] = useState({
        origin: '',
        destination: '',
        distanceKm: '',
        duration: '',
        vehicleType: 'regular',

        driverPaymentType: 'hourly',
        driverHourlyRate: '',
        driverPercentage: '',
    })

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')
    const [price, setPrice] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    function handleChange(event) {
        const { name, value } = event.target

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }))
    }

    function handleSubmit(event) {
        event.preventDefault()

        setErrorMessage('')
        setPrice(null)

        const distance = Number(form.distanceKm)

        if (!form.origin.trim() || !form.destination.trim()) {
            setErrorMessage('יש להזין מוצא ויעד')
            return
        }

        if (!Number.isFinite(distance) || distance <= 0) {
            setErrorMessage('יש להזין מרחק תקין')
            return
        }

        const pricing = vehiclePrices[form.vehicleType]

        const calculatedPrice =
            pricing.basePrice + distance * pricing.pricePerKm

        setPrice(calculatedPrice)
    }


    async function handleSaveTrip() {
        if (!user) {
            setSaveError('יש להתחבר כדי לשמור את הנסיעה')
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
                distance: form.distanceKm,
                duration: form.duration,
                calculatedPrice: price,
                tripType: form.vehicleType,
            })

            setSaveMessage('הנסיעה נשמרה בהצלחה')
        } catch (error) {
            console.error('Save trip error:', error)

            setSaveError(
                error?.message || 'אירעה שגיאה בשמירת הנסיעה'
            )
        } finally {
            setSaveLoading(false)
        }
    }

    return (
        <main className={styles.pricingPage} dir="rtl">

            <div className={styles.pricingContainer}>
                <header className={styles.pricingHeader}>
                    <h1 className={styles.pricingTitle}>
                        תמחור נסיעה
                        <strong> בצורה פשוטה ומדויקת</strong>
                    </h1>

                    <p className={styles.pricingSubtitle}>
                        מזינים את פרטי הנסיעה, בוחרים את סוג הרכב
                        ומקבלים מחיר מחושב באופן מיידי.
                    </p>
                </header>

                <BackgroundSection>
                    <form
                        className={styles.pricingForm}
                        onSubmit={handleSubmit}
                    >
                        <div className={`${styles.formField} ${styles.fieldOne}`}  >
                            <label className={styles.formLabel} htmlFor="origin"  >
                                מוצא
                            </label>

                            <div className={styles.inputWrapper}>
                                <MapPin
                                    className={styles.inputIcon}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <input
                                    className={styles.formControl}
                                    id="origin"
                                    name="origin"
                                    type="text"
                                    placeholder="לדוגמה: ירושלים"
                                    value={form.origin}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={`${styles.formField} ${styles.fieldTwo}`}  >
                            <label className={styles.formLabel} htmlFor="destination"      >
                                יעד
                            </label>

                            <div className={styles.inputWrapper}>
                                <Navigation
                                    className={styles.inputIcon}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <input
                                    className={styles.formControl}
                                    id="destination"
                                    name="destination"
                                    type="text"
                                    placeholder="לדוגמה: תל אביב"
                                    value={form.destination}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={`${styles.formField} ${styles.fieldThree}`}  >
                            <label className={styles.formLabel} htmlFor="distanceKm"  >
                                מרחק בקילומטרים
                            </label>

                            <div className={styles.inputWrapper}>
                                <Route
                                    className={styles.inputIcon}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />
                                <input
                                    className={styles.formControl}
                                    id="distanceKm"
                                    name="distanceKm"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="לדוגמה: 45"
                                    value={form.distanceKm}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={`${styles.formField} ${styles.fieldThree}`}  >
                            <label className={styles.formLabel} htmlFor="distanceKm"  >
                                משך זמן נסיעה משוער בשעות
                            </label>

                            <div className={styles.inputWrapper}>
                                <Route
                                    className={styles.inputIcon}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />
                                <input
                                    className={styles.formControl}
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="לדוגמה: 5"
                                    value={form.duration}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={`${styles.formField} ${styles.fieldFour}`}     >
                            <label className={styles.formLabel} htmlFor="vehicleType"     >
                                סוג רכב
                            </label>

                            <div className={styles.inputWrapper}>
                                <CarFront
                                    className={styles.inputIcon}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <select
                                    className={`${styles.formControl} ${styles.formSelect}`}
                                    id="vehicleType"
                                    name="vehicleType"
                                    value={form.vehicleType}
                                    onChange={handleChange}
                                >
                                    <option value="regular">
                                        רכב רגיל
                                    </option>

                                    <option value="large">
                                        רכב גדול
                                    </option>
                                </select>
                            </div>
                        </div>

                        <DriverPayment form={form} onChange={handleChange} />

                        <button className={styles.submitButton} type="submit"     >
                            <Calculator
                                className={styles.buttonIcon}
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <span>חשבי מחיר</span>
                        </button>
                    </form>
                </BackgroundSection>

                {errorMessage && (
                    <div
                        className={styles.errorMessage}
                        role="alert"
                    >
                        <CircleAlert
                            className={styles.messageIcon}
                            strokeWidth={2}
                            aria-hidden="true"
                        />

                        <span>{errorMessage}</span>
                    </div>
                )}

                {price !== null && (
                    <section className={styles.priceResult}>
                        <div className={styles.resultDecoration}>
                            <span
                                className={`${styles.resultRing} ${styles.resultRingOne}`}
                            />

                            <span
                                className={`${styles.resultRing} ${styles.resultRingTwo}`}
                            />
                        </div>

                        <div className={styles.resultIconWrapper}>
                            <BadgeCheck
                                className={styles.resultIcon}
                                strokeWidth={1.8}
                                aria-hidden="true"
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
                                המחיר חושב לפי המרחק וסוג הרכב
                                שבחרת.
                            </p>
                        </div>
                    </section>
                )}

                {price !== null && (
                    <div className={styles.saveTripArea}>
                        <button onClick={handleSaveTrip} disabled={saveLoading} >
                            {saveLoading ? 'שומר נסיעה...' : 'שמירת נסיעה'}
                        </button>

                        {saveMessage && (
                            <p>{saveMessage}</p>
                        )}

                        {saveError && (
                            <p>{saveError} </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}

export default PricingPage