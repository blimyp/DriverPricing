import { useState } from 'react'

import './collapsible.css'

function Collapsible({ isOpen, children }) {
    // Overflow stays hidden while animating, and becomes visible once fully
    // open so popovers inside the content are not clipped.
    const [settled, setSettled] = useState(false)

    const handleTransitionEnd = (event) => {
        if (event.target === event.currentTarget) {
            setSettled(isOpen)
        }
    }

    const className = [
        'collapsible',
        isOpen ? 'open' : '',
        isOpen && settled ? 'settled' : '',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div
            className={className}
            onTransitionEnd={handleTransitionEnd}
            inert={!isOpen}
        >
            <div className="collapsible-inner">
                {children}
            </div>
        </div>
    )
}

export default Collapsible
