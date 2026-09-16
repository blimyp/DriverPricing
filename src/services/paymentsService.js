import { supabase } from '../lib/supabaseClient'

export async function savePayment({
    driverId,
    paymentDate,
    amount,
    description,
}) {
    if (!driverId) {
        throw new Error('יש לבחור נהג')
    }

    if (!paymentDate) {
        throw new Error('יש לבחור תאריך לתשלום')
    }

    if (
        amount === null ||
        amount === undefined ||
        !Number.isFinite(Number(amount))
    ) {
        throw new Error('יש להזין סכום תקין לתשלום')
    }

    const { data, error } = await supabase
        .from('driver_payments')
        .insert({
            driver_id: driverId,
            description: description || null,
            amount: Number(amount),
            created_at: new Date(paymentDate).toISOString(),
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function getDriverPayments(driverIds) {
    if (!driverIds || driverIds.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from('driver_payments')
        .select('id, driver_id, description, amount, created_at')
        .in('driver_id', driverIds)
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}
