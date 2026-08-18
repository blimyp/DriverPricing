import { useEffect, useState } from 'react'
import { getVehiclePrices } from '../../services/vehiclePricesService'
import './PricesSettingsPage.css'

function PricesSettingsPage() {
    const [prices, setPrices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadPrices = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await getVehiclePrices()

                setPrices(data)
            } catch (err) {
                console.error('Error loading prices:', err)
                setError('לא הצלחנו לטעון את נתוני המחירים')
            } finally {
                setLoading(false)
            }
        }

        loadPrices()
    }, [])

    if (loading) {
        return (
            <div className="prices_settings_page">
                <div className="prices-loading">
                    טוען נתוני מחירים...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="prices_settings_page">
                <div className="prices-error">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="prices_settings_page">
            <div className="prices-settings-container">

                <div className="prices-settings-header">
                    <div>
                        <h1>הגדרות מחירים</h1>
                        <p>
                            ניהול מחירי הבסיס וצריכת הדלק לפי סוג רכב
                        </p>
                    </div>
                </div>

                {prices.length === 0 ? (
                    <div className="prices-empty">
                        לא נמצאו נתוני מחירים
                    </div>
                ) : (
                    <div className="prices-table-wrapper">
                        <table className="prices-table">
                            <thead>
                                <tr>
                                    <th>סוג רכב</th>
                                    <th>כמות ק״מ לליטר</th>
                                </tr>
                            </thead>

                            <tbody>
                                {prices.map((price) => (
                                    <tr key={price.vehicle_type}>
                                        <td>
                                            <span className="vehicle-type">
                                                {getVehicleLabel(
                                                    price.vehicle_type
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            {price.km_cnt_in_liter}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    )
}

const getVehicleLabel = (vehicleType) => {
    const labels = {
        bus: 'אוטובוס',
        minibus: 'מיניבוס',
        van: 'וואן',
    }

    return labels[vehicleType] || vehicleType
}

export default PricesSettingsPage