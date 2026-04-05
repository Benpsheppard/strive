// dateFormat.js - strive-frontend

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