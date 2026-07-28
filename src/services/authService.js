import { supabase } from '../lib/supabaseClient'

export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    })

    if (error) {
        throw error
    }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw error
    }
}

export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
        throw error
    }

    return data.session
}