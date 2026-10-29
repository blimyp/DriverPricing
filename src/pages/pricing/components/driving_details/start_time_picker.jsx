import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react"

import pickerStyles from "./start_time_picker.module.css"
import { pad, toStartTimeValue } from "../../../../utils/startTime"

const WEEK_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5)
const PANEL_MAX_WIDTH = 320
const PANEL_GAP = 6

const monthFormat = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' })

function parseStartTime(value) {
    const date = new Date(value)
    return value && !Number.isNaN(date.getTime()) ? date : null
}

function isSameDay(first, second) {
    return first.getFullYear() === second.getFullYear()
        && first.getMonth() === second.getMonth()
        && first.getDate() === second.getDate()
}

function getMonthDays(viewMonth) {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstWeekDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = Array.from({ length: firstWeekDay }, () => null)

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day))
    }

    return days
}

function StartTimePicker({ styles, value, onChange }) {
    const selectedDate = parseStartTime(value)
    const [isOpen, setIsOpen] = useState(false)
    const [viewMonth, setViewMonth] = useState(() => {
        const base = selectedDate || new Date()
        return new Date(base.getFullYear(), base.getMonth(), 1)
    })
    const pickerRef = useRef(null)
    const anchorRef = useRef(null)
    const panelRef = useRef(null)
    const today = new Date()

    // החלון מוצב מחוץ לעמוד כדי שלא ייחתך, ולכן ממקמים אותו ידנית מתחת לשדה
    useLayoutEffect(() => {
        if (!isOpen) return

        function updatePosition() {
            const anchor = anchorRef.current
            const panel = panelRef.current
            if (!anchor || !panel) return

            const rect = anchor.getBoundingClientRect()
            const width = Math.min(PANEL_MAX_WIDTH, rect.width)
            const spaceBelow = window.innerHeight - rect.bottom
            const opensUp = spaceBelow < panel.offsetHeight + PANEL_GAP && rect.top > spaceBelow

            panel.style.width = `${width}px`
            panel.style.left = `${rect.right - width}px`
            panel.style.top = opensUp
                ? `${rect.top - panel.offsetHeight - PANEL_GAP}px`
                : `${rect.bottom + PANEL_GAP}px`
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        function handleOutsideClick(event) {
            if (
                !pickerRef.current?.contains(event.target)
                && !panelRef.current?.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen])

    function emitChange(date) {
        onChange({ target: { name: 'startTime', value: toStartTimeValue(date) } })
    }

    function handleToggle() {
        if (!isOpen && selectedDate) {
            setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
        }

        setIsOpen(!isOpen)
    }

    function changeMonth(offset) {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + offset, 1))
    }

    function selectDay(day) {
        const base = selectedDate || today
        emitChange(new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes()))
    }

    function selectTime(hours, minutes) {
        const base = selectedDate || today
        emitChange(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes))
    }

    function selectNow() {
        const now = new Date()
        setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1))
        emitChange(now)
    }

    const selectedHours = selectedDate?.getHours() ?? 0
    const selectedMinutes = selectedDate?.getMinutes() ?? 0
    const minuteOptions = MINUTES.includes(selectedMinutes)
        ? MINUTES
        : [...MINUTES, selectedMinutes].sort((first, second) => first - second)

    return (
        <div className={styles.formField} ref={pickerRef}>
            <label className={styles.formLabel} htmlFor="startTime">
                מועד הנסיעה
            </label>

            <div className={styles.inputWrapper} ref={anchorRef}>
                <CalendarClock
                    className={styles.inputIcon}
                    strokeWidth={1.9}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    id="startTime"
                    className={`${styles.formControl} ${pickerStyles.trigger}`}
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                >
                    {selectedDate ? (
                        <>
                            <span className={pickerStyles.triggerTime}>
                                {pad(selectedDate.getDate())}/{pad(selectedDate.getMonth() + 1)}/{selectedDate.getFullYear()}
                                {'  '}
                                {pad(selectedHours)}:{pad(selectedMinutes)}
                            </span>
                        </>
                    ) : (
                        <span className={pickerStyles.triggerPlaceholder}>בחירת תאריך ושעה</span>
                    )}
                </button>
            </div>

            {isOpen && createPortal(
                <div
                    ref={panelRef}
                    className={pickerStyles.panel}
                    role="dialog"
                    aria-label="בחירת מועד הנסיעה"
                    dir="rtl"
                >
                    <div className={pickerStyles.header}>
                        <button
                            type="button"
                            className={pickerStyles.navButton}
                            onClick={() => changeMonth(-1)}
                            aria-label="חודש קודם"
                        >
                            <ChevronRight strokeWidth={2.2} aria-hidden="true" />
                        </button>

                        <span className={pickerStyles.monthTitle}>{monthFormat.format(viewMonth)}</span>

                        <button
                            type="button"
                            className={pickerStyles.navButton}
                            onClick={() => changeMonth(1)}
                            aria-label="חודש הבא"
                        >
                            <ChevronLeft strokeWidth={2.2} aria-hidden="true" />
                        </button>
                    </div>

                    <div className={pickerStyles.grid}>
                        {WEEK_DAYS.map((weekDay) => (
                            <span
                                key={weekDay}
                                className={`${pickerStyles.weekDay} ${weekDay === 'ש׳' ? pickerStyles.weekDayRest : ''}`}
                            >
                                {weekDay}
                            </span>
                        ))}

                        {getMonthDays(viewMonth).map((day, index) => {
                            if (!day) {
                                return <span key={`empty-${index}`} />
                            }

                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isToday = isSameDay(day, today)

                            return (
                                <button
                                    key={day.getDate()}
                                    type="button"
                                    className={[
                                        pickerStyles.day,
                                        isToday ? pickerStyles.dayToday : '',
                                        isSelected ? pickerStyles.daySelected : '',
                                    ].join(' ')}
                                    onClick={() => selectDay(day)}
                                    aria-pressed={Boolean(isSelected)}
                                >
                                    {day.getDate()}
                                </button>
                            )
                        })}
                    </div>

                    <div className={pickerStyles.timeRow}>
                        <span className={pickerStyles.timeLabel}>שעה</span>

                        <div className={pickerStyles.timeSelects}>
                            <select
                                className={pickerStyles.timeSelect}
                                value={selectedMinutes}
                                onChange={(event) => selectTime(selectedHours, Number(event.target.value))}
                                aria-label="דקות"
                            >
                                {minuteOptions.map((minute) => (
                                    <option key={minute} value={minute}>{pad(minute)}</option>
                                ))}
                            </select>

                            <span className={pickerStyles.timeColon}>:</span>

                            <select
                                className={pickerStyles.timeSelect}
                                value={selectedHours}
                                onChange={(event) => selectTime(Number(event.target.value), selectedMinutes)}
                                aria-label="שעות"
                            >
                                {HOURS.map((hour) => (
                                    <option key={hour} value={hour}>{pad(hour)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={pickerStyles.actions}>
                        <button type="button" className={pickerStyles.nowButton} onClick={selectNow}>
                            היום
                        </button>

                        <button type="button" className={pickerStyles.doneButton} onClick={() => setIsOpen(false)}>
                            אישור
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default StartTimePicker
