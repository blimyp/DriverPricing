import { useEffect, useState } from 'react'
import { Bus, Pencil, Plus, Trash2 } from 'lucide-react'

import Popup from '../../../components/popup/popup'
import {
    addVehicle,
    deleteVehicle,
    getVehicles,
    updateVehicle,
} from '../../../services/vehiclesService'
import {
    VEHICLE_TYPE_LABELS,
    getVehicleAge,
} from '../../../utils/vehicles'
import VehicleForm from './vehicle_form'

const formatNumber = (value) =>
    Number(value || 0).toLocaleString('he-IL')

function VehiclesSection({ userId }) {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // null = סגור, 'new' = הוספה, אובייקט רכב = עריכה
    const [formVehicle, setFormVehicle] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        if (!userId) return

        let isMounted = true

        getVehicles(userId)
            .then((data) => {
                if (isMounted) setVehicles(data)
            })
            .catch((err) => {
                console.error('Error loading vehicles:', err)

                if (isMounted) setError('לא הצלחנו לטעון את רשימת הרכבים')
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [userId])

    const closeForm = () => setFormVehicle(null)

    const handleSubmit = async (payload) => {
        if (formVehicle === 'new') {
            const created = await addVehicle(userId, payload)

            setVehicles((current) => [...current, created])
        } else {
            const updated = await updateVehicle(formVehicle.id, payload)

            setVehicles((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            )
        }

        closeForm()
    }

    const handleDelete = async (vehicle) => {
        const label =
            vehicle.name || VEHICLE_TYPE_LABELS[vehicle.vehicle_type]

        if (!window.confirm(`למחוק את הרכב "${label}"?`)) return

        try {
            setDeletingId(vehicle.id)

            await deleteVehicle(vehicle.id)

            setVehicles((current) =>
                current.filter((item) => item.id !== vehicle.id)
            )
        } catch (err) {
            console.error('Error deleting vehicle:', err)
            alert('לא הצלחנו למחוק את הרכב')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <section className="prices-section">
            <div className="prices-section-header">
                <div className="prices-section-title">
                    <span className="prices-section-icon">
                        <Bus size={18} />
                    </span>
                    <div>
                        <h2>הרכבים שלי</h2>
                        <p>מהם מחושבת העלות הקבועה של כל נסיעה</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="prices-add-button"
                    onClick={() => setFormVehicle('new')}
                >
                    <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                    הוספת רכב
                </button>
            </div>

            {loading ? (
                <div className="prices-empty">טוען רכבים...</div>
            ) : error ? (
                <div className="prices-error">{error}</div>
            ) : vehicles.length === 0 ? (
                <div className="prices-empty">
                    עדיין לא הוספת רכבים. לחצי על "הוספת רכב" כדי להתחיל
                </div>
            ) : (
                <div className="vehicles-list">
                    {vehicles.map((vehicle) => {
                        const typeLabel =
                            VEHICLE_TYPE_LABELS[vehicle.vehicle_type] ||
                            vehicle.vehicle_type

                        return (
                            <div className="vehicle-card" key={vehicle.id}>
                                <div className="vehicle-card-main">
                                    <span className="vehicle-card-name">
                                        {vehicle.name || typeLabel}
                                    </span>

                                    <div className="vehicle-card-tags">
                                        <span className="vehicle-tag">
                                            {typeLabel}
                                        </span>
                                        <span className="vehicle-tag">
                                            {vehicle.manufacture_year}
                                            {' · בן '}
                                            {getVehicleAge(
                                                vehicle.manufacture_year
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="vehicle-card-stats">
                                    <div>
                                        <small>מחיר רכישה</small>
                                        <span>
                                            {formatNumber(vehicle.purchase_price)} ₪
                                        </span>
                                    </div>
                                    <div>
                                        <small>ק״מ שנתי</small>
                                        <span>
                                            {formatNumber(
                                                vehicle.annual_km_estimate
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="vehicle-actions">
                                    <button
                                        type="button"
                                        className="setting-icon-button"
                                        onClick={() => setFormVehicle(vehicle)}
                                        aria-label="עריכת רכב"
                                        title="עריכה"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className="setting-icon-button danger"
                                        onClick={() => handleDelete(vehicle)}
                                        disabled={deletingId === vehicle.id}
                                        aria-label="מחיקת רכב"
                                        title="מחיקה"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Popup isOpen={formVehicle !== null} onClose={closeForm}>
                {formVehicle !== null && (
                    <VehicleForm
                        vehicle={formVehicle === 'new' ? null : formVehicle}
                        onSubmit={handleSubmit}
                        onCancel={closeForm}
                    />
                )}
            </Popup>
        </section>
    )
}

export default VehiclesSection
