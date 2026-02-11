// authService.js

// Imports
import axios from 'axios'

const API_URL = '/api/users/'

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL, userData)

    if(response.data){
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
}

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData)

    if(response.data){
        localStorage.setItem('Strive:user', JSON.stringify(response.data))
    }

    return response.data
}

// Logout user
const logout = () => {
    localStorage.removeItem('Strive:user')
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
        localStorage.removeItem('Strive:user')
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
const updateWeightPreference = async (useImperial, token) => {
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


// Export functions
const authService = {
    register,
    logout,
    login,
    deleteUser,
    resetUser,
    updateWeightPreference,
    addPoints
}

export default authService