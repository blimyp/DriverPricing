import { supabase } from '../lib/supabaseClient'

export async function saveTrip({
    userId,
    origin,
    destination,
    stops,
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
            stops: Array.isArray(stops) ? stops : [],
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

export async function saveDriverTrip({
    driverId,
    tripDate,
    price,
    description,
}) {
    if (!driverId) {
        throw new Error('יש לבחור נהג')
    }

    if (!tripDate) {
        throw new Error('יש לבחור תאריך לנסיעה')
    }

    if (
        price === null ||
        price === undefined ||
        !Number.isFinite(Number(price))
    ) {
        throw new Error('יש להזין מחיר תקין לנסיעה')
    }

    const { data, error } = await supabase
        .from('trips')
        .insert({
            user_id: driverId,
            description: description || null,
            calculated_price: Number(price),
            created_at: new Date(tripDate).toISOString(),
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function getDriverTrips(driverIds) {
    if (!driverIds || driverIds.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from('trips')
        .select(
            'id, user_id, origin, destination, description, calculated_price, created_at'
        )
        .in('user_id', driverIds)
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}
export async function updateDriverTrip(tripId, {
    tripDate,
    price,
    description,
}) {
    if (!tripId) {
        throw new Error('לא נמצאה הנסיעה לעדכון')
    }

    if (
        price === null ||
        price === undefined ||
        !Number.isFinite(Number(price))
    ) {
        throw new Error('יש להזין מחיר תקין לנסיעה')
    }

    const changes = {
        description: description || null,
        calculated_price: Number(price),
    }

    if (tripDate) {
        changes.created_at = new Date(tripDate).toISOString()
    }

    const { data, error } = await supabase
        .from('trips')
        .update(changes)
        .eq('id', tripId)
        .select(
            'id, user_id, origin, destination, description, calculated_price, created_at'
        )
        .maybeSingle()

    if (error) {
        throw error
    }

    if (!data) {
        throw new Error('אין הרשאה לעדכן את הנסיעה או שהיא לא נמצאה')
    }

    return data
}
