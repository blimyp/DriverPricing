import { useEffect, useRef, useState } from 'react'
import './benefit_card.css'

function BenefitCard({
    number,
    title,
    text,
    icon,
    delay = 0,
}) {
    const cardRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const card = cardRef.current

        if (!card) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(card)
                }
            },
            {
                threshold: 0.25,
            }
        )

        observer.observe(card)

        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <article
            ref={cardRef}
            className={`benefit-card-component ${isVisible ? 'benefit-card-visible' : ''
                }`}
            style={{
                '--benefit-delay': `${delay * 200}ms`,
            }}
        >
            <span className="benefit-card-border" />

            <div className="benefit-card-hexagon">
                <span className="benefit-card-number">
                    {number}
                </span>
            </div>

            <div className="benefit-card-icon">
                <img
                    src={icon}
                    alt="icon"
                    className="benefit-card-icon-image"
                />
            </div>

            <h3 className="benefit-card-title">
                {title}
            </h3>

            <p className="benefit-card-text">
                {text}
            </p>
        </article>
    )
}

export default BenefitCard