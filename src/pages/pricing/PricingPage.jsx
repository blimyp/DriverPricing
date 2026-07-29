import { useState } from 'react'
import {
    Route,
    CarFront,
    Calculator,
    CircleAlert,
    BadgeCheck,
    Clock3,
    MapPinned,
    WalletCards,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import styles from './PricingPage.module.css'

import { saveTrip } from '../../services/tripsService'
import { useAuth } from '../../contexts/AuthContext'

import BackgroundSection from '../../components/background_section/background_section'
import DrivingRoute from './components/driving_route/driving_route'
import DriverPayment from './components/driver_payment/driver_payment'
import StepPanelHeader from './components/pricing_step_panel_header'

const vehiclePrices = {
    regular: {
        basePrice: 20,
        pricePerKm: 4,
    },
    large: {
        basePrice: 30,
        pricePerKm: 5.5,
    },
}

const steps = [
    {
        id: 'route',
        title: 'מסלול הנסיעה',
        shortTitle: 'מסלול',
        description: 'מוצא, יעד ותחנות',
        icon: MapPinned,
    },
    {
        id: 'details',
        title: 'פרטי הנסיעה',
        shortTitle: 'פרטים',
        description: 'מרחק ומשך זמן',
        icon: Clock3,
    },
    {
        id: 'driver',
        title: 'תשלום לנהג',
        shortTitle: 'תשלום',
        description: 'אופן וגובה התשלום',
        icon: WalletCards,
    },
]

const initialForm = {
    origin: '',
    destination: '',
    stops: [],

    distanceKm: '',
    duration: '',
    vehicleType: 'regular',

    driverPaymentType: 'hourly',
    driverHourlyRate: '',
    driverPercentage: '',
}

function StepPanel({
    step,
    stepIndex,
    children,
}) {
    return (
        <div
            className={styles.stepPanel}
            key={`${step.id}-step`}
        >
            <StepPanelHeader
                icon={step.icon}
                stepNumber={stepIndex + 1}
                totalSteps={steps.length}
                title={step.title}
                styles={styles}
            />

            <div className={styles.stepPanelContent}>
                {children}
            </div>
        </div>
    )
}

function PricingPage() {
    const { user } = useAuth()

    const [form, setForm] = useState(initialForm)
    const [activeStep, setActiveStep] = useState(0)

    const [price, setPrice] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    const [saveLoading, setSaveLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [saveError, setSaveError] = useState('')

    const isFirstStep = activeStep === 0
    const isLastStep = activeStep === steps.length - 1

    function clearCalculationState() {
        setErrorMessage('')
        setPrice(null)
        setSaveMessage('')
        setSaveError('')
    }

    function updateFormField(name, value) {
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }))

        clearCalculationState()
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

    function validateRouteStep() {
        if (!form.origin.trim()) {
            return 'יש להזין נקודת מוצא'
        }

        if (!form.destination.trim()) {
            return 'יש להזין יעד'
        }

        return ''
    }

    function validateTripDetailsStep() {
        const distance = Number(form.distanceKm)
        const duration = Number(form.duration)

        if (!Number.isFinite(distance) || distance <= 0) {
            return 'יש להזין מרחק תקין'
        }

        if (!Number.isFinite(duration) || duration <= 0) {
            return 'יש להזין משך נסיעה תקין'
        }

        if (!form.vehicleType) {
            return 'יש לבחור סוג רכב'
        }

        return ''
    }

    function validateDriverPaymentStep() {
        if (form.driverPaymentType === 'hourly') {
            const hourlyRate = Number(form.driverHourlyRate)

            if (
                !Number.isFinite(hourlyRate) ||
                hourlyRate <= 0
            ) {
                return 'יש להזין תשלום תקין לנהג לשעה'
            }
        }

        if (form.driverPaymentType === 'percentage') {
            const percentage = Number(
                form.driverPercentage
            )

            if (
                !Number.isFinite(percentage) ||
                percentage <= 0 ||
                percentage > 100
            ) {
                return 'יש להזין אחוז תקין בין 1 ל־100'
            }
        }

        return ''
    }

    function getStepValidationError(stepIndex) {
        switch (stepIndex) {
            case 0:
                return validateRouteStep()

            case 1:
                return validateTripDetailsStep()

            case 2:
                return validateDriverPaymentStep()

            default:
                return ''
        }
    }

    function validateStep(stepIndex) {
        const validationError = getStepValidationError(stepIndex)
        setErrorMessage(validationError)
        return !validationError
    }

    function goToNextStep() {
        if (!validateStep(activeStep)) {
            return
        }

        setActiveStep((currentStep) =>
            Math.min(currentStep + 1, steps.length - 1)
        )

        setErrorMessage('')
    }

    function goToPreviousStep() {
        setActiveStep((currentStep) => Math.max(currentStep - 1, 0))
        setErrorMessage('')
    }

    function goToStep(stepIndex) {
        if (stepIndex === activeStep) {
            return
        }

        if (stepIndex < activeStep) {
            setActiveStep(stepIndex)
            setErrorMessage('')
            return
        }

        for (
            let currentStep = activeStep;
            currentStep < stepIndex;
            currentStep += 1
        ) {
            if (!validateStep(currentStep)) {
                setActiveStep(currentStep)
                return
            }
        }

        setActiveStep(stepIndex)
        setErrorMessage('')
    }

    function validateAllSteps() {
        for (
            let stepIndex = 0;
            stepIndex < steps.length;
            stepIndex += 1
        ) {
            const validationError = getStepValidationError(stepIndex)

            if (validationError) {
                setErrorMessage(validationError)
                setActiveStep(stepIndex)
                return false
            }
        }

        setErrorMessage('')

        return true
    }

    function calculatePrice() {
        const distance = Number(form.distanceKm)
        const selectedVehicle =
            vehiclePrices[form.vehicleType]

        return (
            selectedVehicle.basePrice +
            distance * selectedVehicle.pricePerKm
        )
    }

    function handleSubmit(event) {
        event.preventDefault()

        if (!validateAllSteps()) {
            return
        }

        const calculatedPrice = calculatePrice()

        setPrice(calculatedPrice)
        setErrorMessage('')
        setSaveMessage('')
        setSaveError('')
    }

    async function handleSaveTrip() {
        if (!user) {
            setSaveError(
                'יש להתחבר כדי לשמור את הנסיעה'
            )
            return
        }

        if (price === null) {
            setSaveError(
                'יש לחשב את מחיר הנסיעה לפני השמירה'
            )
            return
        }

        try {
            setSaveLoading(true)
            setSaveMessage('')
            setSaveError('')

            await saveTrip({
                userId: user.id,
                origin: form.origin,
                destination: form.destination,
                stops: form.stops,
                distance: form.distanceKm,
                duration: form.duration,
                calculatedPrice: price,
                tripType: form.vehicleType,
                driverPaymentType: form.driverPaymentType,
                driverHourlyRate: form.driverHourlyRate,
                driverPercentage: form.driverPercentage,
            })

            setSaveMessage('הנסיעה נשמרה בהצלחה')
        } catch (error) {
            console.error('Save trip error:', error)

            setSaveError(
                error?.message ||
                'אירעה שגיאה בשמירת הנסיעה'
            )
        } finally {
            setSaveLoading(false)
        }
    }

    function renderRouteStep() {
        const step = steps[0]

        return (
            <StepPanel
                step={step}
                stepIndex={0}
            >
                <DrivingRoute
                    origin={form.origin}
                    destination={form.destination}
                    stops={form.stops}
                    onOriginChange={updateOrigin}
                    onDestinationChange={
                        updateDestination
                    }
                    onStopsChange={updateStops}
                />
            </StepPanel>
        )
    }

    function renderTripDetailsStep() {
        const step = steps[1]

        return (
            <StepPanel
                step={step}
                stepIndex={1}
            >
                <div className={styles.formCardFields}>
                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}
                            htmlFor="distanceKm"
                        >
                            מרחק בקילומטרים
                        </label>

                        <div
                            className={styles.inputWrapper}
                        >
                            <Route
                                className={styles.inputIcon}
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />

                            <input
                                className={styles.formControl}
                                id="distanceKm"
                                name="distanceKm"
                                type="number"
                                min="0.1"
                                step="0.1"
                                inputMode="decimal"
                                placeholder="לדוגמה: 45"
                                value={form.distanceKm}
                                onChange={handleChange}
                            />

                            <span className={styles.inputSuffix}  >
                                ק״מ
                            </span>
                        </div>
                    </div>

                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}
                            htmlFor="duration"
                        >
                            משך זמן הנסיעה
                        </label>

                        <div
                            className={styles.inputWrapper}
                        >
                            <Clock3
                                className={styles.inputIcon}
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />

                            <input
                                className={styles.formControl}
                                id="duration"
                                name="duration"
                                type="number"
                                min="0.1"
                                step="0.1"
                                inputMode="decimal"
                                placeholder="לדוגמה: 5"
                                value={form.duration}
                                onChange={handleChange}
                            />

                            <span className={styles.inputSuffix}>
                                שעות
                            </span>
                        </div>

                        <div className={styles.formField}>
                            <label
                                className={styles.formLabel}
                                htmlFor="vehicleType"
                            >
                                סוג רכב
                            </label>

                            <div className={styles.inputWrapper}  >
                                <CarFront
                                    className={
                                        styles.inputIcon
                                    }
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <select
                                    className={`
                                    ${styles.formControl}
                                    ${styles.formSelect}
                                `}
                                    id="vehicleType"
                                    name="vehicleType"
                                    value={form.vehicleType}
                                    onChange={handleChange}
                                >
                                    <option value="regular">
                                        רכב רגיל
                                    </option>

                                    <option value="large">
                                        רכב גדול
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </StepPanel>
        )
    }

    function renderDriverPaymentStep() {
        const step = steps[2]

        return (
            <StepPanel
                step={step}
                stepIndex={2}
            >
                <DriverPayment
                    form={form}
                    onChange={handleChange}
                />
            </StepPanel>
        )
    }

    function renderStepContent() {
        switch (activeStep) {
            case 0:
                return renderRouteStep()

            case 1:
                return renderTripDetailsStep()

            case 2:
                return renderDriverPaymentStep()

            default:
                return null
        }
    }

    return (
        <main
            className={styles.pricingPage}
            dir="rtl"
        >
            <div className={styles.pricingContainer}>
                <form
                    className={styles.pricingForm}
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className={styles.stepBarDiv}>
                        <nav
                            className={styles.stepsBar}
                            aria-label="שלבי תמחור הנסיעה"
                        >
                            {steps.map((step, index) => {
                                const isActive = activeStep === index
                                const isCompleted = activeStep > index

                                const stepClassName = [
                                    styles.stepTab,
                                    isActive ? styles.stepTabActive : '',
                                    isCompleted ? styles.stepTabCompleted : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')

                                return (
                                    <button
                                        className={
                                            stepClassName
                                        }
                                        type="button"
                                        key={step.id}
                                        onClick={() =>
                                            goToStep(index)
                                        }
                                        aria-current={
                                            isActive
                                                ? 'step'
                                                : undefined
                                        }
                                    >
                                        <span
                                            className={
                                                styles.stepText
                                            }
                                        >
                                            {step.title}
                                        </span>

                                        <span
                                            className={
                                                styles.stepMobileTitle
                                            }
                                        >
                                            {step.shortTitle}
                                        </span>
                                    </button>
                                )
                            })}
                        </nav>

                        <div
                            className={
                                styles.progressTrack
                            }
                        >
                            <span
                                className={
                                    styles.progressValue
                                }
                                style={{
                                    width: `${((activeStep + 1) /
                                        steps.length) *
                                        100
                                        }%`,
                                }}
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div
                            className={styles.inlineError}
                            role="alert"
                        >
                            <CircleAlert
                                className={
                                    styles.messageIcon
                                }
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <BackgroundSection
                        className={styles.stepContent}
                    >
                        {renderStepContent()}
                    </BackgroundSection>

                    <div
                        className={styles.stepActions}
                    >
                        <button
                            className={
                                styles.previousButton
                            }
                            type="button"
                            onClick={goToPreviousStep}
                            disabled={isFirstStep}
                        >
                            <ChevronRight
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <span>הקודם</span>
                        </button>

                        <span
                            className={styles.stepCounter}
                        >
                            שלב {activeStep + 1} מתוך{' '}
                            {steps.length}
                        </span>

                        {!isLastStep ? (
                            <button
                                key={'next-button-key'}
                                className={styles.nextButton}
                                type="button"
                                onClick={goToNextStep}
                            >
                                <span>הבא</span>
                                <ChevronLeft strokeWidth={2} aria-hidden="true" />
                            </button>
                        ) : (
                            <button
                                key={'submit-button-key'}
                                className={styles.submitButton}
                                type="submit"
                            >
                                <Calculator
                                    className={styles.buttonIcon}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <span>חשב מחיר</span>
                            </button>
                        )}
                    </div>
                </form>

                {price !== null && (
                    <section
                        className={styles.priceResult}
                    >
                        <div
                            className={
                                styles.resultDecoration
                            }
                        >
                            <span
                                className={`
                                    ${styles.resultRing}
                                    ${styles.resultRingOne}
                                `}
                            />

                            <span
                                className={`
                                    ${styles.resultRing}
                                    ${styles.resultRingTwo}
                                `}
                            />
                        </div>

                        <div
                            className={
                                styles.resultIconWrapper
                            }
                        >
                            <BadgeCheck
                                className={
                                    styles.resultIcon
                                }
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        <div
                            className={
                                styles.resultContent
                            }
                        >
                            <span
                                className={
                                    styles.resultLabel
                                }
                            >
                                המחיר המחושב
                            </span>

                            <h2
                                className={
                                    styles.resultTitle
                                }
                            >
                                מחיר הנסיעה
                            </h2>

                            <strong
                                className={
                                    styles.resultPrice
                                }
                            >
                                ₪{price.toFixed(2)}
                            </strong>

                            <p
                                className={
                                    styles.resultDescription
                                }
                            >
                                המחיר חושב לפי המרחק
                                וסוג הרכב שבחרת.
                            </p>
                        </div>
                    </section>
                )}

                {price !== null && (
                    <div
                        className={styles.saveTripArea}
                    >
                        <button
                            type="button"
                            onClick={handleSaveTrip}
                            disabled={saveLoading}
                        >
                            {saveLoading
                                ? 'שומר נסיעה...'
                                : 'שמירת נסיעה'}
                        </button>

                        {saveMessage && (
                            <p
                                className={
                                    styles.saveSuccess
                                }
                            >
                                {saveMessage}
                            </p>
                        )}

                        {saveError && (
                            <p
                                className={
                                    styles.saveError
                                }
                            >
                                {saveError}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}

export default PricingPage