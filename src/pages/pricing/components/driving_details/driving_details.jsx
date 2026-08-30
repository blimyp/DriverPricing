import { CarFront, Clock3, Percent, Route } from "lucide-react"

function DrivingDetails({
    styles,
    handleChange,
    form
}) {
    const isPercentage = form.driverPaymentType === 'percentage'

    function handlePaymentTypeChange() {
        handleChange({
            target: {
                name: 'driverPaymentType',
                value: isPercentage
                    ? 'hourly'
                    : 'percentage',
            },
        })
    }

    return (
        <>
            <div className={styles.routeSummary}>
                <div className={styles.routeSummaryItem}>
                    <span>מרחק מסלול</span>
                    <strong>{form.distanceKm || '-'} ק״מ</strong>
                </div>

                <div className={styles.routeSummaryItem}>
                    <span>זמן נסיעה משוער</span>
                    <strong>{form.routeDuration || '-'} שעות</strong>
                </div>
            </div>

            <div className={styles.formCardFields}>

                <div className={styles.formField}>
                    <label
                        className={styles.formLabel}
                        htmlFor="vehicleType"
                    >
                        סוג רכב
                    </label>

                    <div className={styles.inputWrapper}>
                        <CarFront
                            className={styles.inputIcon}
                            strokeWidth={1.9}
                            aria-hidden="true"
                        />

                        <select
                            className={`
                            ${styles.formControl}
                            ${styles.formSelect}
                        `}
                            id="vehicleType"
                            name="vehicleType"
                            value={form.vehicleType}
                            onChange={handleChange}
                        >
                            <option value="van">
                                טנדר
                            </option>

                            <option value="minibus">
                                מיניבוס
                            </option>

                            <option value="bus">
                                אוטובוס
                            </option>
                        </select>
                    </div>
                </div>

                <div className={styles.formField}>
                    <label
                        className={styles.formLabel}
                        htmlFor="plannedDuration"
                    >
                        שעות נסיעה מתוכננות
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
                            value={form.plannedDuration}
                            onChange={handleChange}
                        />

                        <span className={styles.inputSuffix}>
                            שעות
                        </span>
                    </div>
                </div>

                <div className={styles.paymentSwitchWrapper}>
                    <span className={styles.formLabel}>
                        תשלום לנהג
                    </span>

                    <div
                        className={styles.paymentSwitchArea}
                        onClick={handlePaymentTypeChange}
                    >
                        <div
                            className={`${styles.paymentSwitchLabel} ${isPercentage
                                ? styles.paymentSwitchLabelActive
                                : ''
                                }`}
                        >
                            <Percent
                                className={styles.paymentSwitchIcon}
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />

                            <span>אחוזים</span>
                        </div>

                        <div
                            className={`${styles.paymentSwitchLabel} ${!isPercentage
                                ? styles.paymentSwitchLabelActive
                                : ''
                                }`}
                        >
                            <Clock3
                                className={styles.paymentSwitchIcon}
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />

                            <span>מחיר שעתי</span>
                        </div>

                        <div
                            className={`${styles.paymentSwitchThumb} ${isPercentage
                                ? styles.paymentSwitchThumbRight
                                : ''
                                }`}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default DrivingDetails