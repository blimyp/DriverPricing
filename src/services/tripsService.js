import { supabase } from '../lib/supabaseClient'

export async function saveTrip({
    userId,
    origin,
    destination,
    distance,
    duration,
    calculatedPrice,
    tripType,
}) {
    if (!userId) {
        throw new Error('יש להתחבר כדי לשמור נסיעה')
    }

    if (!origin || !destination) {
        throw new Error('יש להזין נקודת מוצא ונקודת יעד')
    }

    if (calculatedPrice === null || calculatedPrice === undefined) {
        throw new Error('לא התקבל מחיר לשמירה')
    }

    const { data, error } = await supabase
        .from('trips')
        .insert({
            user_id: userId,
            origin,
            destination,
            distance: distance ?? null,
            duration: duration ?? null,
            calculated_price: calculatedPrice,
            trip_type: tripType || null,
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}