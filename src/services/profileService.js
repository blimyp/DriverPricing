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
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'id',
            }
        )

    if (error) {
        throw error
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
        .select(`
            id,
            email,
            full_name,
            role,
            avatar_url,
            created_at,
            updated_at
        `)
        .eq('id', userId)
        .single()

    if (error) {
        throw error
    }

    return data
}