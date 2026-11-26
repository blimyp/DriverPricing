import { supabase } from '../lib/supabaseClient'

const toTier = (row) => ({
    vehicleType: row.vehicle_type,
    maxCost: row.max_cost === null ? null : Number(row.max_cost),
    factor: Number(row.factor),
})

export async function getProfitTiers(ownerId) {
    if (!ownerId) return []

    const { data, error } = await supabase
        .from('profit_tiers')
        .select('vehicle_type, max_cost, factor')
        .eq('owner_id', ownerId)

    if (error) {
        throw error
    }

    return data.map(toTier)
}

// מחליף את כל המדרגות של סוג רכב אחד בפעולה אחת במסד
export async function saveProfitTiers(vehicleType, tiers) {
    const { data, error } = await supabase.rpc('replace_profit_tiers', {
        p_vehicle_type: vehicleType,
        p_tiers: tiers.map((tier, index) => ({
            max_cost: index === tiers.length - 1 ? null : Number(tier.maxCost),
            factor: Number(tier.factor),
        })),
    })

    if (error) {
        throw error
    }

    return data.map(toTier)
}
