// authService.js

// Imports
import axios from 'axios'
import { clearLocalStorage } from '../../hooks/useLocalStorage'
import { clearPendingWorkouts } from '../../utils/pendingWorkouts.js'

const API_URL = import.meta.env.VITE_API_URL + '/api/users/'

// Get up-to-date user info
const getMe = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.get(API_URL + `me`, config)

    return response.data
}

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

// Delete user (members confirm with their password)
const deleteUser = async (userId, token, password) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: { password }
    }

    const response = await axios.delete(API_URL + userId, config)

    if (response.data) {
        // Clear user data and workout data, including any workouts still waiting to upload
        clearLocalStorage()
        clearPendingWorkouts()
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

    const response = await axios.delete(API_URL + userId + '/reset', config)

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

// Check streak broken
const checkIfStreakBroken = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.put(API_URL + `${userId}/streak-broken`, {}, config)

    return response.data
}

// Check streak increased
const checkIfStreakIncreased = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.put(API_URL + `${userId}/streak-increased`, {}, config)

    return response.data
}

// Update momentum
const updateMomentum = async (data, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.put(API_URL + `momentum`, data, config)

    return response.data
}

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

// Password reset and email confirmation (no session needed)
const forgotPassword = async (email) => (await axios.post(API_URL + 'forgot-password', { email })).data
const resetPassword = async (token, password) => (await axios.post(API_URL + 'reset-password', { token, password })).data
const verifyEmail = async (token) => (await axios.post(API_URL + 'verify-email', { token })).data

// Account security (signed in)
const resendVerification = async (token) => (await axios.post(API_URL + 'resend-verification', {}, authHeader(token))).data

const changePassword = async (data, token) => {
    const response = await axios.put(API_URL + 'password', data, authHeader(token))

    // This session continues with a fresh token; every other session is signed out
    if (response.data) localStorage.setItem('Strive:user', JSON.stringify(response.data))
    return response.data
}

const changeEmail = async (data, token) => (await axios.put(API_URL + 'email', data, authHeader(token))).data

// Everything held about the user, as JSON
const exportData = async (token) => (await axios.get(API_URL + 'export', authHeader(token))).data

// Export functions
const authService = {
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    changeEmail,
    exportData,
    getMe,
    register,
    logout,
    login,
    migrate,
    deleteUser,
    resetUser,
    updateUnitPreference,
	updateProfile,
    checkIfStreakBroken,
    checkIfStreakIncreased,
    updateMomentum
}

export default authService