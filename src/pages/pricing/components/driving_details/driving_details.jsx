import { CarFront, Clock3, Route } from "lucide-react"

function DrivingDetails({
    styles,
    handleChange,
    form
}) {
    return (
        <>
            <div className={styles.drivingDetails}>
                <div className={styles.drivingDetail}>
                    מרחק מסלול: {form.distanceKm || '-'} ק״מ
                </div>

                <div className={styles.drivingDetail}>
                    זמן נסיעה משוער: {form.routeDuration || '-'} שעות
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
            </div>
        </>
    )
}

export default DrivingDetails