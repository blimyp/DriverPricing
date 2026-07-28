import { supabase } from '../lib/supabaseClient'

export async function saveUserProfile(user) {
    if (!user) return

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
}