// Quests.jsx
// Daily, weekly and monthly quests

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { reset, getQuests } from '../../features/quests/questSlice'

import QuestCard from './QuestCard'
import InlineSpinner from '../spinners/InlineSpinner'
import Card from '../ui/Card.jsx'

const SECTIONS = [
    { key: 'daily', title: 'Daily', empty: 'No daily quests right now. Check back tomorrow.' },
    { key: 'weekly', title: 'Weekly', empty: 'No weekly quests right now. Check back next week.' },
    { key: 'monthly', title: 'Monthly', empty: 'No monthly quest right now. Check back next month.' }
]

const Quests = () => {
    const dispatch = useDispatch()

    const { user } = useSelector((state) => state.auth)
    const { quests, isLoading, isError } = useSelector((state) => state.quest)
    const { workouts } = useSelector((state) => state.workout)

    const eligible = !user?.isGuest && workouts.length >= 3

    useEffect(() => {
        if (eligible) {
            dispatch(getQuests())
        }

        return () => {
            dispatch(reset())
        }
    }, [dispatch, eligible])

    const hasAny = SECTIONS.some(({ key }) => quests?.[key]?.length > 0)

    if (!isLoading && (isError || !hasAny)) {
        return (
            <Card as="section" aria-label="Quests" className="space-y-2 text-center">
                <h2 className="font-display text-3xl font-bold">No quests <span className="text-accent-fg">available</span></h2>
                <p className="text-muted">
                    {isError
                        ? 'Quests could not be loaded right now. Please try again later.'
                        : 'New quests are made from your recent workouts. Check back soon.'}
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {SECTIONS.map(({ key, title, empty }) => (
                <Card as="section" key={key} aria-labelledby={`${key}-quests`} className="space-y-4">
                    <h2 id={`${key}-quests`} className="font-display text-3xl font-bold">
                        {title} <span className="text-accent-fg">quests</span>
                    </h2>

                    {isLoading ? (
                        <InlineSpinner />
                    ) : quests?.[key]?.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {quests[key].map(q => <QuestCard key={q._id} quest={q} />)}
                        </div>
                    ) : (
                        <p className="text-muted">{empty}</p>
                    )}
                </Card>
            ))}
        </div>
    )
}

export default Quests
