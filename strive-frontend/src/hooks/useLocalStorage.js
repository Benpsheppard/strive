// Imports
import { useState, useEffect } from 'react'

// Local Storage helper
export function useLocalStorage(key, initialValue) {
	const [value, setValue] = useState(() => {
		try {
			const jsonValue = localStorage.getItem(key)
			return jsonValue != null ? JSON.parse(jsonValue) : initialValue
		} catch {
			return initialValue
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch (err) {
			console.error(`Failed to read/write localStorage key "${key}"`, err)
		}
	}, [key, value])

	return [value, setValue]
}

// Clear Local Storage
export function clearLocalStorage() {
	localStorage.removeItem('newWorkout_title')
	localStorage.removeItem('newWorkout_exercises')
	localStorage.removeItem('newWorkout_currentExercise')
	localStorage.removeItem('newWorkout_currentSet')
	localStorage.removeItem('newWorkout_started')
	localStorage.removeItem('newWorkout_startTime')
	localStorage.removeItem('newWorkout_restTimer')
	localStorage.removeItem('newWorkout_setHistory')
	localStorage.removeItem('restTimerEnd')
}