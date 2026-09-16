import { Car, Mail } from 'lucide-react'

import './driver_item.css'

function DriverItem({ driver }) {
    const displayName =
        driver.full_name || driver.email || 'נהג'

    return (
        <article className="driver-item">
            <div className="driver-item-main">
                <div className="driver-item-avatar">
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="driver-item-info">
                    <h3>{displayName}</h3>

                    <p>
                        <Mail size={13} strokeWidth={2} />
                        {driver.email}
                    </p>
                </div>
            </div>

            <span className="driver-item-badge">
                <Car size={14} strokeWidth={2} />
                נהג
            </span>
        </article>
    )
}

export default DriverItem
