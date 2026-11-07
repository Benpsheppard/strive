// BadgeTile.jsx
// One achievement in the grid: unlocked, locked, or a masked secret

import BadgeIcon from './BadgeIcon.jsx'
import { cx } from '../../utils/cx.js'

const TIER_LABEL = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', insane: 'Insane' }

const BadgeTile = ({ achievement }) => {
    const { name, description, icon, tier, unlockedAt } = achievement
    const unlocked = Boolean(unlockedAt)

    return (
        <li
            className={cx(
                'flex items-center gap-3 rounded-xl px-3 py-3',
                unlocked ? 'bg-surface-2' : 'bg-bg/60'
            )}
        >
            <BadgeIcon icon={icon} tier={tier} locked={!unlocked} />
            <div className="min-w-0">
                <p className={cx('font-semibold', unlocked ? 'text-fg' : 'text-muted')}>
                    {name}
                    {tier && <span className="ml-2 text-xs font-normal text-muted">{TIER_LABEL[tier]}</span>}
                </p>
                <p className="text-sm text-muted">{description}</p>
                <p className="text-xs text-muted">
                    <span className="sr-only">{unlocked ? 'Unlocked' : 'Locked'}. </span>
                    {unlocked ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : 'Locked'}
                </p>
            </div>
        </li>
    )
}

export default BadgeTile
