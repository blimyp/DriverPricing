import { supabase } from '../lib/supabaseClient'

const DRIVER_COLUMNS =
    'id, email, full_name, avatar_url, role, created_at, starting_balance'

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
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    const { data: invites, error: invitesError } = await supabase
        .from('driver_invites')
        .select('email, created_at, starting_balance')
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

    if (profile.role === 'driver') {
        throw new Error('המשתמש כבר מוגדר כנהג')
    }

    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            role: 'driver',
            starting_balance: cleanStartingBalance,
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
