import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'
import {
    getUserProfile,
    saveUserProfile,
} from '../services/profileService'
import { getCurrentSession } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const loadUserProfile = async (userId) => {
        const profile = await getUserProfile(userId)
        setUser(profile)

        return profile
    }

    useEffect(() => {
        let isMounted = true

        const initializeAuth = async () => {
            try {
                setLoading(true)
                setErrorMessage('')

                const session = await getCurrentSession()

                if (!isMounted) return

                if (!session?.user) {
                    setUser(null)
                    return
                }

                await saveUserProfile(session.user)

                if (!isMounted) return

                await loadUserProfile(session.user.id)
            } catch (error) {
                console.error('Failed to initialize auth:', error)

                if (isMounted) {
                    setUser(null)
                    setErrorMessage(
                        error.message || 'שגיאה בטעינת המשתמש'
                    )
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initializeAuth()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return

                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setLoading(false)
                    return
                }

                if (
                    event === 'SIGNED_IN' &&
                    session?.user
                ) {
                    setLoading(true)

                    setTimeout(async () => {
                        try {
                            await saveUserProfile(session.user)

                            if (!isMounted) return

                            await loadUserProfile(session.user.id)
                        } catch (error) {
                            console.error(
                                'Failed to load profile after sign in:',
                                error
                            )

                            if (isMounted) {
                                setUser(null)
                                setErrorMessage(
                                    error.message ||
                                    'שגיאה בטעינת פרטי המשתמש'
                                )
                            }
                        } finally {
                            if (isMounted) {
                                setLoading(false)
                            }
                        }
                    }, 0)
                }
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    const refreshUser = async () => {
        try {
            setErrorMessage('')
            return await loadUserProfile()
        } catch (error) {
            setErrorMessage(
                error.message || 'שגיאה ברענון המשתמש'
            )

            return null
        }
    }

    const value = {
        user,
        loading,
        errorMessage,
        setErrorMessage,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
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
        throw new Error(
            'useAuth must be used inside AuthProvider'
        )
    }

    return context
}