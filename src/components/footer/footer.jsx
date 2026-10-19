import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './footer.css'

function Footer() {
    const { user } = useAuth()

    // נהגים ואורחים לא יכולים להגיע לעמודים האלה, לכן מציגים להם רק את הצהרת הנגישות
    const isClient = user && user.role !== 'driver'

    // בלי אנימציית הופעה: בתחתית העמוד היא לא תמיד מופעלת, והקישורים נשארים מוסתרים
    return (
        <footer className="site-footer">
            <Link to="/" className="footer-logo">
                <img src="/logo.png" alt="" />
                <span>Travel Price</span>
            </Link>

            <p>מערכת תמחור נסיעות — סדר, יעילות ושליטה.</p>

            <nav className="footer-links" aria-label="קישורים בתחתית העמוד">
                {isClient && (
                    <>
                        <Link to="/home">דף הבית</Link>
                        <Link to="/pricing">תמחור נסיעה</Link>
                    </>
                )}
                <Link to="/accessibility">הצהרת נגישות</Link>
            </nav>
        </footer>
    )
}

export default Footer
