// useAchievementEvent.js
// Report something the user did in the app (an easter egg, say) so the server can unlock a
// secret achievement. Fire-and-forget: a failure is never shown, and each event is only sent
// once per page load (the server is safe to repeat anyway).

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { reportAchievementEvent } from '../features/achievements/achievementsSlice.js'

const sent = new Set()

export const useAchievementEvent = () => {
    const dispatch = useDispatch()
    const signedIn = useSelector((state) => Boolean(state.auth.user?.token))

    return useCallback(async (event) => {
        if (!signedIn || sent.has(event)) return
        sent.add(event)

        const result = await dispatch(reportAchievementEvent(event))
        const unlocked = result.payload?.unlocked

        if (reportAchievementEvent.fulfilled.match(result) && unlocked) {
            toast.success(`Achievement unlocked: ${unlocked.name}`)
        } else if (reportAchievementEvent.rejected.match(result)) {
            // Let a later attempt try again
            sent.delete(event)
        }
    }, [dispatch, signedIn])
}

// Test helper: forget which events were sent
export const resetSentEvents = () => sent.clear()
