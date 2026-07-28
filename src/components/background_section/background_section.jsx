import './background_section.css'

function BackgroundSection({ children, className = '' }) {
    return (
        <section className={`background-section ${className}`}>
            <div className="background-ring background-ring-one" />
            <div className="background-ring background-ring-two" />

            <div className="background-moving-line background-moving-line-one" />
            <div className="background-moving-line background-moving-line-two" />

            {children}
        </section>
    )
}

export default BackgroundSection