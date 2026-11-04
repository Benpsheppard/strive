// LegalPage.jsx
// Shared frame for the privacy policy and terms: heading, a clear draft notice and a readable column

import FlexibleLayout from './FlexibleLayout.jsx'
import PageTitle from '../ui/PageTitle.jsx'
import { LEGAL_LAST_UPDATED } from '../../config/legal.js'

const LegalPage = ({ title, accent, children }) => (
    <FlexibleLayout>
        <div className="mx-auto max-w-2xl pb-10">
            <PageTitle accent={accent} subtitle={`Last updated ${LEGAL_LAST_UPDATED}`}>{title}</PageTitle>

            <p role="note" className="mb-6 rounded-xl border border-warning/50 bg-surface p-4 text-sm text-warning">
                <strong>Draft for review.</strong> This text describes what Strive actually does today, but it has not been reviewed by a
                lawyer. It must be reviewed and the placeholders in [square brackets] completed before the app is launched publicly.
            </p>

            <div className="space-y-6 text-muted [&_a]:text-accent-fg [&_a]:underline [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-fg [&_li]:mt-1 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:pl-5">
                {children}
            </div>
        </div>
    </FlexibleLayout>
)

export default LegalPage
