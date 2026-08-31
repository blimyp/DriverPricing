import { Sparkles } from 'lucide-react'

function TypingIndicator({ styles }) {
    return (
        <div className={`${styles.chatMessageRow} ${styles.chatMessageAssistant}`}>
            <span className={styles.chatAvatar} aria-hidden="true">
                <Sparkles strokeWidth={1.9} />
            </span>

            <div className={`${styles.assistantBubble} ${styles.typingIndicatorBubble}`}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
            </div>
        </div>
    )
}

export default TypingIndicator
