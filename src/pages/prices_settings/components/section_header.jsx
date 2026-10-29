import { ChevronDown } from 'lucide-react'

function SectionHeader({ icon: Icon, title, description, isOpen, onToggle, children }) {
    return (
        <div className="prices-section-header">
            <button
                type="button"
                className="prices-section-title prices-section-toggle"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className="prices-section-icon">
                    <Icon size={18} />
                </span>
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </button>

            {children}

            {/* the chevron sits after the actions so they appear to its right */}
            <button
                type="button"
                className="prices-section-chevron-button"
                onClick={onToggle}
                tabIndex={-1}
                aria-hidden="true"
            >
                <ChevronDown
                    size={20}
                    className={`prices-section-chevron${isOpen ? ' open' : ''}`}
                />
            </button>
        </div>
    )
}

export default SectionHeader
