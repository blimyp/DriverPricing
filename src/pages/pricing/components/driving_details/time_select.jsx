import { useEffect, useRef, useState } from "react"

import pickerStyles from "./start_time_picker.module.css"
import { pad } from "../../../../utils/startTime"

// רשימת בחירה קטנה עם גובה מוגבל, במקום הרשימה של הדפדפן שנפתחת לכל גובה המסך
function TimeSelect({ value, options, onChange, ariaLabel }) {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef(null)
    const listRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        // גוללים לערך הנבחר ומעבירים אליו את המיקוד
        const selected = listRef.current?.querySelector('[aria-selected="true"]')
        selected?.scrollIntoView({ block: 'center' })
        selected?.focus({ preventScroll: true })

        function handleOutsideClick(event) {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [isOpen])

    function handleSelect(option) {
        onChange(option)
        setIsOpen(false)
    }

    function handleListKeyDown(event) {
        const items = [...listRef.current.querySelectorAll('button')]
        const index = items.indexOf(document.activeElement)

        if (event.key === 'Escape') {
            // סוגרים רק את הרשימה, לא את כל חלון הבחירה
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
            setIsOpen(false)
            return
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            const nextIndex = Math.min(Math.max(index + step, 0), items.length - 1)
            items[nextIndex]?.focus()
        }
    }

    return (
        <div className={pickerStyles.timeSelectWrapper} ref={wrapperRef}>
            <button
                type="button"
                className={`${pickerStyles.timeSelect} ${isOpen ? pickerStyles.timeSelectOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                {pad(value)}
            </button>

            {isOpen && (
                <div
                    ref={listRef}
                    className={pickerStyles.timeList}
                    role="listbox"
                    aria-label={ariaLabel}
                    onKeyDown={handleListKeyDown}
                >
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={option === value}
                            className={`${pickerStyles.timeOption} ${option === value ? pickerStyles.timeOptionSelected : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {pad(option)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TimeSelect
