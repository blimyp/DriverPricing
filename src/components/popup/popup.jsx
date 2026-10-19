import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import './popup.css'

const FIELD_SELECTOR =
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

function Popup({ isOpen, ...props }) {
    if (!isOpen) {
        return null
    }

    return <PopupDialog {...props} />
}

function PopupDialog({
    onClose,
    titleId,
    children,
    closeOnOverlayClick = true,
}) {
    const dialogRef = useRef(null)

    // The browser traps focus inside a modal dialog and returns it
    // to the opening button when the dialog closes
    useLayoutEffect(() => {
        const dialog = dialogRef.current

        dialog.showModal()
        dialog.querySelector(FIELD_SELECTOR)?.focus()

        return () => dialog.close()
    }, [])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow

        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [])

    // Let the parent decide whether Escape closes the popup
    function handleCancel(event) {
        event.preventDefault()
        onClose()
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
        <dialog
            ref={dialogRef}
            className="popupOverlay"
            aria-labelledby={titleId}
            onCancel={handleCancel}
            onMouseDown={handleOverlayClick}
        >
            <div className="popupContainer">
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
        </dialog>,
        document.body
    )
}

export default Popup
