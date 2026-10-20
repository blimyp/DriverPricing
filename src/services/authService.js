import { supabase } from '../lib/supabaseClient'

// שגיאה שחזרה מההתחברות בכתובת הדף (למשל משתמש שאינו רשום).
// נקראת מיד בטעינה, לפני שהספרייה של סופאבייס מנקה את הכתובת.
let redirectErrorMessage = readRedirectError()

function readRedirectError() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const queryParams = new URLSearchParams(window.location.search)

    const error =
        hashParams.get('error') || queryParams.get('error')

    if (!error) return ''

    const description =
        hashParams.get('error_description') ||
        queryParams.get('error_description') ||
        ''

    // הודעה בעברית מגיעה מחסימת ההרשמה של משתמש שלא הוזמן
    if (/[֐-׿]/.test(description)) {
        return 'מייל זה אינו רשום במערכת'
    }

    return 'ההתחברות נכשלה, נסה שוב.'
}

export function getRedirectErrorMessage() {
    if (redirectErrorMessage) {
        // ניקוי הכתובת, כדי שרענון הדף לא יציג את השגיאה שוב
        window.history.replaceState(
            window.history.state,
            '',
            window.location.pathname
        )
    }

    return redirectErrorMessage
}

export async function signInWithGoogle(redirectPath = '/') {
    redirectErrorMessage = ''

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + redirectPath,
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