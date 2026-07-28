import { useEffect, useRef, useState } from "react";
import './reveal.css';

function Reveal({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    threshold = 0.15,
}) {
    const elementRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = elementRef.current

        if (!element) {
            return undefined
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(element)
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -45px 0px',
            }
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [threshold])

    return (
        <div
            ref={elementRef}
            className={[
                'reveal-element',
                `reveal-${direction}`,
                isVisible ? 'is-visible' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                '--reveal-delay': `${delay}ms`,
            }}
        >
            {children}
        </div>
    )
}

export default Reveal