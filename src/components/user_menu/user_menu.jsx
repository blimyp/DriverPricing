import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'
import './user_menu.css'

function UserMenu() {
    const { user, isAdmin } = useAuth()
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [])

    const handleLogout = async () => {
        try {
            await signOut()
            setIsOpen(false)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleCustomerRequests = () => {
        setIsOpen(false)
        navigate('/inbox')
    }

    const handleSettings = () => {
        setIsOpen(false)
        navigate('/prices')
    }

    const handleDrivers = () => {
        setIsOpen(false)
        navigate('/drivers')
    }

    if (!user) {
        return null
    }

    const userName =
        user.full_name ||
        user.email ||
        'משתמש'

    return (
        <div
            className="user-menu"
            ref={menuRef}
        >
            <button
                type="button"
                className="user-menu-trigger"
                onClick={() =>
                    setIsOpen((current) => !current)
                }
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="user-menu-avatar">
                    {userName.charAt(0).toUpperCase()}
                </span>

                <span className="user-menu-name">
                    {userName}
                </span>

                <ChevronDown
                    className={`user-menu-arrow ${isOpen ? 'open' : ''
                        }`}
                    strokeWidth={2.5}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    className="user-menu-dropdown"
                    role="menu"
                >
                    <button
                        type="button"
                        className="user-menu-item"
                        onClick={handleSettings}
                    >
                        הגדרות
                    </button>

                    <button
                        type="button"
                        className="user-menu-item"
                        onClick={handleCustomerRequests}
                    >
                        פניות למנהל המערכת
                    </button>

                    {isAdmin && (
                        <button
                            type="button"
                            className="user-menu-item"
                            onClick={handleDrivers}
                        >
                            ניהול נהגים
                        </button>
                    )}

                    <div className="user-menu-divider" />

                    <button
                        type="button"
                        className="user-menu-item user-menu-logout"
                        onClick={handleLogout}
                    >
                        התנתקות
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserMenu