// Support.jsx

import { Link } from 'react-router-dom'
import FlexibleLayout from '../components/layout/FlexibleLayout.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { SUPPORT_EMAIL } from '../config/legal.js'

const FAQ = [
    ['I forgot my password', 'Use "Forgot password?" on the sign-in page and we will email you a link.'],
    ['My workout earned no points', 'A workout needs at least 3 sets and 5 minutes to earn Strive Points, and there is a daily limit. The workout summary tells you which applied.'],
    ['How do I get my data or delete my account?', 'Open Profile. "Download my data" gives you everything we hold, and "Delete account" removes it permanently.'],
    ['I logged a workout while offline', 'It is saved on your device and uploads automatically when you are back online.']
]

const Support = () => (
    <FlexibleLayout>
        <div className="mx-auto max-w-2xl space-y-4 pb-10">
            <PageTitle accent="and feedback" subtitle="Questions, bugs or ideas? We would like to hear them.">Support</PageTitle>

            <Card as="section" aria-labelledby="contact-title" className="space-y-3">
                <h2 id="contact-title" className="font-display text-2xl font-bold">Get in touch</h2>
                {SUPPORT_EMAIL ? (
                    <>
                        <p className="text-muted">Email us and include what you were doing and which device you use. We read everything.</p>
                        <Button as="a" href={`mailto:${SUPPORT_EMAIL}`}>Email {SUPPORT_EMAIL}</Button>
                    </>
                ) : (
                    <p className="text-muted">Our support email address will be published here before launch. [Set VITE_SUPPORT_EMAIL.]</p>
                )}
            </Card>

            <Card as="section" aria-labelledby="faq-title" className="space-y-3">
                <h2 id="faq-title" className="font-display text-2xl font-bold">Common questions</h2>
                <dl className="space-y-4">
                    {FAQ.map(([question, answer]) => (
                        <div key={question}>
                            <dt className="font-semibold text-fg">{question}</dt>
                            <dd className="text-muted">{answer}</dd>
                        </div>
                    ))}
                </dl>
                <p className="text-sm text-muted">
                    More on how points, streaks and quests work: <Link to="/how-it-works" className="text-accent-fg underline">How it works</Link>.
                </p>
            </Card>
        </div>
    </FlexibleLayout>
)

export default Support
