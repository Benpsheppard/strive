// useSyncPendingWorkouts.js
// Uploads workouts that were saved on the device while offline. Runs when the app opens, when the
// connection comes back and every minute. The server ignores a workout it already has (same
// clientId), so an upload that succeeded but whose answer was lost is harmless to repeat.

import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createWorkout, getWorkouts } from '../features/workouts/workoutsSlice.js'
import { getPendingWorkouts, removePendingWorkout, countPendingWorkouts, PENDING_CHANGED } from '../utils/pendingWorkouts.js'

const RETRY_EVERY_MS = 60 * 1000

// Number of workouts waiting to upload for the signed-in user (updates as the queue changes)
export const usePendingCount = (userId) => {
    const [count, setCount] = useState(() => (userId ? countPendingWorkouts(userId) : 0))

    useEffect(() => {
        const update = () => setCount(userId ? countPendingWorkouts(userId) : 0)
        update()
        window.addEventListener(PENDING_CHANGED, update)
        window.addEventListener('storage', update)
        return () => {
            window.removeEventListener(PENDING_CHANGED, update)
            window.removeEventListener('storage', update)
        }
    }, [userId])

    return count
}

export const useSyncPendingWorkouts = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const syncing = useRef(false)
    const userId = user?._id

    const sync = useCallback(async () => {
        if (!userId || syncing.current || !navigator.onLine) return
        syncing.current = true

        let uploaded = 0

        try {
            for (const item of getPendingWorkouts(userId)) {
                const result = await dispatch(createWorkout(item.payload))

                if (createWorkout.fulfilled.match(result)) {
                    removePendingWorkout(userId, item.payload.clientId)
                    uploaded += 1
                } else if (result.meta?.retryable) {
                    break // still offline or the server is struggling: try again later
                } else {
                    // The server refused it, so retrying can never work
                    removePendingWorkout(userId, item.payload.clientId)
                    toast.error(`A workout saved on your device could not be uploaded: ${result.payload}`)
                }
            }
        } finally {
            syncing.current = false
        }

        if (uploaded > 0) {
            toast.success(uploaded === 1 ? 'Your offline workout has been uploaded.' : `${uploaded} offline workouts have been uploaded.`)
            dispatch(getWorkouts())
        }
    }, [userId, dispatch])

    useEffect(() => {
        sync()

        const interval = setInterval(sync, RETRY_EVERY_MS)
        window.addEventListener('online', sync)

        return () => {
            clearInterval(interval)
            window.removeEventListener('online', sync)
        }
    }, [sync])

    return sync
}
