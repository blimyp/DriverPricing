import './background_section.css'

function BackgroundSection({ children, className = '', withMovingLines = true }) {
    return (
        <section className={`background-section ${className}`}>
            {withMovingLines && <div className="background-ring background-ring-one" />}
            {withMovingLines && <div className="background-ring background-ring-two" />}

            {withMovingLines && <div className="background-moving-line background-moving-line-one" />}
            {withMovingLines && <div className="background-moving-line background-moving-line-two" />}

            {children}
        </section>
    )
}

export default BackgroundSection