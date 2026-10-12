import { useEffect, useRef, useState } from 'react'
import ChatMessage from './ChatMessage'

const PAUSE_BETWEEN_MESSAGES_MS = 400

// מציג כמה הודעות ברצף, כל הודעה מתחילה להיכתב אחרי שהקודמת הסתיימה
function ChatMessageGroup({ styles, texts, alreadySeen = false, onDone }) {
    const [typedCount, setTypedCount] = useState(1)
    const shownCount = alreadySeen ? texts.length : typedCount
    const timeoutRef = useRef(null)

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    function handleMessageDone(index) {
        if (index < texts.length - 1) {
            timeoutRef.current = setTimeout(
                () => setTypedCount(index + 2),
                PAUSE_BETWEEN_MESSAGES_MS
            )
            return
        }

        onDone?.()
    }

    return texts.slice(0, shownCount).map((text, index) => (
        <ChatMessage
            key={index}
            styles={styles}
            text={text}
            alreadySeen={alreadySeen || index < shownCount - 1}
            onDone={() => handleMessageDone(index)}
        />
    ))
}

export default ChatMessageGroup
