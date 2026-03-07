// formatValues.js

export const kgToLbs = (kg) => kg * 2.20462
export const lbsToKg = (lbs) => lbs / 2.20462

export const formatWeight = (kg, useImperial) => {
	if (useImperial) {
		return `${formatNumber(kgToLbs(kg), 1)} lbs`
	}
	return `${formatNumber(kg, 1)} kg`        
}

export const parseWeight = (value, useImperial) => {
	const numValue = parseFloat(value)
	if (useImperial) {
		return lbsToKg(numValue)
	}
	return numValue
}

export const getWeightUnit = (useImperial) => {
	return useImperial ? 'lbs' : 'kg'
}

export const formatTime = (mins) => {
	if (mins < 60) {
		return { hours: 0, mins: mins }
	}

	const hours = Math.floor(mins / 60)
	const remainingMins = mins % 60
	
	return { hours, mins: remainingMins }
}

export const formatDuration = (duration) => {
	const { hours, mins } = formatTime(duration || 0)

	if (hours === 0) {
		return `${mins}m`
	}
	if (mins === 0) {
		return `${hours}h`
	}

	return `${hours}h ${mins}m`
}

export const formatNumber = (value, decimals = 0) => {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})
}

export const formatElapsed = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
}