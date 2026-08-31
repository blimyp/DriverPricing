import { Sparkles } from 'lucide-react'
import useTypewriter from '../../hooks/useTypewriter'

function ChatMessage({ styles, text, alreadySeen = false, onDone }) {
    const { visibleText, isDone } = useTypewriter(text, {
        skip: alreadySeen,
        onDone,
    })

    return (
        <div className={`${styles.chatMessageRow} ${styles.chatMessageAssistant}`}>
            <span className={styles.chatAvatar} aria-hidden="true">
                <Sparkles strokeWidth={1.9} />
            </span>

            <div className={styles.assistantBubble}>
                <p>
                    {visibleText}
                    {!isDone && (
                        <span className={styles.typingCursor} aria-hidden="true" />
                    )}
                </p>
            </div>
        </div>
    )
}

export default ChatMessage
