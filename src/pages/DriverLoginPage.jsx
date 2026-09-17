import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/authService'
import LoginPage from './LoginPage'

const ACCESS_DENIED_MESSAGE =
    'החשבון הזה אינו מוגדר כנהג במערכת. יש להתחבר עם חשבון שהוגדר כנהג, או לפנות למנהל המערכת.'

const STORAGE_KEY = 'driverLoginAccessDenied'

function readAccessDeniedFlag() {
    try {
        return sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch {
        return false
    }
}

function DriverLoginPage() {
    const { user, loading } = useAuth()

    useEffect(() => {
        if (loading || !user) {
            return
        }

        try {
            if (user.role === 'driver') {
                sessionStorage.removeItem(STORAGE_KEY)
            } else {
                sessionStorage.setItem(STORAGE_KEY, '1')
            }
        } catch {
            // אחסון לא זמין (למשל דפדפן פרטי) - לא קריטי
        }

        if (user.role !== 'driver') {
            signOut().catch((error) => {
                console.error(
                    'Error signing out non-driver user:',
                    error
                )
            })
        }
    }, [user, loading])

    if (loading) {
        return null
    }

    if (user?.role === 'driver') {
        return <Navigate to="/driver" replace />
    }

    return (
        <LoginPage
            errorMessage={
                readAccessDeniedFlag() ? ACCESS_DENIED_MESSAGE : ''
            }
        />
    )
}

export default DriverLoginPage
