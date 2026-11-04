// Wordmark.jsx

import { Link } from 'react-router-dom'
import { cx } from '../../utils/cx.js'

const Wordmark = ({ className }) => (
    <Link to="/" aria-label="Strive home" className={cx('font-display text-2xl font-extrabold tracking-wider text-fg hover:text-accent-fg', className)}>
        STRIVE
    </Link>
)

export default Wordmark
