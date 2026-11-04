// Privacy.jsx
// DRAFT privacy policy. It lists what the app really stores and does, so a reviewer can check it.

import { Link } from 'react-router-dom'
import LegalPage from '../components/layout/LegalPage.jsx'
import { OPERATOR_NAME, SUPPORT_EMAIL } from '../config/legal.js'

const Privacy = () => (
    <LegalPage title="Privacy" accent="policy">
        <section>
            <h2>Who we are</h2>
            <p>
                Strive is a workout tracker run by {OPERATOR_NAME} ("we", "us"). This page explains what information Strive
                holds about you, why, and the choices you have.
            </p>
        </section>

        <section>
            <h2>What we collect</h2>
            <ul>
                <li><strong>Account details:</strong> your username, email address and a password. Passwords are stored only as a one-way hash, so nobody (including us) can read them.</li>
                <li><strong>Consent record:</strong> when you agreed to the terms and which version.</li>
                <li><strong>Optional profile details:</strong> your weekly workout target, height, body weight and whether you prefer metric or imperial units.</li>
                <li><strong>Training data:</strong> the workouts you log (exercises, sets, weights, reps, times and distances), custom exercises you create, and what Strive works out from them: Strive Points, levels, streaks, momentum, personal bests and quests.</li>
                <li><strong>Leaderboard entries:</strong> your weekly points. Members appear on the leaderboard by username. Guest accounts do not.</li>
                <li><strong>Guest accounts:</strong> if you try Strive as a guest we create an account with a generated username and a placeholder email so your workouts can be saved.</li>
            </ul>
        </section>

        <section>
            <h2>What stays on your device</h2>
            <p>
                Strive uses your browser's local storage (not tracking cookies) to keep you signed in, remember your unit choice,
                keep a workout you have not finished yet, and hold workouts waiting to sync when you have no signal.
                Signing out clears the sign-in and any unfinished workout.
            </p>
        </section>

        <section>
            <h2>How we use it</h2>
            <ul>
                <li>To run the app: saving your workouts, working out points and progress, and showing the leaderboard.</li>
                <li>To keep your account secure and send emails you ask for: password resets and email confirmation.</li>
                <li>To write quests. We send an AI service (Anthropic's Claude) your recent workout history (dates, exercise names, equipment, sets) and your unit preference. We do not send your name, username or email address.</li>
                <li>To keep the service running and fix faults. Our server log records the time, page, response status and duration of each request, but not the contents of what you send.</li>
            </ul>
            <p>We do not sell your information and we do not show advertising.</p>
        </section>

        <section>
            <h2>Who else handles it</h2>
            <ul>
                <li>[Hosting provider, e.g. Render]: runs the app and servers.</li>
                <li>[Database provider]: stores your account and training data.</li>
                <li>Resend: sends our emails, so it sees your email address and the message.</li>
                <li>Anthropic: writes quests from the workout history described above.</li>
            </ul>
            <p>[Add the countries these providers store data in, and any transfer safeguards, after review.]</p>
        </section>

        <section>
            <h2>Your choices and rights</h2>
            <ul>
                <li><strong>See and download your data:</strong> Profile, then "Download my data" gives you everything we hold as a file.</li>
                <li><strong>Correct it:</strong> change your target, height, weight, email and password in Profile.</li>
                <li><strong>Delete it:</strong> Profile, then "Delete account" permanently removes your account, workouts, quests, leaderboard entries and custom exercises. "Reset workout data" removes your training history but keeps your account.</li>
                <li><strong>Ask us anything:</strong> {SUPPORT_EMAIL ? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> : <Link to="/support">use the support page</Link>}.</li>
            </ul>
        </section>

        <section>
            <h2>How long we keep it</h2>
            <p>
                We keep your information until you delete your account. [State how long guest accounts and server logs are kept.]
                Deleted data may remain in backups for [period] before it is overwritten.
            </p>
        </section>

        <section>
            <h2>Health information</h2>
            <p>
                Body weight, height and training history can be health-related. They are optional (apart from the training you
                choose to log), are only used to run Strive for you, and are never shown to other members.
            </p>
        </section>

        <section>
            <h2>Children</h2>
            <p>Strive is not intended for children under [age]. [Confirm the minimum age with your adviser.]</p>
        </section>

        <section>
            <h2>Changes</h2>
            <p>If we change this policy in an important way we will tell you in the app or by email and update the date above.</p>
        </section>
    </LegalPage>
)

export default Privacy
