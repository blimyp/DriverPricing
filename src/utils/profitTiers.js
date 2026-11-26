// מדרגות רווח: מקדם שמכפיל את העלות, לפי סוג הרכב וגובה העלות.
// כל מדרגה שומרת רק את הגבול העליון שלה (maxCost). למדרגה האחרונה אין גבול (null).

// המדרגות נשמרות רק במסד. ערכי ברירת המחדל לכל לקוח נמצאים ב־
// supabase/migrations/20261126000000_seed_default_profit_tiers.sql

// ממיין לפי הגבול, ומוודא שלמדרגה האחרונה אין גבול עליון
function normalizeTiers(tiers) {
    const sorted = [...tiers].sort((a, b) => {
        if (a.maxCost === null) return 1
        if (b.maxCost === null) return -1
        return a.maxCost - b.maxCost
    })

    return sorted.map((tier, index) => ({
        maxCost: index === sorted.length - 1 ? null : Number(tier.maxCost),
        factor: Number(tier.factor),
    }))
}

// המדרגות של סוג רכב, כפי שנשמרו במסד. רשימה ריקה אם לא נשמרו
export function getProfitTiersForType(savedTiers, vehicleType) {
    const saved = (savedTiers || []).filter(
        (tier) => tier.vehicleType === vehicleType
    )

    return normalizeTiers(saved)
}

/**
 * מוצא את המדרגה של העלות.
 * floorPrice – המחיר בסוף המדרגות הקודמות. המחיר לא יורד ממנו,
 * כדי שעלות גבוהה יותר לא תקבל מחיר נמוך יותר במעבר בין מדרגות.
 */
export function findProfitTier(tiers, cost) {
    let floorPrice = 0
    let minCost = 0

    for (let index = 0; index < tiers.length; index += 1) {
        const tier = tiers[index]

        if (tier.maxCost === null || cost <= tier.maxCost) {
            return {
                number: index + 1,
                factor: tier.factor,
                minCost,
                maxCost: tier.maxCost,
                floorPrice,
            }
        }

        floorPrice = Math.max(floorPrice, tier.maxCost * tier.factor)
        minCost = tier.maxCost
    }

    return null
}

// בודק מדרגות שהוזנו בעמוד ההגדרות. מחזיר הודעת שגיאה, או מחרוזת ריקה אם הכול תקין
export function validateProfitTiers(tiers) {
    if (tiers.length === 0) {
        return 'צריך לפחות מדרגה אחת'
    }

    let previousMax = 0

    for (let index = 0; index < tiers.length; index += 1) {
        const tier = tiers[index]
        const isLast = index === tiers.length - 1
        const factor = Number(tier.factor)

        if (tier.factor === '' || !Number.isFinite(factor) || factor < 1) {
            return `המקדם במדרגה ${index + 1} חייב להיות 1 או יותר`
        }

        if (isLast) continue

        const maxCost = Number(tier.maxCost)

        if (tier.maxCost === '' || !Number.isFinite(maxCost) || maxCost <= 0) {
            return `חסר גבול עלות תקין במדרגה ${index + 1}`
        }

        if (maxCost <= previousMax) {
            return `הגבול במדרגה ${index + 1} חייב להיות גבוה מהגבול במדרגה הקודמת`
        }

        previousMax = maxCost
    }

    return ''
}
