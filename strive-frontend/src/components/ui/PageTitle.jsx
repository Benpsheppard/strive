// PageTitle.jsx
// The two-tone page heading: <PageTitle accent="Workout">New</PageTitle>

import { cx } from '../../utils/cx.js'

const PageTitle = ({ accent, children, subtitle, className }) => (
    <div className={cx('py-4 text-center', className)}>
        <h1 className="font-display text-4xl font-bold text-fg md:text-5xl">
            {children}
            {accent && <span className="text-accent-fg"> {accent}</span>}
        </h1>
        {subtitle && <p className="mx-auto mt-2 max-w-xl text-muted">{subtitle}</p>}
    </div>
)

export default PageTitle
