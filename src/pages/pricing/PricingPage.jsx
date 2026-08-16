import { useState } from 'react'
import {
    Calculator,
    CircleAlert,
    Clock3,
    MapPinned,
    WalletCards,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import styles from './PricingPage.module.css'

import BackgroundSection from '../../components/background_section/background_section'
import DrivingRoute from './components/driving_route/driving_route'
import DriverPayment from './components/driver_payment/driver_payment'
import StepPanel from './components/pricing_step_panel'
import DrivingDetails from './components/driving_details/driving_details'
import PriceResult from './components/price_result/price_result'
import Popup from '../../components/popup/popup'
import { getRoute } from '../../services/openRouteService'

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
    routeDuration: '',
    plannedDuration: '',
    vehicleType: 'van',

    driverPaymentType: 'hourly',
    driverHourlyRate: '',
    driverPercentage: '',
}

function PricingPage() {
    const [form, setForm] = useState(initialForm)
    const [activeStep, setActiveStep] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    const isFirstStep = activeStep === 0
    const isLastStep = activeStep === steps.length - 1

    function clearCalculationState() {
        setErrorMessage('')
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
        const routeDuration = Number(form.routeDuration)
        const plannedDuration = Number(form.plannedDuration)

        if (!Number.isFinite(distance) || distance <= 0) {
            return 'לא נמצא מרחק תקין למסלול'
        }

        if (!Number.isFinite(routeDuration) || routeDuration <= 0) {
            return 'לא נמצא זמן נסיעה תקין למסלול'
        }

        if (
            !Number.isFinite(plannedDuration) ||
            plannedDuration <= 0
        ) {
            return 'יש להזין שעות נסיעה מתוכננות'
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

    async function goToNextStep() {
        if (!validateStep(activeStep)) {
            return
        }

        // כשעוברים משלב המסלול לשלב פרטי הנסיעה
        if (activeStep === 0) {
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

    function handleSubmit(event) {
        event.preventDefault()

        if (!validateAllSteps()) {
            return
        }

        setShowPriceModal(true)
        setErrorMessage('')
    }

    function renderRouteStep() {
        const step = steps[0]

        return (
            <StepPanel
                step={step}
                styles={styles}
                stepNumber={1}
                totalSteps={steps.length}
            >
                <DrivingRoute
                    origin={form.origin}
                    destination={form.destination}
                    stops={form.stops}
                    onOriginChange={updateOrigin}
                    onDestinationChange={updateDestination}
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
                styles={styles}
                stepNumber={2}
                totalSteps={steps.length}
            >
                <DrivingDetails styles={styles} form={form} handleChange={handleChange} />
            </StepPanel>
        )
    }

    function renderDriverPaymentStep() {
        const step = steps[2]

        return (
            <StepPanel
                step={step}
                styles={styles}
                stepNumber={3}
                totalSteps={steps.length}
            >
                <DriverPayment form={form} onChange={handleChange} />
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
                                    className={stepClassName}
                                    type="button"
                                    key={step.id}
                                    onClick={() =>
                                        goToStep(index)
                                    }
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    <span className={styles.stepText}>
                                        {step.title}
                                    </span>

                                    <span className={styles.stepMobileTitle}>
                                        {step.shortTitle}
                                    </span>
                                </button>
                            )
                        })}
                    </nav>

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

                    <BackgroundSection className={styles.stepContent} withMovingLines={false}>
                        {renderStepContent()}
                    </BackgroundSection>

                    <div className={styles.stepActions}>
                        <button
                            className={styles.previousButton}
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

                        {!isLastStep ? (
                            <button
                                className={styles.nextButton}
                                type="button"
                                onClick={goToNextStep}
                                disabled={isLoadingRoute}
                            >
                                <span>{isLoadingRoute ? 'מחשב מסלול...' : 'הבא'}</span>
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

                <Popup
                    isOpen={showPriceModal}
                    onClose={() => setShowPriceModal(false)}
                >
                    <PriceResult styles={styles} form={form} />
                </Popup>

            </div>
        </main>
    )
}

export default PricingPage