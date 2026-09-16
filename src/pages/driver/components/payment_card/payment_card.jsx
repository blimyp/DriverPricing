import {
    CalendarDays,
    HandCoins,
} from 'lucide-react'

import './payment_card.css'

function PaymentCard({ payment, index }) {
    function formatAmount(value) {
        const numericValue = Number(value)

        if (!Number.isFinite(numericValue)) {
            return 'לא צוין'
        }

        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numericValue)
    }

    function formatDate(value) {
        if (!value) {
            return 'לא צוין'
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return 'לא צוין'
        }

        return new Intl.DateTimeFormat('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <article
            className="payment-card"
            style={{ '--trip-index': index }}
        >
            <div className="payment-card__icon">
                <HandCoins strokeWidth={2} aria-hidden="true" />
            </div>

            <strong className="payment-card__label">
                {payment.description || 'תשלום התקבל'}
            </strong>

            <span className="payment-card__date">
                <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
                {formatDate(payment.created_at)}
            </span>

            <span className="payment-card__amount">
                {formatAmount(payment.amount)}
            </span>
        </article>
    )
}

export default PaymentCard
