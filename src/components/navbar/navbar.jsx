import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'
import './navbar.css'

function Navbar() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut();
    }

    return (
        <header className="navbar">
            <div className="navbar-container">
                <NavLink to="/" className="navbar-logo">
                    <img
                        src="/logo.png"
                        alt="לוגו"
                        className="navbar-logo-image"
                    />
                    <div className='logo_texts'>
                        <h3>Travel Price</h3>
                        <p>ממשק תמחור נסיעה</p>
                    </div>
                </NavLink>

                <nav className="navbar-links">
                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            isActive ? 'navbar-link active' : 'navbar-link'
                        }
                    >
                        דף הבית
                    </NavLink>

                    <NavLink
                        to="/pricing"
                        className={({ isActive }) =>
                            isActive ? 'navbar-link active' : 'navbar-link'
                        }
                    >
                        תמחור נסיעה
                    </NavLink>

                    <NavLink
                        to="/trips"
                        className={({ isActive }) =>
                            isActive ? 'navbar-link active' : 'navbar-link'
                        }
                    >
                        הנסיעות שלי
                    </NavLink>

                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            isActive ? 'navbar-link active' : 'navbar-link'
                        }
                    >
                        אודות
                    </NavLink>
                </nav>

                {user
                    ? <button onClick={handleLogout}>התנתקות</button>
                    : <button onClick={() => navigate('/login')}>
                        התחברות
                    </button>}
            </div>
        </header>
    )
}

export default Navbar