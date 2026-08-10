import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentSession } from '../services/authService'
import { saveUserProfile } from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        async function loadSession() {
            try {
                const currentSession = await getCurrentSession()
                setSession(currentSession)
            } catch (error) {
                console.error(error)
                setErrorMessage(error.message)
            } finally {
                setLoading(false)
            }
        }

        loadSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession)
                setLoading(false)

                if (
                    event === 'SIGNED_IN' &&
                    newSession?.user
                ) {
                    try {
                        await saveUserProfile(newSession.user)
                    } catch (error) {
                        console.error(error)
                        setErrorMessage(error.message)
                    }
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        session,
        user: session?.user ?? null,
        loading,
        errorMessage,
        setErrorMessage,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}