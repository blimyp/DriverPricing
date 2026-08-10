import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BusFront,
    CalendarDays,
    ChevronDown,
    CircleMinus,
    CirclePlus,
    FileText,
    Plus,
    Save,
    WalletCards,
} from 'lucide-react'

import './account_actions.css'
import Popup from '../../../components/popup/popup'

function getTodayDate() {
    return new Date().toISOString().split('T')[0]
}

function AccountActions({
    onSubmit,
    isSaving = false,
}) {
    const navigate = useNavigate()

    const menuRef = useRef(null)

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    const [transactionType, setTransactionType] =
        useState('income')

    const [formData, setFormData] = useState({
        date: getTodayDate(),
        amount: '',
        description: '',
    })

    const [formError, setFormError] = useState('')

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [])

    function openTransactionPopup(type) {
        setTransactionType(type)
        setFormError('')

        setFormData({
            date: getTodayDate(),
            amount: '',
            description: '',
        })

        setIsMenuOpen(false)
        setIsPopupOpen(true)
    }

    function handleAddTrip() {
        setIsMenuOpen(false)
        navigate('/pricing')
    }

    function handleInputChange(event) {
        const { name, value } = event.target

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const amount = Number(formData.amount)

        if (!formData.date) {
            setFormError('יש לבחור תאריך')
            return
        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            setFormError('יש להזין סכום תקין')
            return
        }

        if (!formData.description.trim()) {
            setFormError('יש להזין תיאור')
            return
        }

        setFormError('')

        const transaction = {
            type: transactionType,
            sourceType: 'manual',
            date: formData.date,
            amount,
            action: formData.description.trim(),
        }

        try {
            await onSubmit?.(transaction)

            setIsPopupOpen(false)

            setFormData({
                date: getTodayDate(),
                amount: '',
                description: '',
            })
        } catch (error) {
            console.error(
                'Failed to save transaction:',
                error
            )

            setFormError(
                error.message ||
                'לא ניתן לשמור את הפעולה'
            )
        }
    }

    const isIncome =
        transactionType === 'income'

    return (
        <>
            <div
                className="accountActions"
                ref={menuRef}
            >
                <button
                    className={`accountActionsButton ${isMenuOpen
                        ? 'accountActionsButtonOpen'
                        : ''
                        }`}
                    type="button"
                    onClick={() =>
                        setIsMenuOpen(
                            (currentValue) =>
                                !currentValue
                        )
                    }
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                >
                    <span className="accountActionsButtonIcon">
                        <Plus
                            size={21}
                            strokeWidth={2.5}
                            aria-hidden="true"
                        />
                    </span>

                    <span>הוספת פעולה</span>

                    <ChevronDown
                        className="accountActionsChevron"
                        size={18}
                        strokeWidth={2.2}
                        aria-hidden="true"
                    />
                </button>

                {isMenuOpen && (
                    <div
                        className="accountActionsMenu"
                        role="menu"
                    >
                        <button
                            className="accountActionsMenuItem accountActionsTrip"
                            type="button"
                            role="menuitem"
                            onClick={handleAddTrip}
                        >
                            <span className="accountActionsMenuIcon">
                                <BusFront size={21} strokeWidth={2} />
                            </span>

                            <span className="accountActionsMenuText">
                                <strong>
                                    הוספת נסיעה
                                </strong>
                            </span>
                        </button>

                        <button
                            className="accountActionsMenuItem accountActionsIncome"
                            type="button"
                            role="menuitem"
                            onClick={() =>
                                openTransactionPopup('income')
                            }
                        >
                            <span className="accountActionsMenuIcon">
                                <CirclePlus size={21} strokeWidth={2} />
                            </span>

                            <span className="accountActionsMenuText">
                                <strong>
                                    הוספת הכנסה
                                </strong>
                            </span>
                        </button>

                        <button
                            className="accountActionsMenuItem accountActionsExpense"
                            type="button"
                            role="menuitem"
                            onClick={() =>
                                openTransactionPopup('expense')
                            }
                        >
                            <span className="accountActionsMenuIcon">
                                <CircleMinus size={21} strokeWidth={2} />
                            </span>

                            <span className="accountActionsMenuText">
                                <strong>
                                    הוספת הוצאה
                                </strong>
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <Popup
                isOpen={isPopupOpen}
                onClose={() => {
                    if (!isSaving) {
                        setIsPopupOpen(false)
                    }
                }}
                closeOnOverlayClick={!isSaving}
            >
                <div
                    className={`transactionPopup ${isIncome
                        ? 'transactionPopupIncome'
                        : 'transactionPopupExpense'
                        }`}
                    dir="rtl"
                >
                    <div className="transactionPopupHeader">
                        <div>
                            <h2>
                                {isIncome ? 'הוספת הכנסה' : 'הוספת הוצאה'}
                            </h2>

                            <p>
                                הזן את פרטי הפעולה לשמירה בעו״ש.
                            </p>
                        </div>
                    </div>

                    <form
                        className="transactionForm"
                        onSubmit={handleSubmit}
                    >
                        <div className="transactionFormField">
                            <label htmlFor="transactionDate">
                                תאריך
                            </label>

                            <div className="transactionInputWrapper">
                                <CalendarDays
                                    size={19}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <input
                                    id="transactionDate"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="transactionFormField">
                            <label htmlFor="transactionAmount">
                                סכום
                            </label>

                            <div className="transactionInputWrapper">
                                <WalletCards
                                    size={19}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <input
                                    id="transactionAmount"
                                    name="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={isSaving}
                                />

                                <span className="transactionCurrency">
                                    ₪
                                </span>
                            </div>
                        </div>

                        <div className="transactionFormField">
                            <label htmlFor="transactionDescription">
                                תיאור
                            </label>

                            <div className="transactionInputWrapper transactionTextareaWrapper">
                                <FileText
                                    size={19}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <textarea
                                    id="transactionDescription"
                                    name="description"
                                    rows="4"
                                    maxLength="250"
                                    placeholder={
                                        isIncome
                                            ? 'לדוגמה: תשלום שהתקבל'
                                            : 'לדוגמה: הוצאות רכב'
                                    }
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                />
                            </div>

                            <span className="transactionCharacterCount">
                                {formData.description.length}
                                /250
                            </span>
                        </div>

                        {formError && (
                            <p
                                className="transactionFormError"
                                role="alert"
                            >
                                {formError}
                            </p>
                        )}

                        <div className="transactionFormActions">
                            <button
                                className="transactionCancelButton"
                                type="button"
                                onClick={() => setIsPopupOpen(false)}
                                disabled={isSaving}
                            >
                                ביטול
                            </button>

                            <button
                                className="transactionSubmitButton"
                                type="submit"
                                disabled={isSaving}
                            >
                                <Save size={18} strokeWidth={2} />

                                {isSaving
                                    ? 'שומר...'
                                    : isIncome
                                        ? 'שמירת הכנסה'
                                        : 'שמירת הוצאה'}
                            </button>
                        </div>
                    </form>
                </div>
            </Popup>
        </>
    )
}

export default AccountActions