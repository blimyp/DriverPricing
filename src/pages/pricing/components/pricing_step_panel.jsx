function StepPanel({
    stepNumber,
    totalSteps,
    styles,
    children,
    step,
}) {
    return (
        <div
            className={styles.stepPanel}
            key={`${step.id}-step`}
        >
            <div className={styles.stepPanelHeader}>
                <span className={styles.stepPanelIcon}>
                    <step.icon
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span className={styles.stepPanelEyebrow}>
                        שלב {stepNumber} מתוך {totalSteps}
                    </span>

                    <h2 className={styles.stepPanelTitle}>
                        {step.title}
                    </h2>
                </div>
            </div>
            <div className={styles.stepPanelContent}>
                {children}
            </div>
        </div>
    )
}

export default StepPanel