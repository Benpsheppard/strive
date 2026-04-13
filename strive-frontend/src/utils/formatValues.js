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
    if (value == undefined) {
        return 0
    }
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

export const formatWorkoutStartTime = (createdAt, duration) => {
    const startTime = new Date(new Date(createdAt).getTime() - duration * 60000);

    const now = new Date();

    const isToday =
        startTime.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        startTime.toDateString() === yesterday.toDateString();

    if (isToday) {
        return `Today, ${startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }

    if (isYesterday) {
        return `Yesterday, ${startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }

    return startTime.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}