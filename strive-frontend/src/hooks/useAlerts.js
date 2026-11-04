// useAlerts.js
// App-specific confirmations and notices, built on the shared ConfirmProvider.
// Confirmations resolve to true/false; notices resolve when dismissed.

import { useMemo } from 'react'
import { useConfirm } from '../components/ui/confirmContext.js'

export const useAlerts = () => {
    const confirm = useConfirm()

    return useMemo(() => ({
        // Notices
        shieldUsed: () => confirm({
            title: 'Shield used',
            message: 'You missed your target last week, but your shield protected your streak.',
            confirmLabel: 'Phew!',
            hideCancel: true
        }),
        streakBroken: (oldStreak) => confirm({
            title: 'Streak lost',
            message: `Your ${oldStreak} week streak has been reset. Time to start again!`,
            confirmLabel: "Let's go again",
            hideCancel: true
        }),
        momentumDropped: (newMomentum) => confirm({
            title: 'Momentum dropped',
            message: `Your momentum has decreased to ${newMomentum}. Time to get back on track.`,
            confirmLabel: 'Got it',
            hideCancel: true
        }),

        // Confirmations
        cancelWorkout: () => confirm({
            title: 'Cancel this workout?',
            message: 'Everything you have logged in this workout will be discarded.',
            confirmLabel: 'Discard workout',
            cancelLabel: 'Keep training',
            tone: 'danger'
        }),
        endWorkout: (setCount, minutes) => confirm({
            title: 'End workout?',
            message: setCount < 3 || minutes < 5
                ? 'Workouts need at least 3 sets and 5 minutes to earn Strive Points. This one is saved either way, but it will not earn any yet.'
                : 'Finish and save this workout?',
            confirmLabel: 'End workout',
            cancelLabel: 'Keep training'
        }),
        changeExercise: (setCount) => confirm({
            title: 'Change exercise?',
            message: `You have ${setCount} set${setCount === 1 ? '' : 's'} logged for this exercise. Changing it will delete them.`,
            confirmLabel: 'Change exercise',
            cancelLabel: 'Keep current',
            tone: 'danger'
        }),
        removeExercise: (name) => confirm({
            title: `Remove ${name}?`,
            message: 'All sets logged for this exercise in this workout will be removed.',
            confirmLabel: 'Remove',
            tone: 'danger'
        }),
        deleteWorkout: () => confirm({
            title: 'Delete workout?',
            message: 'You will lose this workout and any Strive Points earned from it.',
            confirmLabel: 'Delete',
            tone: 'danger'
        }),
        logout: () => confirm({
            title: 'Log out?',
            message: 'Are you sure you want to log out?',
            confirmLabel: 'Log out'
        }),
        deleteAccount: () => confirm({
            title: 'Delete account?',
            message: 'This permanently deletes your account, workouts and all data. It cannot be undone.',
            confirmLabel: 'Delete account',
            requireText: 'DELETE',
            tone: 'danger'
        }),
        resetAccount: () => confirm({
            title: 'Reset account?',
            message: 'This permanently deletes your workout data but keeps your profile. It cannot be undone.',
            confirmLabel: 'Reset data',
            requireText: 'RESET',
            tone: 'danger'
        })
    }), [confirm])
}
