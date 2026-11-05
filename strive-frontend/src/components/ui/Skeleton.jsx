// Skeleton.jsx
// A pulsing placeholder block that stands in for content that is still loading

import { cx } from '../../utils/cx.js'

const Skeleton = ({ className }) => (
    <div aria-hidden="true" className={cx('animate-pulse rounded-lg bg-line/40 motion-reduce:animate-none', className)} />
)

export default Skeleton
