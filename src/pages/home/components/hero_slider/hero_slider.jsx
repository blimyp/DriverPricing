import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'

import './hero_slider.css'
import { Images } from '../../../../constants/images'

const SLIDE_INTERVAL_MS = 5000

const slides = [
    {
        image: Images.hero[0],
        eyebrow: 'תמחור נסיעות חכם ומדויק',
        titleLine: 'התמחור שלכם',
        titleAccent: 'מתחיל כאן',
        description:
            'כל נסיעה מתומחרת במהירות, בדיוק ובשקיפות מלאה — ' +
            'כדי שתוכלו להתמקד בדרך ולא בחישובים.',
    },
    {
        image: Images.hero[1],
        eyebrow: 'מהחוף ועד ליעד',
        titleLine: 'כל מסלול',
        titleAccent: 'מתומחר בדיוק',
        description:
            'נסיעה קצרה או מסלול ארוך לאורך החוף — המערכת מחשבת ' +
            'עבורכם תמחור מהיר ומדויק לכל דרך.',
    },
    {
        image: Images.hero[2],
        eyebrow: 'יעילות שרואים בכל נסיעה',
        titleLine: 'בלי כאבי ראש',
        titleAccent: 'בחישובים',
        description:
            'תמחור אוטומטי שחוסך זמן ומצמצם טעויות, כדי שתוכלו ' +
            'להתמקד בדרך ולא בחישובים.',
    },
]

function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (isPaused) {
            return undefined
        }

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slides.length)
        }, SLIDE_INTERVAL_MS)

        return () => clearInterval(timer)
    }, [isPaused])

    const activeSlide = slides[activeIndex]

    return (
        <section className="hero-slider" dir="rtl">
            <div className="hero-slider-backgrounds">
                {slides.map((slide, index) => (
                    <div
                        key={slide.image}
                        className={`hero-slide ${index === activeIndex ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                ))}
            </div>

            <div className="hero-slider-overlay" />

            <div className="hero-slider-content" key={activeIndex}>
                <span className="hero-eyebrow">{activeSlide.eyebrow}</span>

                <h1 className="hero-title">
                    <span className="hero-title-line">
                        {activeSlide.titleLine}
                    </span>
                    <strong className="hero-title-line hero-title-accent">
                        {activeSlide.titleAccent}
                    </strong>
                </h1>

                <p className="hero-description">{activeSlide.description}</p>

                <div className="hero-actions">
                    <Link to="/pricing" className="hero-primary-button">
                        התחילו לתמחר נסיעה
                        <span aria-hidden="true">←</span>
                    </Link>
                </div>
            </div>

            <div className="hero-slider-controls">
                <div className="hero-slider-dots">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.image}
                            type="button"
                            aria-label={`מעבר לשקופית ${index + 1}`}
                            className={`hero-dot ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className="hero-pause-button"
                    aria-pressed={isPaused}
                    aria-label={
                        isPaused
                            ? 'המשך החלפת שקופיות אוטומטית'
                            : 'עצירת החלפת שקופיות אוטומטית'
                    }
                    onClick={() => setIsPaused((prev) => !prev)}
                >
                    {isPaused ? <Play /> : <Pause />}
                </button>
            </div>
        </section>
    )
}

export default HeroSlider
