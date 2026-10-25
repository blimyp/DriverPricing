import { ArrowLeft, CalendarClock, CarFront, Clock3, Percent, Repeat, Route, Ticket } from "lucide-react"
import { getVehicleDisplayName } from "../../../../utils/vehicles"
import { TRIP_TYPE_LABELS } from "../../../../utils/pricingEngine"

function VehicleField({ styles, vehicles, value, onChange }) {
    return (
        <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="vehicleId">
                רכב
            </label>

            <div className={styles.inputWrapper}>
                <CarFront
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <select
                    className={`${styles.formControl} ${styles.formSelect}`}
                    id="vehicleId"
                    name="vehicleId"
                    value={value}
                    onChange={onChange}
                >
                    <option value="">בחירת רכב</option>

                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {getVehicleDisplayName(vehicle)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

function TripTypeField({ styles, value, onChange }) {
    return (
        <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="tripType">
                סוג שירות
            </label>

            <div className={styles.inputWrapper}>
                <Route
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <select
                    className={`${styles.formControl} ${styles.formSelect}`}
                    id="tripType"
                    name="tripType"
                    value={value}
                    onChange={onChange}
                >
                    {Object.entries(TRIP_TYPE_LABELS).map(([type, label]) => (
                        <option key={type} value={type}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

function TollsField({ styles, value, onChange }) {
    return (
        <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="tolls">
                אגרות וחניונים (כביש 6, מנהרות וכו׳)
            </label>

            <div className={styles.inputWrapper}>
                <Ticket
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <input
                    className={styles.formControl}
                    id="tolls"
                    name="tolls"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    placeholder="0"
                    value={value}
                    onChange={onChange}
                />

                <span className={styles.inputSuffix}>₪</span>
            </div>
        </div>
    )
}

function StartTimeField({ styles, value, onChange }) {
    return (
        <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="startTime">
                מועד הנסיעה
            </label>

            <div className={styles.inputWrapper}>
                <CalendarClock
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <input
                    className={styles.formControl}
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}

function PlannedDurationField({ styles, value, onChange }) {
    return (
        <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="plannedDuration">
                כמה שעות הרכב צמוד (משוער)
            </label>

            <div className={styles.inputWrapper}>
                <Clock3
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <input
                    className={styles.formControl}
                    id="plannedDuration"
                    name="plannedDuration"
                    type="number"
                    min="0.1"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="לדוגמה: 5"
                    value={value}
                    onChange={onChange}
                />

                <span className={styles.inputSuffix}>שעות</span>
            </div>
        </div>
    )
}

function PaymentTypeField({ styles, value, onChange }) {
    const isPercentage = value === 'percentage'

    function handlePaymentTypeChange() {
        onChange({
            target: {
                name: 'driverPaymentType',
                value: isPercentage ? 'hourly' : 'percentage',
            },
        })
    }

    return (
        <div className={styles.paymentSwitchWrapper}>
            <span className={styles.formLabel}>תשלום לנהג</span>

            <button
                type="button"
                className={styles.paymentSwitchArea}
                onClick={handlePaymentTypeChange}
                aria-label={`תשלום לנהג: ${isPercentage ? 'אחוזים' : 'מחיר שעתי'}. לחיצה להחלפה`}
            >
                <span
                    className={`${styles.paymentSwitchLabel} ${isPercentage ? styles.paymentSwitchLabelActive : ''
                        }`}
                >
                    <Percent
                        className={styles.paymentSwitchIcon}
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>אחוזים</span>
                </span>

                <span
                    className={`${styles.paymentSwitchLabel} ${!isPercentage ? styles.paymentSwitchLabelActive : ''
                        }`}
                >
                    <Clock3
                        className={styles.paymentSwitchIcon}
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>מחיר שעתי</span>
                </span>

                <span
                    className={`${styles.paymentSwitchThumb} ${isPercentage ? styles.paymentSwitchThumbRight : ''
                        }`}
                />
            </button>
        </div>
    )
}

function RoundTripField({ styles, value, onChange }) {
    return (
        <div className={styles.paymentSwitchWrapper}>
            <span className={styles.formLabel}>כיוון הנסיעה</span>

            <button
                type="button"
                className={styles.paymentSwitchArea}
                onClick={() => onChange(!value)}
                aria-label={`כיוון הנסיעה: ${value ? 'הלוך חזור' : 'הלוך'}. לחיצה להחלפה`}
            >
                <span
                    className={`${styles.paymentSwitchLabel} ${!value ? styles.paymentSwitchLabelActive : ''
                        }`}
                >
                    <ArrowLeft
                        className={styles.paymentSwitchIcon}
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>הלוך</span>
                </span>

                <span
                    className={`${styles.paymentSwitchLabel} ${value ? styles.paymentSwitchLabelActive : ''
                        }`}
                >
                    <Repeat
                        className={styles.paymentSwitchIcon}
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>הלוך חזור</span>
                </span>

                <span
                    className={`${styles.paymentSwitchThumb} ${!value ? styles.paymentSwitchThumbRight : ''
                        }`}
                />
            </button>
        </div>
    )
}

export {
    RoundTripField,
    VehicleField,
    TripTypeField,
    TollsField,
    PlannedDurationField,
    StartTimeField,
    PaymentTypeField,
}
