import {
    Clock3,
    Percent,
    WalletCards,
} from 'lucide-react'

import './driver_payment.css'

function DriverPayment({
    form,
    onChange,
}) {
    const isPercentage = form.driverPaymentType === 'percentage'

    function handlePaymentTypeChange() {
        onChange({
            target: {
                name: 'driverPaymentType',
                value: isPercentage
                    ? 'hourly'
                    : 'percentage',
            },
        })
    }

    return (
        <div className="driverPayment">
            <div className="driverPaymentSwitchArea" onClick={handlePaymentTypeChange}>
                <div
                    className={`driverPaymentSwitchLabel ${isPercentage
                        ? 'driverPaymentSwitchLabelActive'
                        : ''
                        }`}
                >
                    <Percent
                        className="driverPaymentSwitchIcon"
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>אחוזים</span>
                </div>

                <div
                    className={`driverPaymentSwitchLabel ${!isPercentage
                        ? 'driverPaymentSwitchLabelActive'
                        : ''
                        }`}
                >
                    <Clock3
                        className="driverPaymentSwitchIcon"
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />

                    <span>מחיר שעתי</span>
                </div>

                <div
                    className={`driverPaymentSwitchThumb ${isPercentage
                        ? 'driverPaymentSwitchThumbRight'
                        : ''
                        }`}
                />
            </div>

            {form.driverPaymentType === 'hourly' && (
                <div className="formField driverPaymentField">
                    <label
                        className="formLabel"
                        htmlFor="driverHourlyRate"
                    >
                        תשלום לנהג לשעה
                    </label>

                    <div className="inputWrapper">
                        <WalletCards
                            className="inputIcon"
                            strokeWidth={1.9}
                            aria-hidden="true"
                        />

                        <input
                            className="formControl"
                            id="driverHourlyRate"
                            name="driverHourlyRate"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="לדוגמה: 70"
                            value={form.driverHourlyRate}
                            onChange={onChange}
                        />

                        <span className="inputSuffix">
                            ₪ לשעה
                        </span>
                    </div>

                    {form.routeDuration &&
                        form.driverHourlyRate && (
                            <p className="fieldCalculationHint">
                                {Number(
                                    form.routeDuration
                                ).toFixed(1)}
                                {' '}
                                שעות × ₪
                                {Number(
                                    form.driverHourlyRate
                                ).toFixed(2)}
                            </p>
                        )}
                </div>
            )}

            {form.driverPaymentType ===
                'percentage' && (
                    <div className="formField driverPaymentField">
                        <label
                            className="formLabel"
                            htmlFor="driverPercentage"
                        >
                            אחוז התשלום לנהג
                        </label>

                        <div className="inputWrapper">
                            <Percent
                                className="inputIcon"
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />

                            <input
                                className="formControl"
                                id="driverPercentage"
                                name="driverPercentage"
                                type="number"
                                min="1"
                                max="100"
                                step="0.1"
                                placeholder="לדוגמה: 30"
                                value={form.driverPercentage}
                                onChange={onChange}
                            />

                            <span className="inputSuffix">
                                %
                            </span>
                        </div>

                        <p className="fieldCalculationHint">
                            התשלום יחושב מתוך המחיר הכולל
                            של הלקוח.
                        </p>
                    </div>
                )}
        </div>
    )
}

export default DriverPayment