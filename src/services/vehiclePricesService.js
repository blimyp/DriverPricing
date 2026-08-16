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