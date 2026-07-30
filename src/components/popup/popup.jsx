import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import './popup.css'

function Popup({
    isOpen,
    onClose,
    children,
    closeOnOverlayClick = true,
}) {
    useEffect(() => {
        if (!isOpen) {
            return
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const previousOverflow =
            document.body.style.overflow

        document.body.style.overflow = 'hidden'
        document.addEventListener(
            'keydown',
            handleKeyDown
        )

        return () => {
            document.body.style.overflow =
                previousOverflow

            document.removeEventListener(
                'keydown',
                handleKeyDown
            )
        }
    }, [isOpen, onClose])

    if (!isOpen) {
        return null
    }

    function handleOverlayClick(event) {
        if (
            closeOnOverlayClick &&
            event.target === event.currentTarget
        ) {
            onClose()
        }
    }

    return createPortal(
        <div
            className="popupOverlay"
            onMouseDown={handleOverlayClick}
            role="presentation"
        >
            <div
                className="popupContainer"
                role="dialog"
                aria-modal="true"
            >
                <button
                    className="popupCloseButton"
                    type="button"
                    onClick={onClose}
                    aria-label="סגירת החלון"
                >
                    <X
                        size={20}
                        strokeWidth={2.2}
                        aria-hidden="true"
                    />
                </button>

                {children}
            </div>
        </div>,
        document.body
    )
}

export default Popup