import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../../../contexts/AuthContext"
import { saveTrip } from "../../../../services/tripsService"
import { calculateTripPrice } from "../../../../utils/pricingEngine"
import { getDriverCostLabel } from "../../../../utils/driverCost"

const formatHours = (hours) =>
    `${Number(hours.toFixed(2)).toLocaleString('he-IL')} ש׳`

const formatMoney = (value) =>
    `₪${Number(value || 0).toLocaleString('he-IL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`

function PriceResult({
    styles,
    form,
    vehicle,
    settings,
    fleetSize,
}) {
    const { user } = useAuth()

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')
    const [showDetails, setShowDetails] = useState(false)

    // בהקפצה – זמן הנסיעה מהמפה. ברכב צמוד – השעות שהוזנו
    const driverHours =
        form.tripType === 'dedicated'
            ? form.plannedDuration
            : form.routeDuration

    let result = null
    let calculationError = ''

    try {
        result = calculateTripPrice({
            vehicle,
            settings,
            fleetSize,
            trip: {
                distanceKm: form.distanceKm,
                driverHours,
                startTime: form.startTime,
                tolls: form.tolls,
                tripType: form.tripType,
                driverPaymentType: form.driverPaymentType,
            },
        })
    } catch (error) {
        calculationError = error.message
    }

    if (!vehicle || !settings || calculationError) {
        return (
            <section className={styles.priceResult}>
                <p className={styles.saveError}>
                    {calculationError || 'חסרים נתונים לחישוב המחיר'}
                </p>
            </section>
        )
    }

    const { regular, cash, costs } = result

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
                stops: form.stops,
                distance: form.distanceKm,
                duration: driverHours,
                calculatedPrice: Number(regular.net.toFixed(2)),
                tripType: vehicle.vehicle_type,
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

    const costRows = [
        { label: `עלות קבועה (₪${result.fixed.perKm.toFixed(2)} לק״מ)`, value: costs.fixed },
        { label: 'דלק', value: costs.fuel },
        { label: 'בלאי ותחזוקה', value: costs.maintenance },
        ...(result.driverCostDetails?.breakdown || []).map((group) => ({
            label: `נהג – ${formatHours(group.hours)} ${getDriverCostLabel(group)}`,
            value: group.cost,
        })),
        // באחוזים – חלק הנהג נגזר מהמחיר הרגיל
        ...(result.driverPercentage
            ? [{ label: `נהג (${result.driverPercentage}% מהמחיר הרגיל)`, value: regular.driverCost }]
            : []),
        ...(costs.tolls ? [{ label: 'אגרות וחניונים', value: costs.tolls }] : []),
        ...(result.dedicatedSurchargePercent
            ? [{ label: `תוספת רכב צמוד (${result.dedicatedSurchargePercent}%)`, value: costs.adjusted - costs.base }]
            : []),
    ]

    const routes = [
        { key: 'regular', title: 'מחיר רגיל (אשראי)', data: regular },
        { key: 'cash', title: 'מחיר מוזל (מקדמה + מזומן)', data: cash },
    ]

    return (
        <section className={styles.priceResult}>

            <div className={`${styles.resultContent} ${styles.priceRoutes}`}>
                {routes.map((route) => (
                    <div className={styles.priceRouteCard} key={route.key}>
                        <span className={styles.resultLabel}>
                            {route.title}
                        </span>

                        <p className={styles.resultVatNote}>
                            לא כולל מע״מ
                        </p>

                        <strong className={styles.resultPrice}>
                            {formatMoney(route.data.net)}
                        </strong>

                        <p className={styles.resultDescription}>
                            מחיר כולל מע״מ: {formatMoney(route.data.gross)}
                        </p>

                        <p
                            className={`${styles.resultProfit} ${
                                route.data.profit >= 0
                                    ? styles.profitPositive
                                    : styles.profitNegative
                            }`}
                        >
                            רווח {formatMoney(route.data.profit)} ({route.data.profitPercent.toFixed(1)}%)
                        </p>
                    </div>
                ))}
            </div>

            {result.isFloorApplied && (
                <p className={`${styles.resultDescription} ${styles.resultContent}`}>
                    המחיר הועלה למחיר המינימום של סוג הרכב ({formatMoney(result.minTripPrice)} לפני מע״מ)
                </p>
            )}

            <div className={`${styles.resultContent} ${styles.profitPanel}`}>
                <button
                    type="button"
                    className={styles.profitToggle}
                    onClick={() => setShowDetails((current) => !current)}
                >
                    {showDetails ? 'הסתרת פירוט פנימי' : 'פירוט פנימי – עלויות ורווח'}
                </button>

                {showDetails && (
                    <p className={styles.settingsHint}>
                        כל העלויות בפירוט מחושבות לפי הנתונים שהגדרת בעמוד{' '}
                        <Link to="/prices" className={styles.settingsLink}>
                            ההגדרות
                        </Link>
                        , ושינוי שם יתעדכן כאן בתמחור הבא.
                    </p>
                )}

                {showDetails && (
                    <p className={styles.detailsDistance}>
                        מרחק לחישוב: {result.totalKm.toFixed(1)} ק״מ (כולל {result.deadheadKm} מנהלתי)
                    </p>
                )}

                {showDetails && result.driverCostDetails && (
                    <p className={styles.detailsDistance}>
                        עלות מעסיק לשעה רגילה: {formatMoney(result.driverCostDetails.hourlyCost)}
                        {result.driverCostDetails.isNightShift &&
                            ` · משמרת לילה (יום עבודה של ${result.driverCostDetails.regularLimit} שעות)`}
                    </p>
                )}

                {showDetails && (
                    <table className={styles.profitTable}>
                        <tbody>
                            {costRows.map((row) => (
                                <tr key={row.label}>
                                    <td>{row.label}</td>
                                    <td>{formatMoney(row.value)}</td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td>סה״כ הוצאות</td>
                                <td>{formatMoney(regular.totalCost)}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
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
                    <p>
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
