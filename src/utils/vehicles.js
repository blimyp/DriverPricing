export const VEHICLE_TYPE_LABELS = {
    bus: 'אוטובוס',
    minibus: 'מיניבוס',
    van: 'טנדר',
}

export function getVehicleAge(manufactureYear) {
    const year = Number(manufactureYear)

    if (!year) return null

    return Math.max(new Date().getFullYear() - year, 0)
}

// קבוצת גיל לחישוב פחת ובלאי: 1-3 שנים, 4-6 שנים, 7 ומעלה
export function getVehicleAgeGroup(manufactureYear) {
    const age = getVehicleAge(manufactureYear)

    if (age === null) return null
    if (age <= 3) return 'new'
    if (age <= 6) return 'mid'

    return 'old'
}

export const AGE_GROUP_LABELS = {
    new: '1–3 שנים',
    mid: '4–6 שנים',
    old: '7+ שנים',
}

export function getVehicleDisplayName(vehicle) {
    const typeLabel = VEHICLE_TYPE_LABELS[vehicle.vehicle_type] || vehicle.vehicle_type

    return vehicle.name
        ? `${vehicle.name} (${typeLabel}, ${vehicle.manufacture_year})`
        : `${typeLabel} ${vehicle.manufacture_year}`
}
