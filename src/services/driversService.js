import { supabase } from '../lib/supabaseClient'

const DRIVER_COLUMNS =
    'id, email, full_name, avatar_url, role, created_at, starting_balance, driver_percentage, deleted_at'

function mapInviteToDriver(invite) {
    return {
        id: `invite-${invite.email}`,
        email: invite.email,
        full_name: '',
        avatar_url: null,
        role: 'driver',
        created_at: invite.created_at,
        starting_balance: Number(invite.starting_balance) || 0,
        pending: true,
    }
}

export async function getAllDrivers() {
    const { data, error } = await supabase
        .from('profiles')
        .select(DRIVER_COLUMNS)
        .eq('role', 'driver')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    const { data: invites, error: invitesError } = await supabase
        .from('driver_invites')
        .select('email, created_at, starting_balance')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (invitesError) {
        throw invitesError
    }

    const pendingDrivers = (invites || []).map(mapInviteToDriver)

    return [...pendingDrivers, ...data]
}

export async function addDriverByEmail(email, startingBalance = 0) {
    const cleanEmail = (email || '').trim().toLowerCase()

    if (!cleanEmail) {
        throw new Error('יש להזין כתובת מייל')
    }

    const cleanStartingBalance = Number(startingBalance) || 0

    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select(DRIVER_COLUMNS)
        .ilike('email', cleanEmail)
        .maybeSingle()

    if (fetchError) {
        throw fetchError
    }

    if (!profile) {
        const { data: invite, error: inviteError } = await supabase
            .from('driver_invites')
            .upsert(
                {
                    email: cleanEmail,
                    starting_balance: cleanStartingBalance,
                    deleted_at: null,
                },
                { onConflict: 'email' }
            )
            .select()
            .single()

        if (inviteError) {
            throw inviteError
        }

        return mapInviteToDriver(invite)
    }

    if (profile.role === 'driver' && !profile.deleted_at) {
        throw new Error('המשתמש כבר מוגדר כנהג')
    }

    // A deleted driver can be added again. The old trips and payments
    // stay marked as deleted.
    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            role: 'driver',
            starting_balance: cleanStartingBalance,
            deleted_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select(DRIVER_COLUMNS)
        .single()

    if (updateError) {
        throw updateError
    }

    return updatedProfile
}

export async function updateDriverStartingBalance(driver, startingBalance) {
    const cleanStartingBalance = Number(startingBalance) || 0

    if (driver.pending) {
        const { data: invite, error } = await supabase
            .from('driver_invites')
            .update({ starting_balance: cleanStartingBalance })
            .eq('email', driver.email)
            .select()
            .single()

        if (error) {
            throw error
        }

        return mapInviteToDriver(invite)
    }

    const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
            starting_balance: cleanStartingBalance,
            updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id)
        .select(DRIVER_COLUMNS)
        .single()

    if (error) {
        throw error
    }

    return updatedProfile
}

// The driver, and all of the driver's trips and payments, are only
// marked as deleted, so they can be restored if needed.
export async function removeDriver(driver) {
    const deletedAt = new Date().toISOString()

    if (driver.pending) {
        const { data, error } = await supabase
            .from('driver_invites')
            .update({ deleted_at: deletedAt })
            .eq('email', driver.email)
            .select('email')
            .maybeSingle()

        if (error) {
            throw error
        }

        if (!data) {
            throw new Error('אין הרשאה למחוק את הנהג או שהוא לא נמצא')
        }

        return
    }

    const { error: tripsError } = await supabase
        .from('trips')
        .update({ deleted_at: deletedAt })
        .eq('user_id', driver.id)
        .is('deleted_at', null)

    if (tripsError) {
        throw tripsError
    }

    const { error: paymentsError } = await supabase
        .from('driver_payments')
        .update({ deleted_at: deletedAt })
        .eq('driver_id', driver.id)
        .is('deleted_at', null)

    if (paymentsError) {
        throw paymentsError
    }

    // The driver is marked last, so if something fails on the way the
    // driver stays in the list and the delete can simply be tried again
    const { data, error } = await supabase
        .from('profiles')
        .update({
            deleted_at: deletedAt,
            updated_at: deletedAt,
        })
        .eq('id', driver.id)
        .select('id')
        .maybeSingle()

    if (error) {
        throw error
    }

    if (!data) {
        throw new Error('אין הרשאה למחוק את הנהג או שהוא לא נמצא')
    }
}
