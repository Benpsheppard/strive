// dateFormat.js - strive-backend version

export function getWeekNumber(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)

    d.setDate(d.getDate() + 4 - (d.getDay() || 7))

    const yearStart = new Date(d.getFullYear(), 0, 1)

    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

export function getStartOfWeek(date) {
	const d = new Date(date)

	const day = d.getDay()

	const diff = d.getDate() - day + (day === 0 ? -6 : 1)

	d.setDate(diff)
	d.setHours(0, 0, 0, 0)

	return d
}

export function getEndOfWeek(date) {
  const start = getStartOfWeek(date)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return end
}

const now = new Date()
console.log(`Current week number for today: ${getWeekNumber(now)}`)
console.log(`Start of the week: ${getStartOfWeek(now)}`)
console.log(`End of the week: ${getEndOfWeek(now)}`)