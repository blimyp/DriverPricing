import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, CircleAlert, Info } from 'lucide-react'

import styles from './PricingPage.module.css'

import BackgroundSection from '../../components/background_section/background_section'
import DrivingRoute from './components/driving_route/driving_route'
import {
    PlannedDurationField,
    VehicleTypeField,
    PaymentTypeField,
} from './components/driving_details/driving_details'
import PriceResult from './components/price_result/price_result'
import ChatMessage from './components/chat/ChatMessage'
import UserAnswerBubble from './components/chat/UserAnswerBubble'
import TypingIndicator from './components/chat/TypingIndicator'
import { getRoute } from '../../services/openRouteService'

const TURNS = ['route', 'duration', 'vehicle', 'payment', 'result']

const VEHICLE_LABELS = {
    van: 'טנדר',
    minibus: 'מיניבוס',
    bus: 'אוטובוס',
}

const initialForm = {
    origin: '',
    destination: '',
    stops: [],

    distanceKm: '',
    routeDuration: '',
    plannedDuration: '',
    vehicleType: 'van',

    driverPaymentType: 'hourly',
}

function PricingPage() {
    const [form, setForm] = useState(initialForm)
    const [activeTurnIndex, setActiveTurnIndex] = useState(0)
    const [seenTurnIndexes, setSeenTurnIndexes] = useState(() => new Set())
    const [isActiveTextRevealed, setIsActiveTextRevealed] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)

    const transcriptEndRef = useRef(null)

    useEffect(() => {
        setIsActiveTextRevealed(seenTurnIndexes.has(activeTurnIndex))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTurnIndex])

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        })
    }, [activeTurnIndex, isActiveTextRevealed, isLoadingRoute])

    function updateFormField(name, value) {
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }))

        setErrorMessage('')
    }

    function handleChange(event) {
        const { name, value } = event.target
        updateFormField(name, value)
    }

    function updateOrigin(value) {
        updateFormField('origin', value)
    }

    function updateDestination(value) {
        updateFormField('destination', value)
    }

    function updateStops(newStops) {
        updateFormField('stops', newStops)
    }

    function markTurnSeen(index) {
        setSeenTurnIndexes((currentSeen) => {
            if (currentSeen.has(index)) {
                return currentSeen
            }

            const nextSeen = new Set(currentSeen)
            nextSeen.add(index)
            return nextSeen
        })

        if (index === activeTurnIndex) {
            setIsActiveTextRevealed(true)
        }
    }

    function validateRouteTurn() {
        if (!form.origin.trim()) {
            return 'יש להזין נקודת מוצא'
        }

        if (!form.destination.trim()) {
            return 'יש להזין יעד'
        }

        return ''
    }

    function validateDurationTurn() {
        const plannedDuration = Number(form.plannedDuration)

        if (!Number.isFinite(plannedDuration) || plannedDuration <= 0) {
            return 'יש להזין שעות נסיעה מתוכננות'
        }

        return ''
    }

    function validateVehicleTurn() {
        if (!form.vehicleType) {
            return 'יש לבחור סוג רכב'
        }

        return ''
    }

    function getTurnValidationError(turnKey) {
        switch (turnKey) {
            case 'route':
                return validateRouteTurn()

            case 'duration':
                return validateDurationTurn()

            case 'vehicle':
                return validateVehicleTurn()

            default:
                return ''
        }
    }

    async function handleAdvance() {
        const turnKey = TURNS[activeTurnIndex]
        const validationError = getTurnValidationError(turnKey)

        if (validationError) {
            setErrorMessage(validationError)
            return
        }

        if (turnKey === 'route') {
            try {
                setIsLoadingRoute(true)
                setErrorMessage('')

                const result = await getRoute({
                    origin: form.origin,
                    destination: form.destination,
                    stops: form.stops,
                })

                const routeDuration = (result.durationMinutes / 60).toFixed(1)

                setForm((currentForm) => ({
                    ...currentForm,
                    distanceKm: result.distanceKm.toFixed(1),
                    routeDuration,
                    plannedDuration: currentForm.plannedDuration || routeDuration,
                }))
            } catch (error) {
                console.error(error)
                setErrorMessage('לא הצלחנו לחשב את המסלול')
                return
            } finally {
                setIsLoadingRoute(false)
            }
        }

        markTurnSeen(activeTurnIndex)
        setErrorMessage('')
        setActiveTurnIndex((currentIndex) =>
            Math.min(currentIndex + 1, TURNS.length - 1)
        )
    }

    function handleEditTurn(index) {
        setActiveTurnIndex(index)
        setErrorMessage('')

        setSeenTurnIndexes((currentSeen) => {
            const nextSeen = new Set()

            currentSeen.forEach((seenIndex) => {
                if (seenIndex <= index) {
                    nextSeen.add(seenIndex)
                }
            })

            return nextSeen
        })
    }

    function getAssistantText(turnKey) {
        switch (turnKey) {
            case 'route':
                return 'בוא נתמחר את הנסיעה שלך! מה המסלול שאתה מתכנן?'

            case 'duration':
                return `מרחק המסלול הוא ${form.distanceKm} ק״מ, וזמן הנסיעה המשוער הוא ${form.routeDuration} שעות. יש לך הערכת זמן נסיעה שונה? אפשר לעדכן כאן:`

            case 'vehicle':
                return 'מעולה! באיזה סוג רכב אתה נוסע בנסיעה הזו?'

            case 'payment':
                return 'איך תרצה לשלם לנהג בנסיעה הזו — לפי אחוזים ממחיר הנסיעה או לפי מחיר שעתי?'

            case 'result':
                return 'הנה סיכום המחיר לנסיעה שלך:'

            default:
                return ''
        }
    }

    function getAnswerSummary(turnKey) {
        switch (turnKey) {
            case 'route': {
                const stopsCount = form.stops.filter((stop) => stop.trim()).length
                const stopsSuffix = stopsCount ? ` (+${stopsCount} תחנות)` : ''

                return `${form.origin} ← ${form.destination}${stopsSuffix}`
            }

            case 'duration':
                return `${form.plannedDuration} שעות`

            case 'vehicle':
                return VEHICLE_LABELS[form.vehicleType] || form.vehicleType

            case 'payment':
                return form.driverPaymentType === 'percentage'
                    ? 'לפי אחוזים ממחיר הנסיעה'
                    : 'לפי מחיר שעתי'

            default:
                return ''
        }
    }

    function renderTurnError() {
        if (!errorMessage) {
            return null
        }

        return (
            <div className={styles.inlineError} role="alert">
                <CircleAlert
                    className={styles.messageIcon}
                    strokeWidth={2}
                    aria-hidden="true"
                />

                <span>{errorMessage}</span>
            </div>
        )
    }

    function renderAdvanceButton(label, disabled = false) {
        return (
            <button
                className={styles.nextButton}
                type="button"
                onClick={handleAdvance}
                disabled={disabled}
            >
                <span>{label}</span>
                <ChevronLeft strokeWidth={2} aria-hidden="true" />
            </button>
        )
    }

    function renderTurnInput(turnKey) {
        switch (turnKey) {
            case 'route':
                return (
                    <>
                        <DrivingRoute
                            origin={form.origin}
                            destination={form.destination}
                            stops={form.stops}
                            onOriginChange={updateOrigin}
                            onDestinationChange={updateDestination}
                            onStopsChange={updateStops}
                        />

                        {renderTurnError()}

                        {renderAdvanceButton(
                            isLoadingRoute ? 'מחשב מסלול...' : 'הבא',
                            isLoadingRoute
                        )}
                    </>
                )

            case 'duration':
                return (
                    <>
                        <PlannedDurationField
                            styles={styles}
                            value={form.plannedDuration}
                            onChange={handleChange}
                        />

                        {renderTurnError()}
                        {renderAdvanceButton('הבא')}
                    </>
                )

            case 'vehicle':
                return (
                    <>
                        <VehicleTypeField
                            styles={styles}
                            value={form.vehicleType}
                            onChange={handleChange}
                        />

                        {renderTurnError()}
                        {renderAdvanceButton('הבא')}
                    </>
                )

            case 'payment':
                return (
                    <>
                        <PaymentTypeField
                            styles={styles}
                            value={form.driverPaymentType}
                            onChange={handleChange}
                        />

                        <p className={styles.settingsHint}>
                            אפשר לערוך את מחיר השעה ואת אחוז התשלום לנהג בעמוד{' '}
                            <Link to="/prices" className={styles.settingsLink}>
                                ההגדרות
                            </Link>
                            .
                        </p>

                        {renderTurnError()}

                        {renderAdvanceButton('חשב מחיר')}
                    </>
                )

            case 'result':
                return <PriceResult styles={styles} form={form} />

            default:
                return null
        }
    }

    return (
        <main className={styles.pricingPage} dir="rtl">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    תמחור נסיעה <span className={styles.pageTitleAccent}>בקלות</span>
                </h1>

                <p className={styles.pageNote}>
                    <Info
                        className={styles.pageNoteIcon}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    <span>
                        לתשומת ליבכם, המחיר הסופי מתקבל בהתאם להגדרות האישיות שלכם בעמוד{' '}
                        <Link to="/prices" className={styles.pageNoteLink}>
                            ההגדרות
                        </Link>
                        .
                    </span>
                </p>
            </div>

            <div className={styles.chatCard}>
                {TURNS.slice(0, activeTurnIndex + 1).map(
                    (turnKey, index) => {
                        const isActive = index === activeTurnIndex

                        return (
                            <div className={styles.chatTurn} key={turnKey}>
                                <ChatMessage
                                    styles={styles}
                                    text={getAssistantText(turnKey)}
                                    alreadySeen={!isActive || isActiveTextRevealed}
                                    onDone={() => markTurnSeen(index)}
                                />

                                {!isActive && (
                                    <UserAnswerBubble
                                        styles={styles}
                                        text={getAnswerSummary(turnKey)}
                                        onClick={() => handleEditTurn(index)}
                                    />
                                )}

                                {isActive && isActiveTextRevealed && (
                                    <div
                                        className={`${styles.chatMessageRow} ${styles.chatMessageAssistant}`}
                                    >
                                        <BackgroundSection className={styles.chatInputArea} withMovingLines={false}>
                                            {renderTurnInput(turnKey)}
                                        </BackgroundSection>
                                    </div>
                                )}
                            </div>
                        )
                    }
                )}

                {isLoadingRoute && <TypingIndicator styles={styles} />}

                <div ref={transcriptEndRef} />
            </div>
        </main>
    )
}

export default PricingPage
