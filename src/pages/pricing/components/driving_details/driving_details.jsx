import { CarFront, Clock3, Route } from "lucide-react"

function DrivingDetails({
    styles,
    handleChange,
    form
}) {
    return (
        <div className={styles.formCardFields}>
            <div className={styles.formField}>
                <label
                    className={styles.formLabel}
                    htmlFor="distanceKm"
                >
                    מרחק בקילומטרים
                </label>

                <div
                    className={styles.inputWrapper}
                >
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
                        inputMode="decimal"
                        placeholder="לדוגמה: 45"
                        value={form.distanceKm}
                        onChange={handleChange}
                    />

                    <span className={styles.inputSuffix}  >
                        ק״מ
                    </span>
                </div>
            </div>

            <div className={styles.formField}>
                <label
                    className={styles.formLabel}
                    htmlFor="duration"
                >
                    משך זמן הנסיעה
                </label>

                <div
                    className={styles.inputWrapper}
                >
                    <Clock3
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
                        inputMode="decimal"
                        placeholder="לדוגמה: 5"
                        value={form.duration}
                        onChange={handleChange}
                    />

                    <span className={styles.inputSuffix}>
                        שעות
                    </span>
                </div>

                <div className={styles.formField}>
                    <label
                        className={styles.formLabel}
                        htmlFor="vehicleType"
                    >
                        סוג רכב
                    </label>

                    <div className={styles.inputWrapper}  >
                        <CarFront
                            className={
                                styles.inputIcon
                            }
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
            </div>
        </div>
    )
}

export default DrivingDetails