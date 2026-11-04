// PendingBanner.jsx
// Shows workouts that are waiting to upload, with a way to try again now

import { useSelector } from 'react-redux'
import { usePendingCount } from '../../hooks/useSyncPendingWorkouts.js'
import Button from '../ui/Button.jsx'

const PendingBanner = ({ onSync }) => {
    const { user } = useSelector((state) => state.auth)
    const count = usePendingCount(user?._id)

    if (count === 0) return null

    return (
        <div role="status" className="mb-4 flex flex-col gap-3 rounded-xl border border-warning/50 bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
                <span className="font-semibold text-fg">{count} {count === 1 ? 'workout is' : 'workouts are'} waiting to upload.</span>{' '}
                {navigator.onLine ? 'Trying again shortly.' : "They'll upload when you're back online."}
            </p>
            <Button size="sm" variant="secondary" onClick={onSync}>Try now</Button>
        </div>
    )
}

export default PendingBanner
