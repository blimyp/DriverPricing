import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, CircleAlert, Info } from 'lucide-react'

import styles from './PricingPage.module.css'

import BackgroundSection from '../../components/background_section/background_section'
import DrivingRoute from './components/driving_route/driving_route'
import {
    PlannedDurationField,
    VehicleField,
    TripTypeField,
    TollsField,
    PaymentTypeField,
} from './components/driving_details/driving_details'
import PriceResult from './components/price_result/price_result'
import ChatMessageGroup from './components/chat/ChatMessageGroup'
import UserAnswerBubble from './components/chat/UserAnswerBubble'
import TypingIndicator from './components/chat/TypingIndicator'
import { getRoute } from '../../services/openRouteService'
import { getVehicles } from '../../services/vehiclesService'
import { getUserProfile } from '../../services/profileService'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicleDisplayName } from '../../utils/vehicles'
import { TRIP_TYPE_LABELS } from '../../utils/pricingEngine'

const TURNS = ['route', 'vehicle', 'details', 'payment', 'result']

const initialForm = {
    origin: '',
    destination: '',
    stops: [],

    distanceKm: '',
    routeDuration: '',
    plannedDuration: '',
    vehicleId: '',
    tripType: 'dropoff',
    tolls: '',

    driverPaymentType: 'hourly',
}

function PricingPage() {
    const [form, setForm] = useState(initialForm)
    const [activeTurnIndex, setActiveTurnIndex] = useState(0)
    const [seenTurnIndexes, setSeenTurnIndexes] = useState(() => new Set())
    const [isActiveTextRevealed, setIsActiveTextRevealed] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)

    const { user } = useAuth()
    const [vehicles, setVehicles] = useState([])
    const [settings, setSettings] = useState(null)

    const transcriptEndRef = useRef(null)

    const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.id === form.vehicleId
    )

    // טוענים הגדרות ורכבים עדכניים, כדי ששינוי בעמוד ההגדרות ייכנס מיד לחישוב
    useEffect(() => {
        if (!user?.id) return

        let isMounted = true

        Promise.all([getUserProfile(user.id), getVehicles(user.id)])
            .then(([profile, vehiclesList]) => {
                if (!isMounted) return

                setSettings(profile)
                setVehicles(vehiclesList)
            })
            .catch((error) => {
                console.error('Error loading pricing data:', error)

                if (isMounted) {
                    setSettings(user)
                }
            })

        return () => {
            isMounted = false
        }
    }, [user])

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

    function validateVehicleTurn() {
        if (!selectedVehicle) {
            return 'יש לבחור רכב'
        }

        return ''
    }

    function validateDetailsTurn() {
        if (form.tripType === 'dedicated') {
            const plannedDuration = Number(form.plannedDuration)

            if (!Number.isFinite(plannedDuration) || plannedDuration <= 0) {
                return 'יש להזין כמה שעות הרכב צמוד'
            }
        }

        const tolls = Number(form.tolls || 0)

        if (!Number.isFinite(tolls) || tolls < 0) {
            return 'יש להזין סכום אגרות תקין'
        }

        return ''
    }

    function getTurnValidationError(turnKey) {
        switch (turnKey) {
            case 'route':
                return validateRouteTurn()

            case 'vehicle':
                return validateVehicleTurn()

            case 'details':
                return validateDetailsTurn()

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
                    plannedDuration: routeDuration,
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

            case 'vehicle':
                return [
                    `מרחק המסלול הוא ${form.distanceKm} ק״מ, וזמן הנסיעה המשוער הוא ${form.routeDuration} שעות.`,
                    'באיזה רכב מהצי תתבצע הנסיעה?',
                ]

            case 'details':
                return `האם זו הקפצה או רכב צמוד? ויש אגרות או חניונים בדרך? (נוסיף אוטומטית ${settings?.deadhead_km ?? 20} ק״מ מנהלתיים מהחניון וחזרה)`

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

            case 'vehicle':
                return selectedVehicle
                    ? getVehicleDisplayName(selectedVehicle)
                    : ''

            case 'details': {
                const tolls = Number(form.tolls || 0)
                const tollsSuffix = tolls ? ` · אגרות ₪${tolls}` : ''

                const hoursSuffix =
                    form.tripType === 'dedicated' ? ` ${form.plannedDuration} שעות` : ''

                return `${TRIP_TYPE_LABELS[form.tripType]}${hoursSuffix}${tollsSuffix}`
            }

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

            case 'vehicle':
                if (!settings) {
                    return <TypingIndicator styles={styles} />
                }

                if (vehicles.length === 0) {
                    return (
                        <p className={styles.settingsHint}>
                            עדיין לא הוגדרו רכבים. יש להוסיף רכב בעמוד{' '}
                            <Link to="/prices" className={styles.settingsLink}>
                                ההגדרות
                            </Link>
                            {' '}כדי לתמחר נסיעה.
                        </p>
                    )
                }

                return (
                    <>
                        <VehicleField
                            styles={styles}
                            vehicles={vehicles}
                            value={form.vehicleId}
                            onChange={handleChange}
                        />

                        {renderTurnError()}
                        {renderAdvanceButton('הבא')}
                    </>
                )

            case 'details':
                return (
                    <>
                        <TripTypeField
                            styles={styles}
                            value={form.tripType}
                            onChange={handleChange}
                        />

                        {form.tripType === 'dedicated' && (
                            <PlannedDurationField
                                styles={styles}
                                value={form.plannedDuration}
                                onChange={handleChange}
                            />
                        )}

                        <TollsField
                            styles={styles}
                            value={form.tolls}
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
                return (
                    <PriceResult
                        styles={styles}
                        form={form}
                        vehicle={selectedVehicle}
                        settings={settings}
                        fleetSize={vehicles.length}
                    />
                )

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
                                <ChatMessageGroup
                                    styles={styles}
                                    texts={[].concat(getAssistantText(turnKey))}
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

                {/* מקריא לקורא מסך כל הודעה חדשה בשיחה */}
                <div className="visually-hidden" aria-live="polite">
                    {isLoadingRoute
                        ? 'מחשב את המסלול...'
                        : [].concat(getAssistantText(TURNS[activeTurnIndex])).join(' ')}
                </div>

                <div ref={transcriptEndRef} />
            </div>
        </main>
    )
}

export default PricingPage
