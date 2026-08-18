import { supabase } from "../lib/supabaseClient"

export async function getVehiclePrices() {
    const { data, error } = await supabase
        .from('vehicle_prices')
        .select('*')

    if (error) {
        throw error
    }

    return data
}

export async function updateVehiclePrice(vehicleType, kmCntInLiter) {
    console.log('UPDATE:', {
        vehicleType,
        kmCntInLiter,
    })

    const { data, error } = await supabase
        .from('vehicle_prices')
        .update({
            km_cnt_in_liter: kmCntInLiter,
        })
        .eq('vehicle_type', vehicleType)
        .select()

    console.log('UPDATE DATA:', data)
    console.log('UPDATE ERROR:', error)

    if (error) {
        throw error
    }

    return data?.[0] ?? null
}