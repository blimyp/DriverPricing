import { getVehicleAgeGroup } from './vehicles'

// מנוע תמחור נסיעה – כל הסכומים ללא מע״מ, חוץ מהמחירים הסופיים ללקוח

const toNumber = (value) => {
    const number = Number(value)

    return Number.isFinite(number) ? number : 0
}

export const TRIP_TYPE_LABELS = {
    dropoff: 'הקפצה',
    dedicated: 'רכב צמוד',
}

// עלות קבועה לק״מ: (פחת + ריבית + קבועות + חלק בתקורה) / ק״מ שנתי
export function calculateFixedCostPerKm({ vehicle, settings, fleetSize }) {
    const ageGroup = getVehicleAgeGroup(vehicle.manufacture_year) || 'new'

    const depreciationYearly =
        toNumber(vehicle.purchase_price) *
        (toNumber(settings[`depreciation_rate_${ageGroup}`]) / 100)

    const interestYearly = toNumber(vehicle.financing_monthly_interest) * 12

    const fixedYearly =
        toNumber(vehicle.insurance_yearly) +
        toNumber(vehicle.other_fixed_yearly)

    const overheadYearly =
        (toNumber(settings.company_overhead_monthly) * 12) /
        Math.max(toNumber(fleetSize), 1)

    const annualKm = toNumber(vehicle.annual_km_estimate)

    const totalYearly =
        depreciationYearly + interestYearly + fixedYearly + overheadYearly

    return {
        ageGroup,
        depreciationYearly,
        interestYearly,
        fixedYearly,
        overheadYearly,
        totalYearly,
        perKm: annualKm > 0 ? totalYearly / annualKm : 0,
    }
}

/**
 * מחשב את מחיר הנסיעה ואת הרווח הצפוי.
 *
 * trip: {
 *   distanceKm      – מרחק המסלול
 *   driverHours     – שעות נהג (נסיעה + הכנה + המתנה)
 *   tolls           – אגרות וחניונים
 *   tripType        – 'dropoff' | 'dedicated'
 *   driverPaymentType – 'hourly' | 'percentage'
 * }
 */
export function calculateTripPrice({ vehicle, settings, fleetSize, trip }) {
    const deadheadKm = toNumber(settings.deadhead_km)
    const totalKm = toNumber(trip.distanceKm) + deadheadKm

    const fixed = calculateFixedCostPerKm({ vehicle, settings, fleetSize })
    const fixedCost = totalKm * fixed.perKm

    // צריכת דלק ומחיר מינימום מוגדרים לפי סוג הרכב, לא לכל רכב בנפרד
    const kmPerLiter = toNumber(settings[`${vehicle.vehicle_type}_km_per_liter`])

    if (kmPerLiter <= 0) {
        throw new Error('לא הוגדרה צריכת דלק לסוג הרכב הזה בעמוד ההגדרות')
    }

    const fuelCost =
        (totalKm / kmPerLiter) * toNumber(settings.fuel_price_per_liter)

    const maintenanceCost =
        totalKm * toNumber(settings[`maintenance_per_km_${fixed.ageGroup}`])

    const tolls = toNumber(trip.tolls)

    const dedicatedSurchargePercent =
        trip.tripType === 'dedicated'
            ? toNumber(settings.dedicated_surcharge_percent)
            : 0
    const multiplier = 1 + dedicatedSurchargePercent / 100

    const margin = toNumber(settings.target_margin_percent) / 100
    const isPercentageDriver = trip.driverPaymentType === 'percentage'
    const driverShare = isPercentageDriver
        ? toNumber(settings.driver_percentage) / 100
        : 0

    if (margin + driverShare >= 1) {
        throw new Error('אחוז הרווח ואחוז הנהג יחד חייבים להיות פחות מ־100%')
    }

    // בתשלום שעתי – עלות הנהג חלק מהעלות. באחוזים – נגזרת מהמחיר עצמו
    const hourlyDriverCost = isPercentageDriver
        ? 0
        : toNumber(trip.driverHours) * toNumber(settings.hourly_driver_price)

    const baseCost =
        fixedCost + fuelCost + maintenanceCost + hourlyDriverCost + tolls

    const adjustedCost = baseCost * multiplier

    const calculatedNet = adjustedCost / (1 - margin - driverShare)
    const minTripPrice = toNumber(settings[`${vehicle.vehicle_type}_min_trip_price`])
    const isFloorApplied = calculatedNet < minTripPrice
    const priceNet = Math.max(calculatedNet, minTripPrice)

    const cashDiscount = toNumber(settings.cash_discount_percent) / 100
    const cashPriceNet = priceNet * (1 - cashDiscount)

    const vatRate = toNumber(settings.vat_percent) / 100

    const buildRoute = (net) => {
        const driverCost = isPercentageDriver
            ? net * driverShare
            : hourlyDriverCost
        const totalCost = adjustedCost + (isPercentageDriver ? driverCost : 0)
        const profit = net - totalCost

        return {
            net,
            gross: net * (1 + vatRate),
            vat: net * vatRate,
            driverCost,
            totalCost,
            profit,
            profitPercent: net > 0 ? (profit / net) * 100 : 0,
        }
    }

    return {
        totalKm,
        deadheadKm,
        multiplier,
        dedicatedSurchargePercent,
        fixed,
        costs: {
            fixed: fixedCost,
            fuel: fuelCost,
            maintenance: maintenanceCost,
            driver: hourlyDriverCost,
            tolls,
            base: baseCost,
            adjusted: adjustedCost,
        },
        minTripPrice,
        isFloorApplied,
        regular: buildRoute(priceNet),
        cash: buildRoute(cashPriceNet),
    }
}
