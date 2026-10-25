// חישוב עלות מעסיק לנסיעה לפי שעות רגילות, שעות נוספות, לילה, שבת וחג

export const DRIVER_COST_DEFAULTS = {
    driver_cost_factor: 1.3,
    employer_national_insurance_percent: 7.5,
    regular_shift_hours: 8,
    night_shift_hours: 7,
    overtime_rate_first: 125,
    overtime_rate_after: 150,
    rest_day_rate: 150,
}

// כמה שעות נוספות ראשונות מקבלות את התעריף הנמוך
const FIRST_OVERTIME_HOURS = 2

// משמרת עם לפחות שעתיים בין 22:00 ל־06:00 היא משמרת לילה
const NIGHT_START_HOUR = 22
const NIGHT_END_HOUR = 6
const MIN_NIGHT_HOURS = 2

const SLICE_HOURS = 0.25

// ימי חג שבהם חל תעריף מנוחה: ראש השנה, יום כיפור, סוכות, שמיני עצרת, פסח, שביעי של פסח, שבועות
const REST_HOLIDAYS = {
    Tishri: [1, 2, 10, 15, 22],
    Nisan: [15, 21],
    Sivan: [6],
}

// שעת שקיעה משוערת בישראל לפי חודש (כולל שעון קיץ) – מספיק לחלוקת השעות
const SUNSET_BY_MONTH = [17, 17.4, 18, 19.2, 19.5, 19.75, 19.75, 19.3, 18.75, 18, 16.7, 16.6]
const REST_STARTS_BEFORE_SUNSET = 0.33
const REST_ENDS_AFTER_SUNSET = 0.67

const hebrewDateFormat = new Intl.DateTimeFormat('en-u-ca-hebrew', {
    month: 'long',
    day: 'numeric',
})

const withDefault = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
        return fallback
    }

    const number = Number(value)

    return Number.isFinite(number) ? number : fallback
}

export const getDriverSetting = (settings, key) =>
    withDefault(settings?.[key], DRIVER_COST_DEFAULTS[key])

function isRestDay(date) {
    if (date.getDay() === 6) {
        return true
    }

    const parts = hebrewDateFormat.formatToParts(date)
    const month = parts.find((part) => part.type === 'month')?.value
    const day = Number(parts.find((part) => part.type === 'day')?.value)

    return REST_HOLIDAYS[month]?.includes(day) ?? false
}

function isRestTime(time) {
    const day = new Date(time.getFullYear(), time.getMonth(), time.getDate(), 12)
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const hour = time.getHours() + time.getMinutes() / 60
    const sunset = SUNSET_BY_MONTH[time.getMonth()]

    return (
        (isRestDay(day) && hour < sunset + REST_ENDS_AFTER_SUNSET) ||
        (isRestDay(nextDay) && hour >= sunset - REST_STARTS_BEFORE_SUNSET)
    )
}

function isNightTime(time) {
    const hour = time.getHours()

    return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR
}

/**
 * כל נסיעה נחשבת משמרת נפרדת.
 * הפנסיה, החופשה וההבראה (המקדם) מחושבות על השכר הרגיל בלבד,
 * ועל תוספת השעות מוסיפים רק ביטוח לאומי.
 */
export function calculateDriverCost({ startTime, hours, settings }) {
    const totalHours = Math.max(withDefault(hours, 0), 0)
    const factor = getDriverSetting(settings, 'driver_cost_factor')
    // עד שעמודת הברוטו נוספת למסד – גוזרים אותו מעלות שעת הנהג הישנה
    const grossHourly = settings && 'driver_gross_hourly' in settings
        ? withDefault(settings.driver_gross_hourly, 0)
        : withDefault(settings?.hourly_driver_price, 0) / Math.max(factor, 1)

    const hourlyCost = grossHourly * factor
    const baseWage = grossHourly

    const nationalInsurance =
        getDriverSetting(settings, 'employer_national_insurance_percent') / 100
    const overtimeRateFirst = getDriverSetting(settings, 'overtime_rate_first')
    const overtimeRateAfter = getDriverSetting(settings, 'overtime_rate_after')
    const restDayExtra = getDriverSetting(settings, 'rest_day_rate') - 100

    const start = new Date(startTime)
    const hasStartTime = Boolean(startTime) && !Number.isNaN(start.getTime())

    const slices = []

    for (let worked = 0; worked < totalHours; worked += SLICE_HOURS) {
        const sliceHours = Math.min(SLICE_HOURS, totalHours - worked)
        const middle = hasStartTime
            ? new Date(start.getTime() + (worked + sliceHours / 2) * 3600000)
            : null

        slices.push({
            worked,
            hours: sliceHours,
            isNight: middle ? isNightTime(middle) : false,
            isRest: middle ? isRestTime(middle) : false,
        })
    }

    const nightHours = slices
        .filter((slice) => slice.isNight)
        .reduce((sum, slice) => sum + slice.hours, 0)
    const isNightShift = nightHours >= MIN_NIGHT_HOURS

    const regularLimit = getDriverSetting(
        settings,
        isNightShift ? 'night_shift_hours' : 'regular_shift_hours'
    )

    const groups = new Map()

    slices.forEach((slice) => {
        const isOvertime = slice.worked >= regularLimit

        let rate = 100

        if (isOvertime) {
            rate = slice.worked < regularLimit + FIRST_OVERTIME_HOURS
                ? overtimeRateFirst
                : overtimeRateAfter
        }

        if (slice.isRest) {
            rate += restDayExtra
        }

        const cost =
            slice.hours * hourlyCost +
            slice.hours * baseWage * (rate / 100 - 1) * (1 + nationalInsurance)

        const key = `${slice.isRest}-${isOvertime}-${rate}`
        const group = groups.get(key) || {
            key,
            isRest: slice.isRest,
            isOvertime,
            rate,
            hours: 0,
            cost: 0,
        }

        group.hours += slice.hours
        group.cost += cost
        groups.set(key, group)
    })

    const breakdown = [...groups.values()]

    return {
        hourlyCost,
        isNightShift,
        regularLimit,
        breakdown,
        total: breakdown.reduce((sum, group) => sum + group.cost, 0),
    }
}

export function getDriverCostLabel(group) {
    const name = group.isRest
        ? group.isOvertime ? 'שבת וחג, שעות נוספות' : 'שבת וחג'
        : group.isOvertime ? 'שעות נוספות' : 'שעות רגילות'

    return group.rate === 100 ? name : `${name} (${group.rate}%)`
}
