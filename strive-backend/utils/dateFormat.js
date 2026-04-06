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

export function getISOWeekString(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getWeeksBetween(fromWeek, toWeek) {
	const toDate = isoWeekToDate(toWeek);
	const fromDate = isoWeekToDate(fromWeek);
	return Math.floor((toDate - fromDate) / (7 * 24 * 60 * 60 * 1000));
}

export function isoWeekToDate(weekStr) {
	const [year, week] = weekStr.split('-W').map(Number);
	const jan4 = new Date(Date.UTC(year, 0, 4));
	const startOfWeek1 = new Date(jan4);
	startOfWeek1.setUTCDate(jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1);
	return new Date(startOfWeek1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
}