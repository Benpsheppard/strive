// Achievements.jsx
// Every badge the user can see: all regular achievements, plus any secrets the user has unlocked

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getAchievements } from '../features/achievements/achievementsSlice.js'

import Spinner from '../components/spinners/Spinner.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import Card, { CardTitle } from '../components/ui/Card.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'
import BadgeTile from '../components/achievements/BadgeTile.jsx'

// Show one card per ladder: the highest rung unlocked, or the first rung while none are.
// Rungs arrive lowest first, and a collapsed card keeps the position of its ladder.
// Each ladder card also gets `next`: the first locked rung (null once the ladder is complete).
const collapseLadders = (items) => {
    const shown = []
    const slots = new Map()
    const nexts = new Map()

    for (const a of items) {
        if (!a.ladder) {
            shown.push(a)
            continue
        }
        if (!slots.has(a.ladder)) {
            slots.set(a.ladder, shown.length)
            shown.push(a)
        } else if (a.unlockedAt) {
            shown[slots.get(a.ladder)] = a
        }
        if (!a.unlockedAt && !nexts.has(a.ladder)) nexts.set(a.ladder, a)
    }

    return shown.map(a => a.ladder ? { ...a, next: nexts.get(a.ladder) || null } : a)
}

const SECTIONS = [
    { key: 'achievements', title: 'Achievements', match: a => a.category !== 'secret' },
    { key: 'secret', title: 'Secret', match: a => a.category === 'secret' }
]

const Achievements = () => {
    const dispatch = useDispatch()
    const { achievements, unlocked, total, secrets, isLoading, isError } = useSelector((state) => state.achievements)

    useEffect(() => {
        dispatch(getAchievements())
    }, [dispatch])

    if (isLoading && achievements.length === 0) return <Spinner />

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="Achievements">
                Your
            </PageTitle>

            {isError && achievements.length === 0 ? (
                <Card><p className="text-muted">Your achievements could not be loaded. Try again in a moment.</p></Card>
            ) : (
                <>
                    <Card as="section" aria-label="Progress">
                        <ProgressBar numerator={unlocked} denominator={total} label="Achievements unlocked" />
                    </Card>

                    {SECTIONS.map(({ key, title, match }) => {
                        const all = achievements.filter(match)
                        const items = collapseLadders(all)
                        const isSecret = key === 'secret'

                        // Nothing is shown until something is unlocked (this hides secrets entirely)
                        if (items.length === 0) return null

                        // The secret section never reveals how many are left:
                        // "Secret 2 / ???" until all are found, then "Secrets 7 / 7"

                        let heading = title
                        let count
                        if (isSecret) {
                            const complete = secrets.total !== null
                            heading = complete ? 'Secrets' : 'Secret'
                            count = `${secrets.unlocked} / ${complete ? secrets.total : '???'}`
                        } else {
                            // Counted over every achievement, matching the progress bar, not the collapsed cards
                            count = `${all.filter(a => a.unlockedAt).length} / ${all.length}`
                        }

                        return (
                            <Card key={key} as="section" aria-labelledby={`${key}-title`} className="space-y-3">
                                <CardTitle id={`${key}-title`}>
                                    {heading} <span className="text-base font-normal text-muted">{count}</span>
                                </CardTitle>
                                <ul className="space-y-2">
                                    {items.map(a => <BadgeTile key={a.id} achievement={a} />)}
                                </ul>
                            </Card>
                        )
                    })}
                </>
            )}
        </div>
    )
}

export default Achievements
