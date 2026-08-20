import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import {
    createInbox,
    getAllInboxes,
    getUserInboxes,
} from '../../services/inboxService'

import Popup from '../../components/popup/Popup'
import { Sparkles } from 'lucide-react'
import './InboxPage.css'
import InboxForm from './components/inbox_form'
import InboxItem from './components/inbox_item'

function InboxPage() {
    const { user, isAdmin } = useAuth()

    const [inboxes, setInboxes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [isAddPopupOpen, setIsAddPopupOpen] =
        useState(false)

    useEffect(() => {
        if (!user?.id) {
            return
        }

        loadInboxes()
    }, [user?.id])

    const loadInboxes = async () => {
        try {
            setLoading(true)
            setError('')

            const data = isAdmin ? await getAllInboxes() : await getUserInboxes(user.id)

            setInboxes(data)
        } catch (error) {
            console.error(
                'Error loading inboxes:',
                error
            )

            setError(
                'לא הצלחנו לטעון את הפניות'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleCreateInbox = async ({
        title,
        message,
    }) => {
        const newInbox = await createInbox(
            user.id,
            title,
            message
        )

        setInboxes((current) => [
            newInbox,
            ...current,
        ])

        setIsAddPopupOpen(false)
    }

    return (
        <div className="inbox-page">
            <div className="inbox-container">

                {!isAdmin && <button
                    type="button"
                    className="add-inbox-button"
                    onClick={() => setIsAddPopupOpen(true)}
                >
                    <Plus size={18} strokeWidth={2.2} />
                    <span>הוספת פנייה</span>
                </button>}

                {error && (
                    <div className="inbox-error">
                        {error}
                    </div>
                )}

                <section className="inboxes-section">
                    <div className="inboxes-section-header">
                        <div>
                            <h2>{isAdmin ? "פניות לקוח" : "הפניות שלי"}</h2>
                            <div className='inboxes-section-span'>
                                <Sparkles size={15} />
                                <p>כל הפניות במקום אחד</p>
                            </div>
                        </div>

                        <span className="inboxes-count">
                            סך פניות {inboxes.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="inboxes-empty">
                            טוען פניות...
                        </div>
                    ) : inboxes.length === 0 ? (
                        <div className="inboxes-empty">
                            <div className="inboxes-empty-icon">
                                ✉
                            </div>

                            <h3>
                                אין עדיין פניות
                            </h3>

                            <p>
                                לחצי על "הוספת פנייה"
                                כדי לפתוח את הפנייה
                                הראשונה שלך
                            </p>
                        </div>
                    ) : (
                        <div className="inboxes-list">
                            {inboxes.map((inbox) => (
                                <InboxItem key={inbox.id} inbox={inbox} refreshInboxes={loadInboxes} />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <Popup
                isOpen={isAddPopupOpen}
                onClose={() => setIsAddPopupOpen(false)}
            >
                <InboxForm
                    onSubmit={handleCreateInbox}
                    onCancel={() => setIsAddPopupOpen(false)}
                />
            </Popup>
        </div>
    )
}

export default InboxPage