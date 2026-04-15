// authService.js

// Imports
import axios from 'axios'
import { clearLocalStorage } from '../../hooks/useLocalStorage'

const API_URL = import.meta.env.VITE_API_URL + '/api/users/'

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL, userData)

    if(response.data){
        // Clear any existing workout data from previous user before setting new user
        clearLocalStorage()
        
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
}

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData)

    if(response.data){
        // Clear any existing workout data from previous user before setting new user
        clearLocalStorage()
        
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
}

// Migrate user
const migrate = async (userData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.put(API_URL + `migrate`, userData, config)

    if(response.data){
        // Clear any existing workout data from previous user before setting new user
        clearLocalStorage()
        
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
}

// Logout user
const logout = () => {
    localStorage.removeItem('Strive:user')
    
    // Clear workout-related localStorage to prevent data leakage between users
    clearLocalStorage()
}

// Delete user
const deleteUser = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.delete(API_URL + userId, config)

    if (response.data) {
        // Clear user data and workout data
        clearLocalStorage()
    }

    return response.data
}

// Reset user
const resetUser = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.delete(API_URL + userId + 'reset', config)

    return response.data
}

// Update user weight unit preference
const updateUnitPreference = async (useImperial, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.put(API_URL + 'preference', { useImperial }, config)

    if (response.data) {
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
    }

// Add Strive Points (SP)
const addPoints = async (userId, amount, token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	const response = await axios.post(API_URL + `${userId}/points`, { amount }, config)

	return response.data
}

// Update user profile
const updateProfile = async (profileData, token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	const response = await axios.put(API_URL + `profile`, profileData, config)

	if (response.data) {
		localStorage.setItem('Strive:user', JSON.stringify(response.data))
	}

	return response.data
}

// Update streak
const updateStreak = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.put(API_URL + `${userId}/streak`, {}, config)

    return response.data
}

// Export functions
const authService = {
    register,
    logout,
    login,
    migrate,
    deleteUser,
    resetUser,
    updateUnitPreference,
    addPoints,
	updateProfile,
    updateStreak
}

export default authService