import { Pencil } from 'lucide-react'

function UserAnswerBubble({ styles, text, onClick }) {
    return (
        <div className={`${styles.chatMessageRow} ${styles.chatMessageUser}`}>
            <button
                className={styles.userAnswerBubble}
                type="button"
                onClick={onClick}
                title="לחיצה לעריכה"
            >
                <span>{text}</span>
                <Pencil
                    className={styles.userAnswerEditIcon}
                    strokeWidth={2}
                    aria-hidden="true"
                />
            </button>
        </div>
    )
}

export default UserAnswerBubble
