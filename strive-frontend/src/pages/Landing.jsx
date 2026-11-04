// Landing.jsx
// What visitors see before they sign in

import { Link } from 'react-router-dom'
import { FaDumbbell as Dumbbell, FaTrophy as Trophy, FaFire as Flame, FaBullseye as Target, FaMagic as Sparkles, FaChartLine as TrendingUp } from 'react-icons/fa'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

const STEPS = [
    {
        icon: Dumbbell,
        title: 'Log your workout',
        text: 'Pick from 130+ exercises or add your own. Strive shows what you did last time and fills in your next set.'
    },
    {
        icon: TrendingUp,
        title: 'Beat your own numbers',
        text: 'Earn Strive Points by doing more than your recent average, not by comparing yourself to anyone else. Every personal best counts.'
    },
    {
        icon: Flame,
        title: 'Build a habit that lasts',
        text: 'Set a weekly target, grow your streak, and complete quests written around the exercises you actually do.'
    }
]

const FEATURES = [
    { icon: Dumbbell, title: 'Every kind of exercise', text: 'Weights, bodyweight, assisted, timed holds and cardio, each tracked the way it should be.' },
    { icon: Target, title: 'Last time at a glance', text: 'See your previous sets and personal best while you train, with the next set prefilled.' },
    { icon: Sparkles, title: 'Quests made for you', text: 'Daily, weekly and monthly goals generated from your own history, never random exercises.' },
    { icon: Flame, title: 'Streaks with a safety net', text: 'Weekly streaks that forgive a missed week: earn a shield every four weeks.' },
    { icon: TrendingUp, title: 'Progress you can see', text: 'Personal bests, estimated one-rep maxes, muscle balance and a training calendar.' },
    { icon: Trophy, title: 'A fair weekly leaderboard', text: 'Points reward effort over your own baseline, with limits that stop junk workouts from topping the board.' }
]

const Landing = () => (
    <>
        <PublicHeader />

        <main>
            {/* Hero */}
            <section className="mx-auto max-w-3xl px-4 pb-14 pt-14 text-center sm:pt-20">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent-fg">Workout tracker with a game layer</p>
                <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-7xl">
                    Lift. Level up.<br />
                    <span className="text-accent-fg">Keep showing up.</span>
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
                    Strive tracks your training and turns consistency into points, streaks and quests, so the habit sticks.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button as={Link} to="/register" size="lg">Get started, it&apos;s free</Button>
                    <Button as={Link} to="/login" size="lg" variant="secondary">Sign in</Button>
                </div>
                <p className="mt-3 text-sm text-muted">
                    Want a look first? <Link to="/login" className="font-semibold text-fg underline">Try it as a guest</Link> with up to 5 workouts.
                </p>
            </section>

            {/* How it works */}
            <section aria-labelledby="how-heading" className="mx-auto max-w-5xl px-4 py-12">
                <h2 id="how-heading" className="mb-8 text-center font-display text-4xl font-bold">
                    How it <span className="text-accent-fg">works</span>
                </h2>
                <ol className="grid gap-4 md:grid-cols-3">
                    {STEPS.map(({ icon: Icon, title, text }, index) => (
                        <li key={title}>
                            <Card className="h-full space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-xl font-bold text-white">{index + 1}</span>
                                    <Icon aria-hidden="true" className="text-accent-fg" />
                                </div>
                                <h3 className="font-display text-2xl font-bold">{title}</h3>
                                <p className="text-muted">{text}</p>
                            </Card>
                        </li>
                    ))}
                </ol>
                <p className="mt-6 text-center">
                    <Link to="/how-it-works" className="font-semibold text-accent-fg hover:underline">See exactly how points, streaks and quests work</Link>
                </p>
            </section>

            {/* Features */}
            <section aria-labelledby="features-heading" className="mx-auto max-w-5xl px-4 py-12">
                <h2 id="features-heading" className="mb-8 text-center font-display text-4xl font-bold">
                    Built for people who <span className="text-accent-fg">actually train</span>
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, text }) => (
                        <li key={title}>
                            <Card className="h-full space-y-2">
                                <Icon aria-hidden="true" className="text-accent-fg" />
                                <h3 className="font-display text-xl font-bold">{title}</h3>
                                <p className="text-muted">{text}</p>
                            </Card>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Closing call to action */}
            <section className="mx-auto max-w-3xl px-4 py-14 text-center">
                <Card padding="lg" raised className="space-y-4">
                    <h2 className="font-display text-4xl font-bold">Your next workout starts here</h2>
                    <p className="text-muted">Create a free account in under a minute. No card needed.</p>
                    <Button as={Link} to="/register" size="lg">Create your account</Button>
                </Card>
            </section>
        </main>

        <footer className="border-t border-line/60 px-4 py-8 text-center text-sm text-muted">
            <nav aria-label="Footer" className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1">
                <Link to="/how-it-works" className="hover:text-fg">How it works</Link>
                <Link to="/login" className="hover:text-fg">Sign in</Link>
                <Link to="/register" className="hover:text-fg">Sign up</Link>
                <Link to="/privacy" className="hover:text-fg">Privacy</Link>
                <Link to="/terms" className="hover:text-fg">Terms</Link>
                <Link to="/support" className="hover:text-fg">Support</Link>
            </nav>
            <p>&copy; {new Date().getFullYear()} Strive</p>
        </footer>
    </>
)

export default Landing
