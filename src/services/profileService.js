import { supabase } from '../lib/supabaseClient'

export async function saveUserProfile(user) {
    if (!user) return

    // בדיקה האם המשתמש כבר קיים
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

    if (fetchError) {
        throw fetchError
    }

    const isNewUser = !existingProfile

    const cleanEmail = (user.email || '').trim().toLowerCase()

    let invite = null

    if (isNewUser && cleanEmail) {
        const { data: inviteData, error: inviteFetchError } = await supabase
            .from('driver_invites')
            .select('email, starting_balance')
            .eq('email', cleanEmail)
            .is('deleted_at', null)
            .maybeSingle()

        if (inviteFetchError) {
            console.error('Error checking driver invite:', inviteFetchError)
        } else {
            invite = inviteData
        }
    }

    // שמירת / עדכון הפרופיל
    const { error } = await supabase
        .from('profiles')
        .upsert(
            {
                id: user.id,
                email: user.email,
                full_name:
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    '',
                avatar_url:
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ||
                    null,
                ...(invite
                    ? {
                        role: 'driver',
                        starting_balance:
                            Number(invite.starting_balance) || 0,
                    }
                    : {}),
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'id',
            }
        )

    if (error) {
        throw error
    }

    if (invite) {
        const { error: inviteDeleteError } = await supabase
            .from('driver_invites')
            .delete()
            .eq('email', invite.email)

        if (inviteDeleteError) {
            console.error('Error clearing driver invite:', inviteDeleteError)
        }
    }

    // אם זה משתמש חדש - שליחת מייל ברוכים הבאים
    if (isNewUser) {
        const { error: emailError } = await supabase.functions.invoke(
            'welcome-email',
            {
                body: {
                    email: user.email,
                    name:
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        '',
                },
            }
        )

        if (emailError) {
            console.error('Welcome email error:', emailError)
        }
    }
}

export async function getUserProfile(userId) {
    if (!userId) return null

    const { data, error } = await supabase
        .from('profiles')
        // כל השדות, כדי ששדה הגדרה חסר במסד לא יפיל את ההתחברות
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        throw error
    }

    return data
}

export const updateProfileSetting = async (
    userId,
    fieldName,
    value
) => {
    if (!userId) {
        throw new Error('חסר מזהה משתמש')
    }

    if (!fieldName) {
        throw new Error('חסר שדה לעדכון')
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({
            [fieldName]: value,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}