import { supabase } from '../lib/supabaseClient'

const VEHICLE_COLUMNS =
    'id, owner_id, name, vehicle_type, manufacture_year, purchase_price, financing_monthly_interest, insurance_yearly, other_fixed_yearly, annual_km_estimate, created_at'

export async function getVehicles(ownerId) {
    if (!ownerId) return []

    const { data, error } = await supabase
        .from('vehicles')
        .select(VEHICLE_COLUMNS)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true })

    if (error) {
        throw error
    }

    return data
}

export async function addVehicle(ownerId, vehicle) {
    if (!ownerId) {
        throw new Error('חסר מזהה משתמש')
    }

    const { data, error } = await supabase
        .from('vehicles')
        .insert({
            ...vehicle,
            owner_id: ownerId,
        })
        .select(VEHICLE_COLUMNS)
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function updateVehicle(vehicleId, vehicle) {
    if (!vehicleId) {
        throw new Error('לא נמצא הרכב לעדכון')
    }

    const { data, error } = await supabase
        .from('vehicles')
        .update({
            ...vehicle,
            updated_at: new Date().toISOString(),
        })
        .eq('id', vehicleId)
        .select(VEHICLE_COLUMNS)
        .maybeSingle()

    if (error) {
        throw error
    }

    if (!data) {
        throw new Error('אין הרשאה לעדכן את הרכב או שהוא לא נמצא')
    }

    return data
}

export async function deleteVehicle(vehicleId) {
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

    if (error) {
        throw error
    }
}
