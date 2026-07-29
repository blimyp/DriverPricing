function StepPanelHeader({
    icon: Icon,
    stepNumber,
    totalSteps,
    title,
    styles,
}) {
    return (
        <div className={styles.stepPanelHeader}>
            <span className={styles.stepPanelIcon}>
                <Icon
                    strokeWidth={1.9}
                    aria-hidden="true"
                />
            </span>

            <div>
                <span className={styles.stepPanelEyebrow}>
                    שלב {stepNumber} מתוך {totalSteps}
                </span>

                <h2 className={styles.stepPanelTitle}>
                    {title}
                </h2>
            </div>
        </div>
    )
}

export default StepPanelHeader