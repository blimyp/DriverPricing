import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Images } from '../../constants/images'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'
import UserMenu from '../user_menu/user_menu'
import './navbar.css'

function Navbar() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = async () => {
        await signOut()
        setIsMenuOpen(false)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const navigationLinks = [
        { to: '/home', label: 'דף הבית' },
        { to: '/pricing', label: 'תמחור נסיעה' },
        { to: '/trips', label: 'הנסיעות שלי' },
        { to: '/account', label: 'הארנק שלי' },
        { to: '/about', label: 'אודות' },
    ]

    return (
        <>
            <header className="navbar">

                <div className="navbar-container">

                    {/* Mobile hamburger */}
                    <button
                        className="mobile-menu-button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="פתיחת תפריט"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    {/* Desktop logo */}
                    <NavLink to="/" className="navbar-logo">
                        <img
                            src="/logo.png"
                            alt="לוגו"
                            className="navbar-logo-image"
                        />

                        <div className="logo_texts">
                            <h3>Travel Price</h3>
                            <p>ממשק תמחור נסיעה</p>
                        </div>
                    </NavLink>

                    {/* Mobile title */}
                    <div className="mobile-navbar-title">
                        Travel Client
                    </div>

                    {/* Desktop links */}
                    <nav className="navbar-links">
                        {navigationLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'navbar-link active'
                                        : 'navbar-link'
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Desktop login/logout */}
                    {user ? (
                        <UserMenu />
                    ) : (
                        <button
                            className="navbar_button desktop-auth-button"
                            onClick={() => navigate('/login')}
                        >
                            התחברות
                        </button>
                    )}

                </div>
                <img src={Images.background} className="navbar-image" />

            </header>

            {/* Mobile backdrop */}
            <div
                className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''
                    }`}
                onClick={closeMenu}
            />

            {/* Mobile side menu */}
            <aside
                className={`mobile-side-menu ${isMenuOpen ? 'open' : ''
                    }`}
            >
                <div className="mobile-menu-header">
                    <button
                        className="mobile-menu-close"
                        onClick={closeMenu}
                        aria-label="סגירת תפריט"
                    >
                        ×
                    </button>

                    <div className="mobile-user">
                        <div className="mobile-user-avatar">
                            {user
                                ? (
                                    user.displayName ||
                                    user.email ||
                                    'U'
                                )
                                    .charAt(0)
                                    .toUpperCase()
                                : '?'}
                        </div>

                        <div className="mobile-user-info">
                            <strong>
                                {user
                                    ? user.displayName || 'משתמש מחובר'
                                    : 'אורח'}
                            </strong>

                            {user?.email && (
                                <span>{user.email}</span>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="mobile-navigation">
                    {navigationLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                isActive
                                    ? 'mobile-nav-link active'
                                    : 'mobile-nav-link'
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mobile-menu-footer">
                    {user ? (
                        <button
                            className="mobile-auth-button"
                            onClick={handleLogout}
                        >
                            התנתקות
                        </button>
                    ) : (
                        <button
                            className="mobile-auth-button"
                            onClick={() => {
                                navigate('/login')
                                closeMenu()
                            }}
                        >
                            התחברות
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}

export default Navbar