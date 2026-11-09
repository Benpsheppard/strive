// BadgeTile.jsx
// One achievement in the grid: unlocked, locked, or a masked secret

import BadgeIcon from './BadgeIcon.jsx'
import { cx } from '../../utils/cx.js'

const TIER_LABEL = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', insane: 'Insane' }

const fmt = (n) => Number(n).toLocaleString('en-GB')

// Progress towards the next rung of a ladder, or "Completed" once the top rung is unlocked
const LadderProgress = ({ achievement }) => {
    const { current, unlockedAt } = achievement
    // Ladders aim at their next rung; a single achievement aims at itself until unlocked
    const next = achievement.ladder ? achievement.next : (unlockedAt ? null : achievement)
    if (!next) {
        return <p className="mt-1 text-xs font-semibold text-accent">Completed</p>
    }
    if (typeof current !== 'number') return null

    const target = next.threshold
    const pct = Math.min(100, Math.max(0, (current / target) * 100))

    return (
        <div className="mt-2">
            <div
                role="progressbar"
                aria-label={`Progress to ${next.name}`}
                aria-valuemin={0}
                aria-valuemax={target}
                aria-valuenow={Math.min(current, target)}
                className="h-1.5 w-full overflow-hidden rounded-full bg-bg"
            >
                <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
                {fmt(Math.min(current, target))} / {fmt(target)} to {next.name}
            </p>
        </div>
    )
}

const BadgeTile = ({ achievement }) => {
    const { name, description, icon, tier, unlockedAt, threshold } = achievement
    const unlocked = Boolean(unlockedAt)

    return (
        <li
            className={cx(
                'flex items-center gap-3 rounded-xl px-3 py-3',
                unlocked ? 'bg-surface-2' : 'bg-bg/60'
            )}
        >
            <BadgeIcon icon={icon} tier={tier} locked={!unlocked} />
            <div className="min-w-0 flex-1">
                <p className={cx('font-semibold', unlocked ? 'text-fg' : 'text-muted')}>
                    {name}
                    {tier && <span className="ml-2 text-xs font-normal text-muted">{TIER_LABEL[tier]}</span>}
                </p>
                <p className="text-sm text-muted">{description}</p>
                <p className="text-xs text-muted">
                    <span className="sr-only">{unlocked ? 'Unlocked' : 'Locked'}. </span>
                    {unlocked ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : 'Locked'}
                </p>
                {threshold != null && <LadderProgress achievement={achievement} />}
            </div>
        </li>
    )
}

export default BadgeTile
