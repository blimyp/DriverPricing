import {
    Octagon,
    Calculator,
    CarFront,
} from 'lucide-react'

import './traffic_lights.css'

const steps = [
    {
        id: 1,
        className: 'red',
        title: 'עצור',
        subtitle: 'עוצרים לרגע לפני שממשיכים',
        Icon: Octagon,
    },
    {
        id: 2,
        className: 'orange',
        title: 'חשב מחיר',
        subtitle: 'מזינים נתונים ומקבלים תמחור',
        Icon: Calculator,
    },
    {
        id: 3,
        className: 'green',
        title: 'צא לדרך',
        subtitle: 'התמחור מוכן ואפשר להתקדם',
        Icon: CarFront,
    },
]

function SmartSteps() {
    return (
        <section className="smart-steps" dir="rtl">
            <div className="smart-steps-heading">
                <span>תהליך פשוט וחכם</span>

                <h2>
                    שלושה שלבים
                    <strong> לתמחור נכון</strong>
                </h2>

                <p>
                    המערכת מובילה אותך בצורה ברורה מהשלב הראשון
                    ועד לקבלת התוצאה.
                </p>
            </div>

            <div className="smart-steps-track">
                <svg
                    className="smart-wave"
                    viewBox="0 0 1000 180"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient
                            id="waveGradient"
                            x1="0"
                            x2="1"
                            y1="0"
                            y2="0"
                        >
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>

                        <filter id="waveGlow">
                            <feGaussianBlur
                                stdDeviation="7"
                                result="blur"
                            />

                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <path
                        className="smart-wave-base"
                        d="M40 92 C190 10 315 170 500 92 C680 15 805 170 960 92"
                    />

                    <path
                        className="smart-wave-active"
                        d="M40 92 C190 10 315 170 500 92 C680 15 805 170 960 92"
                    />
                </svg>

                <div className="smart-steps-grid">
                    {steps.map(({ id, className, title, subtitle, Icon }) => (
                        <article
                            key={id}
                            className={`smart-step smart-step-${className}`}
                        >
                            <div className="smart-step-orbit">
                                <span className="orbit-ring orbit-ring-one" />
                                <span className="orbit-ring orbit-ring-two" />

                                <div className="smart-step-circle">
                                    <Icon
                                        className="smart-step-icon"
                                        strokeWidth={1.9}
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>

                            <div className="smart-step-card">
                                <span className="smart-step-number">
                                    {String(id).padStart(2, '0')}
                                </span>

                                <h3>{title}</h3>
                                <p>{subtitle}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SmartSteps