export function pad(number) {
    return String(number).padStart(2, '0')
}

// מועד הנסיעה נשמר בפורמט של שדה תאריך ושעה מקומי, כדי שהחישוב לא ישתנה
export function toStartTimeValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
