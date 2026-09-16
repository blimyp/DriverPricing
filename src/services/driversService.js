import { supabase } from '../lib/supabaseClient'

const DRIVER_COLUMNS = 'id, email, full_name, avatar_url, role, created_at'

export async function getAllDrivers() {
    const { data, error } = await supabase
        .from('profiles')
        .select(DRIVER_COLUMNS)
        .eq('role', 'driver')
        .order('created_at', { ascending: false })

    console.log('[DEBUG getAllDrivers] data:', data, 'error:', error)

    if (error) {
        throw error
    }

    const { data: allVisibleProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, email, role')

    console.log(
        '[DEBUG all profiles visible to current user]',
        allVisibleProfiles,
        'error:',
        allError
    )

    return data
}

export async function addDriverByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase()

    if (!cleanEmail) {
        throw new Error('יש להזין כתובת מייל')
    }

    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select(DRIVER_COLUMNS)
        .ilike('email', cleanEmail)
        .maybeSingle()

    if (fetchError) {
        throw fetchError
    }

    if (!profile) {
        throw new Error(
            'לא נמצא משתמש עם כתובת המייל הזו. על המשתמש להתחבר למערכת לפחות פעם אחת לפני שניתן להגדיר אותו כנהג'
        )
    }

    if (profile.role === 'driver') {
        throw new Error('המשתמש כבר מוגדר כנהג')
    }

    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            role: 'driver',
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
