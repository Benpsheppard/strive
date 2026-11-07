// Achievements.jsx
// Every badge: milestones, wacky ones and (masked) secrets

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getAchievements } from '../features/achievements/achievementsSlice.js'

import Spinner from '../components/spinners/Spinner.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import Card, { CardTitle } from '../components/ui/Card.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'
import BadgeTile from '../components/achievements/BadgeTile.jsx'

const SECTIONS = [
    { category: 'milestone', title: 'Milestones' },
    { category: 'wacky', title: 'Wacky' },
    { category: 'secret', title: 'Secret' }
]

const Achievements = () => {
    const dispatch = useDispatch()
    const { achievements, unlocked, total, isLoading, isError } = useSelector((state) => state.achievements)

    useEffect(() => {
        dispatch(getAchievements())
    }, [dispatch])

    if (isLoading && achievements.length === 0) return <Spinner />

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="Achievements" subtitle="Badges for milestones, silly feats and a few things we are not telling you about.">
                Your
            </PageTitle>

            {isError && achievements.length === 0 ? (
                <Card><p className="text-muted">Your achievements could not be loaded. Try again in a moment.</p></Card>
            ) : (
                <>
                    <Card as="section" aria-label="Progress">
                        <ProgressBar numerator={unlocked} denominator={total} label="Achievements unlocked" />
                    </Card>

                    {SECTIONS.map(({ category, title }) => {
                        const items = achievements.filter(a => a.category === category)
                        if (items.length === 0) return null

                        const done = items.filter(a => a.unlockedAt).length

                        return (
                            <Card key={category} as="section" aria-labelledby={`${category}-title`} className="space-y-3">
                                <CardTitle id={`${category}-title`}>
                                    {title} <span className="text-base font-normal text-muted">{done} / {items.length}</span>
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
