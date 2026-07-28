import { Link } from 'react-router-dom'
import BackgroundSection from '../../../../components/background_section/background_section'
import Reveal from '../../../../components/reveal/reveal'
import './product_preview.css'

function ProductPreview() {
    return (
        <BackgroundSection className='home-hero'>
            <div className="hero-content">
                <Reveal direction="right" delay={100}>
                    <span className="hero-badge">
                        הדרך החכמה לתמחור נסיעות
                    </span>
                </Reveal>

                <Reveal direction="right" delay={220}>
                    <h1>
                        פחות זמן על חישובים.
                        <span> יותר זמן לניהול נכון.</span>
                    </h1>
                </Reveal>

                <Reveal direction="right" delay={340}>
                    <p className="hero-description">
                        ממשק תמחור הנסיעות מרכז עבורך את כל המידע הדרוש,
                        מפשט את תהליך העבודה ועוזר להגיע לתוצאה ברורה,
                        מסודרת ומהירה.
                    </p>
                </Reveal>

                <Reveal direction="right" delay={460}>
                    <div className="hero-actions">
                        <Link
                            to="/pricing"
                            className="primary-home-button"
                        >
                            התחלת תמחור
                            <span aria-hidden="true">←</span>
                        </Link>

                        <a
                            href="#benefits"
                            className="secondary-home-button"
                        >
                            צפייה ביתרונות
                        </a>
                    </div>
                </Reveal>

                <Reveal direction="right" delay={580}>
                    <div className="hero-points">
                        <span>
                            <i aria-hidden="true">✓</i>
                            תהליך קצר וברור
                        </span>

                        <span>
                            <i aria-hidden="true">✓</i>
                            אזור אישי
                        </span>

                        <span>
                            <i aria-hidden="true">✓</i>
                            נתונים במקום אחד
                        </span>
                    </div>
                </Reveal>
            </div>

            <Reveal
                className="hero-preview-reveal"
                direction="left"
                delay={280}
                threshold={0.08}
            >
                <div className="hero-preview">
                    <div className="preview-top">
                        <div>
                            <span className="preview-small-title">
                                תמחור חדש
                            </span>

                            <h2>פרטי הנסיעה</h2>
                        </div>

                        <span className="preview-status">פעיל</span>
                    </div>

                    <div className="preview-route">
                        <div className="route-item">
                            <span className="route-dot start-dot" />

                            <div>
                                <small>נקודת מוצא</small>
                                <strong>הזנת כתובת מוצא</strong>
                            </div>
                        </div>

                        <div className="route-line" />

                        <div className="route-item">
                            <span className="route-dot end-dot" />

                            <div>
                                <small>נקודת יעד</small>
                                <strong>הזנת כתובת יעד</strong>
                            </div>
                        </div>
                    </div>

                    <div className="preview-information">
                        <div>
                            <small>מרחק</small>
                            <strong>מתעדכן בחישוב</strong>
                        </div>

                        <div>
                            <small>סוג נסיעה</small>
                            <strong>לפי הבחירה שלך</strong>
                        </div>
                    </div>

                    <div className="preview-result">
                        <div>
                            <small>תוצאה משוערת</small>
                            <strong>מחיר ברור ומסודר</strong>
                        </div>

                        <span>₪</span>
                    </div>
                </div>
            </Reveal>
        </BackgroundSection>
    )
}

export default ProductPreview