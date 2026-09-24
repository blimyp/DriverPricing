import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

import './starting_balance_editor.css'

const VIEWPORT_MARGIN = 8

function StartingBalanceEditor({ initialValue, onSave }) {
    const containerRef = useRef(null)
    const popoverRef = useRef(null)

    const [isOpen, setIsOpen] = useState(false)
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            return undefined
        }

        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Keep the popover inside the screen: shift it sideways if it
    // overflows, and open it above the button if there is no room below.
    useLayoutEffect(() => {
        const popover = popoverRef.current

        if (!isOpen || !popover) {
            return
        }

        popover.style.setProperty('--popover-shift', '0px')
        popover.classList.remove('above')

        const rect = popover.getBoundingClientRect()
        const viewportWidth = document.documentElement.clientWidth

        let shift = 0

        if (rect.left < VIEWPORT_MARGIN) {
            shift = VIEWPORT_MARGIN - rect.left
        } else if (rect.right > viewportWidth - VIEWPORT_MARGIN) {
            shift = viewportWidth - VIEWPORT_MARGIN - rect.right
        }

        popover.style.setProperty('--popover-shift', `${shift}px`)

        const buttonRect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom

        if (
            spaceBelow < VIEWPORT_MARGIN &&
            buttonRect.top > rect.height + VIEWPORT_MARGIN * 2
        ) {
            popover.classList.add('above')
        }
    }, [isOpen])

    const open = () => {
        setValue(String(Number(initialValue) || 0))
        setError(false)
        setIsOpen(true)
    }

    const close = () => {
        if (!saving) {
            setIsOpen(false)
        }
    }

    const handleSave = async () => {
        if (!Number.isFinite(Number(value))) {
            setError(true)
            return
        }

        try {
            setSaving(true)
            setError(false)

            await onSave(Number(value) || 0)

            setIsOpen(false)
        } catch (error) {
            console.error('Error updating starting balance:', error)

            setError(true)
        } finally {
            setSaving(false)
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleSave()
        }

        if (event.key === 'Escape') {
            close()
        }
    }

    return (
        <div
            ref={containerRef}
            className="starting-balance-editor"
        >
            <button
                type="button"
                className={
                    isOpen
                        ? 'driver-edit-button open'
                        : 'driver-edit-button'
                }
                onClick={isOpen ? close : open}
                aria-label="עריכת יתרת פתיחה"
                data-tooltip="עריכת יתרת פתיחה"
            >
                <Pencil size={14} strokeWidth={2} />
            </button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="starting-balance-editor-popover"
                >
                    <span className="starting-balance-editor-label">
                        יתרת פתיחה
                    </span>

                    <div className="starting-balance-editor-row">
                        <input
                            type="number"
                            step="1"
                            className={error ? 'error' : ''}
                            value={value}
                            onChange={(event) =>
                                setValue(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={saving}
                            autoFocus
                        />

                        <button
                            type="button"
                            className="starting-balance-editor-save"
                            onClick={handleSave}
                            disabled={saving}
                            aria-label="שמירה"
                        >
                            <Check size={14} strokeWidth={2.6} />
                        </button>

                        <button
                            type="button"
                            className="starting-balance-editor-cancel"
                            onClick={close}
                            disabled={saving}
                            aria-label="ביטול"
                        >
                            <X size={14} strokeWidth={2.6} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StartingBalanceEditor
