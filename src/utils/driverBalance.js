export const DEFAULT_DRIVER_PERCENTAGE = 30

export function getDriverPercentage(driver) {
    return Number(driver?.driver_percentage) > 0
        ? Number(driver.driver_percentage)
        : DEFAULT_DRIVER_PERCENTAGE
}

export function getTripDriverEarning(trip, driverPercentage) {
    const price = Number(trip.calculated_price) || 0

    return price * (driverPercentage / 100)
}

export function calculateDriverBalance(driver, trips, payments) {
    const driverPercentage = getDriverPercentage(driver)

    const startingBalance = Number(driver?.starting_balance) || 0

    const totalEarnings = trips.reduce(
        (sum, trip) => sum + getTripDriverEarning(trip, driverPercentage),
        0
    )

    const totalPaid = payments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
    )

    return startingBalance + totalEarnings - totalPaid
}
