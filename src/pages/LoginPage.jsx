import { useState } from 'react'
import { signInWithGoogle } from '../services/authService'
import './LoginPage.css'

function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function handleGoogleLogin() {
        try {
            setLoading(true)
            setErrorMessage('')
            await signInWithGoogle()
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message || 'ההתחברות נכשלה, נסי שוב.')
            setLoading(false)
        }
    }

    return (
        <main dir="rtl" className="login-page">
            <section className="login-card">
                <div className="login-card-decoration">
                    <span className="login-decoration-circle login-decoration-circle-one" />
                    <span className="login-decoration-circle login-decoration-circle-two" />

                    <div className="login-decoration-content">
                        <span className="login-small-label">
                            מערכת חכמה לניהול נסיעות
                        </span>

                        <h2>
                            כל הנתונים שלך
                            <br />
                            במקום אחד
                        </h2>

                        <p>
                            התחבר לחשבון שלך כדי לחשב נסיעות,
                            לשמור נתונים ולצפות בהיסטוריה שלך.
                        </p>

                        <div className="login-benefits">
                            <div className="login-benefit">
                                <span>✓</span>
                                <p>התחברות מהירה ופשוטה</p>
                            </div>

                            <div className="login-benefit">
                                <span>✓</span>
                                <p>שמירה מאובטחת של הנתונים</p>
                            </div>

                            <div className="login-benefit">
                                <span>✓</span>
                                <p>גישה מכל מכשיר</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-form-header">
                        <h1 className="login-title">
                            ברוכים הבאים
                        </h1>

                        <p className="login-description">
                            כדי להמשיך למערכת, יש להתחבר באמצעות חשבון גוגל.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="login-error" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="button"
                        className="google-login-button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner" />
                                <span>מתחבר...</span>
                            </>
                        ) : (
                            <>
                                <img
                                    src="/google.png"
                                    alt=""
                                />

                                <span>כניסה עם Google</span>

                                <span className="google-button-arrow">
                                    ←
                                </span>
                            </>
                        )}
                    </button>

                    <div className="login-divider">
                        <span />
                        <p>כניסה מאובטחת</p>
                        <span />
                    </div>

                    <p className="login-footer-text">
                        בלחיצה על כפתור הכניסה תועברי לחשבון גוגל לצורך אימות.
                    </p>
                </div>
            </section>
        </main>
    )
}

export default LoginPage