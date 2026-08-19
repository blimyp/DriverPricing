import { useState } from 'react'
import {
    ChevronDown,
    MessageCircle,
    Send,
} from 'lucide-react'

import { useAuth } from '../../../contexts/AuthContext'
import {
    getInboxMessages,
    sendInboxMessage,
} from '../../../services/inboxService'

import './inbox_item.css'

function InboxItem({ inbox }) {
    const { user } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')

    const [loadingMessages, setLoadingMessages] =
        useState(false)

    const [sending, setSending] =
        useState(false)

    const [error, setError] = useState('')

    const handleToggle = async () => {
        if (isOpen) {
            setIsOpen(false)
            return
        }

        setIsOpen(true)

        // אם כבר הבאנו את ההודעות,
        // אין צורך להביא אותן שוב
        if (messages.length > 0) {
            return
        }

        try {
            setLoadingMessages(true)
            setError('')

            const data =
                await getInboxMessages(inbox.id)

            setMessages(data)
        } catch (error) {
            console.error(
                'Error loading inbox messages:',
                error
            )

            setError(
                'לא הצלחנו לטעון את השיחה'
            )
        } finally {
            setLoadingMessages(false)
        }
    }

    const handleSendMessage = async (event) => {
        event.preventDefault()
        event.stopPropagation()

        const cleanMessage = message.trim()

        if (!cleanMessage || !user?.id) {
            return
        }

        try {
            setSending(true)
            setError('')

            const newMessage =
                await sendInboxMessage(
                    inbox.id,
                    user.id,
                    cleanMessage
                )

            setMessages((current) => [
                ...current,
                newMessage,
            ])

            setMessage('')
        } catch (error) {
            console.error(
                'Error sending inbox message:',
                error
            )

            setError(
                'לא הצלחנו לשלוח את ההודעה'
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <article
            className={`inbox-item-card ${isOpen ? 'open' : ''
                }`}
        >
            <button
                type="button"
                className="inbox-item-summary"
                onClick={handleToggle}
                aria-expanded={isOpen}
            >
                <div className="inbox-item-main">
                    <div className="inbox-item-icon">
                        <MessageCircle
                            size={20}
                            strokeWidth={2}
                        />
                    </div>

                    <div className="inbox-item-info">
                        <h3>
                            {inbox.title}
                        </h3>

                        <p>
                            {formatDate(
                                inbox.created_at
                            )}
                        </p>
                    </div>
                </div>

                <ChevronDown
                    className="inbox-item-chevron"
                    size={20}
                    strokeWidth={2}
                />
            </button>

            {isOpen && (
                <div className="inbox-conversation">
                    <div className="inbox-messages">
                        {loadingMessages ? (
                            <div className="inbox-conversation-status">
                                טוען את השיחה...
                            </div>
                        ) : error && messages.length === 0 ? (
                            <div className="inbox-conversation-error">
                                {error}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="inbox-conversation-status">
                                אין הודעות בפנייה
                            </div>
                        ) : (
                            messages.map((item) => {
                                const isMine =
                                    item.user_id === user.id

                                return (
                                    <div
                                        key={item.id}
                                        className={
                                            `inbox-message-row ${isMine
                                                ? 'mine'
                                                : 'other'
                                            }`
                                        }
                                    >
                                        <div className="inbox-message-bubble">
                                            <p>
                                                {item.message}
                                            </p>

                                            <span>
                                                {formatDate(
                                                    item.created_at
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {error && messages.length > 0 && (
                        <div className="inbox-conversation-error">
                            {error}
                        </div>
                    )}

                    <form
                        className="inbox-reply-form"
                        onSubmit={handleSendMessage}
                    >
                        <textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)

                                e.target.style.height = '40px'
                                e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            placeholder="כתיבת תגובה..."
                            disabled={sending}
                        />

                        <button
                            type="submit"
                            className="inbox-send-button"
                            disabled={sending || !message.trim()}
                        >
                            <Send size={18} strokeWidth={2} />
                        </button>
                    </form>
                </div>
            )}
        </article>
    )
}

function formatDate(date) {
    return new Intl.DateTimeFormat(
        'he-IL',
        {
            dateStyle: 'short',
            timeStyle: 'short',
        }
    ).format(new Date(date))
}

export default InboxItem