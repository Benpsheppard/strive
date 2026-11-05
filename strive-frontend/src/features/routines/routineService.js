// routineService.js

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL + '/api/routines/'
const CACHE_KEY = 'Strive:routines'

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

// The last list fetched is kept on the device (per user) so routines can still be started
// with no signal in the gym
export const saveRoutineCache = (userId, routines) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, routines })) } catch { /* storage unavailable */ }
}

export const readRoutineCache = (userId) => {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
        return cached && cached.userId === userId && Array.isArray(cached.routines) ? cached.routines : null
    } catch {
        return null
    }
}

export const clearRoutineCache = () => {
    try { localStorage.removeItem(CACHE_KEY) } catch { /* nothing to clear */ }
}

const getRoutines = async (token, userId) => {
    const response = await axios.get(API_URL, authHeader(token))
    saveRoutineCache(userId, response.data)
    return response.data
}

const createRoutine = async (data, token) => (await axios.post(API_URL, data, authHeader(token))).data

const updateRoutine = async (id, data, token) => (await axios.put(API_URL + id, data, authHeader(token))).data

const deleteRoutine = async (id, token) => (await axios.delete(API_URL + id, authHeader(token))).data

const routineService = { getRoutines, createRoutine, updateRoutine, deleteRoutine }

export default routineService
