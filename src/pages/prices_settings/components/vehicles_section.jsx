import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

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
        <div className="prices-section">
            <div className="prices-section-header">
                <h2>הרכבים שלי</h2>

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
                <div className="prices-table-wrapper">
                    <table className="prices-table vehicles-table">
                        <thead>
                            <tr>
                                <th>רכב</th>
                                <th>סוג</th>
                                <th>שנת ייצור</th>
                                <th>מחיר רכישה</th>
                                <th>ק״מ שנתי</th>
                                <th aria-label="פעולות" />
                            </tr>
                        </thead>

                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td>
                                        <span className="vehicle-type">
                                            {vehicle.name || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        {VEHICLE_TYPE_LABELS[
                                            vehicle.vehicle_type
                                        ] || vehicle.vehicle_type}
                                    </td>
                                    <td>
                                        {vehicle.manufacture_year}
                                        <span className="vehicle-age">
                                            {' '}
                                            (בן{' '}
                                            {getVehicleAge(
                                                vehicle.manufacture_year
                                            )}
                                            )
                                        </span>
                                    </td>
                                    <td>
                                        {formatNumber(vehicle.purchase_price)} ₪
                                    </td>
                                    <td>
                                        {formatNumber(
                                            vehicle.annual_km_estimate
                                        )}
                                    </td>
                                    <td>
                                        <div className="vehicle-actions">
                                            <button
                                                type="button"
                                                className="price-edit-button"
                                                onClick={() =>
                                                    setFormVehicle(vehicle)
                                                }
                                                aria-label="עריכת רכב"
                                                title="עריכה"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                className="price-edit-button vehicle-delete-button"
                                                onClick={() =>
                                                    handleDelete(vehicle)
                                                }
                                                disabled={
                                                    deletingId === vehicle.id
                                                }
                                                aria-label="מחיקת רכב"
                                                title="מחיקה"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </div>
    )
}

export default VehiclesSection
