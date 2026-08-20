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
                <span className="smart-eyebrow">תהליך פשוט וחכם</span>

                <h2 className="smart-title">
                    <span className="smart-title-word smart-title-word-1">
                        שלושה
                    </span>

                    <span className="smart-title-word smart-title-word-2">
                        שלבים
                    </span>

                    <strong className="smart-title-word smart-title-word-3">
                        לתמחור
                    </strong>

                    <strong className="smart-title-word smart-title-word-4">
                        נכון
                    </strong>
                </h2>

                <p className="smart-description">
                    המערכת מובילה אותך בצורה ברורה מהשלב הראשון
                    ועד לקבלת התוצאה.
                </p>
            </div>

            <div className="smart-steps-track">
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