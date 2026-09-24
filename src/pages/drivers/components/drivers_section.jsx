import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

import Collapsible from '../../../components/collapsible/collapsible'

function DriversSection({
    title,
    description,
    icon: Icon,
    countLabel,
    addLabel,
    onAdd,
    addDisabled = false,
    children,
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <section
            className={
                isOpen
                    ? 'drivers-section open'
                    : 'drivers-section'
            }
        >
            <div
                className="drivers-section-header"
                onClick={() => setIsOpen((current) => !current)}
            >
                <div>
                    <div className="drivers-section-title-row">
                        <h2>{title}</h2>

                        <button
                            type="button"
                            className="section-add-button"
                            onClick={(event) => {
                                event.stopPropagation()
                                onAdd()
                            }}
                            disabled={addDisabled}
                            aria-label={addLabel}
                            data-tooltip={addLabel}
                        >
                            <Plus size={18} strokeWidth={2.4} />
                        </button>
                    </div>

                    <div className="drivers-section-span">
                        <Icon size={15} />
                        <p>{description}</p>
                    </div>
                </div>

                <div className="drivers-section-header-end">
                    <span className="drivers-count">
                        {countLabel}
                    </span>

                    <button
                        type="button"
                        className="drivers-section-toggle"
                        aria-expanded={isOpen}
                        aria-label={
                            isOpen ? 'הסתרת פירוט' : 'הצגת פירוט'
                        }
                    >
                        <ChevronDown size={18} strokeWidth={2.2} />
                    </button>
                </div>
            </div>

            <Collapsible isOpen={isOpen}>
                <div className="drivers-section-body">
                    {children}
                </div>
            </Collapsible>
        </section>
    )
}

export default DriversSection
