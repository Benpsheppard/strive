// HowItWorks.jsx
// Plain-language rules for points, levels, streaks, momentum, quests and the leaderboard.
// Keep in step with the backend (utils/workoutSummary.js, spRules.js, momentum.js, workoutServices.js).

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import FlexibleLayout from '../components/layout/FlexibleLayout.jsx'
import Card from '../components/ui/Card.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

const Section = ({ id, title, accent, children }) => (
    <Card as="section" id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 space-y-3">
        <h2 id={`${id}-title`} className="font-display text-3xl font-bold">
            {title} <span className="text-accent-fg">{accent}</span>
        </h2>
        <div className="space-y-3 text-muted [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            {children}
        </div>
    </Card>
)

const Content = () => {
    const { hash } = useLocation()

    // Deep links like /how-it-works#streaks should land on that section
    useEffect(() => {
        if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    }, [hash])

    return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
        <PageTitle accent="works" subtitle="The rules behind Strive Points, streaks and quests, in plain English.">
            How it
        </PageTitle>

        <Section id="points" title="Strive" accent="Points">
            <p>
                Every workout earns <strong>Strive Points (SP)</strong>. You are not compared with anyone else's lifts:
                your volume, strength and progression are compared with <strong>your own recent workouts</strong>,
                so a beginner and an expert can both score well.
            </p>
            <ul>
                <li><strong>Volume, strength and progression</strong> each give 25 to 150 SP, depending on how this workout compares with your recent average.</li>
                <li><strong>Personal bests</strong> give 500 SP each. A PB must beat your previous best by at least 1% (and at least 0.5 kg for weights).</li>
                <li><strong>First time</strong> you log an exercise with a piece of equipment gives 50 SP (up to 5 per workout). It is not a PB.</li>
                <li><strong>Hitting your weekly target</strong> gives a bonus from 100 to 1,000 SP.</li>
                <li><strong>Quests</strong> add their reward when you complete them.</li>
            </ul>
            <p>Your consistency and momentum then multiply the total.</p>
            <p><strong>Fair play limits:</strong> a workout needs at least 3 sets and 5 minutes to earn SP, and you can earn up to 1,500 SP per day.</p>
        </Section>

        <Section id="levels" title="" accent="Levels">
            <p>
                Your level rises as your SP grows. Level 2 needs 100 SP, level 3 needs 400 SP, level 4 needs 900 SP and so on:
                level <em>n</em> starts at 100 × (n − 1)² SP.
            </p>
        </Section>

        <Section id="streaks" title="Weekly" accent="streaks">
            <p>
                Your streak counts the weeks in a row you have trained. It goes up with your first workout each week.
                Keep it going by training at least once every week. If you miss a whole week, the streak resets.
            </p>
            <ul>
                <li>Set your weekly target (1 to 7 workouts) in Profile to track your goal for the week.</li>
                <li><strong>Shields:</strong> you earn a streak shield every 4 weeks of streak. You can hold one at a time.</li>
                <li>A shield protects you from <strong>one</strong> missed week. Miss more than a week and the streak resets.</li>
            </ul>
        </Section>

        <Section id="momentum" title="" accent="Momentum">
            <p>
                Momentum is a score from 0 to 100 that shows how active you have been lately. It multiplies your SP,
                from ×1 up to ×2 when you are at 100.
            </p>
            <ul>
                <li>You gain 5 for each workout, 5 per personal best and 3, 7 or 10 for daily, weekly or monthly quests (up to 30 per workout).</li>
                <li>It slowly drops for every day you do not train, faster the higher it is.</li>
            </ul>
        </Section>

        <Section id="quests" title="" accent="Quests">
            <p>
                Quests are goals written for you from your recent workouts, so they only ever use exercises you actually do.
                There is a set of daily (100 SP), weekly (500 SP) and monthly (1,000 SP) quests. Complete them in any workout before they expire.
            </p>
        </Section>

        <Section id="leaderboard" title="Weekly" accent="leaderboard">
            <p>
                The leaderboard ranks the top 15 members by SP earned this week and resets every Monday.
                Guest accounts do not appear on it.
            </p>
        </Section>
    </div>
    )
}

const HowItWorks = () => (
    <FlexibleLayout>
        <Content />
    </FlexibleLayout>
)

export default HowItWorks
