// ProfileStats.jsx

import { formatWeight, formatNumber } from '../../utils/formatValues.js'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const Row = ({ label, children }) => (
    <div className="flex items-center justify-between border-b border-line/60 py-2">
        <dt className="text-muted">{label}</dt>
        <dd className="font-semibold text-fg">{children}</dd>
    </div>
)

const ProfileStats = ({ user, onEdit }) => (
    <Card as="section" aria-labelledby="stats-title">
        <div className="mb-2 flex items-center justify-between">
            <CardTitle id="stats-title" accent="details">Your</CardTitle>
            <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
        </div>

        <dl>
            <Row label="Level">{user.level}</Row>
            <Row label="Strive Points">{formatNumber(user.strivepoints, 0)} SP</Row>
            <Row label="Current streak">{user.streak?.current ?? 0} {user.streak?.current === 1 ? 'week' : 'weeks'}</Row>
            <Row label="Best streak">{user.streak?.best ?? 0} {user.streak?.best === 1 ? 'week' : 'weeks'}</Row>
            <Row label="Momentum">{user.momentum?.current ?? 0}</Row>
            <Row label="Weekly target">{user.target} workouts</Row>
            <Row label="Height">{user.height?.feet}&apos; {user.height?.inches}&quot;</Row>
            <Row label="Body weight">{user.weight ? formatWeight(user.weight, user.useImperial) : 'Not set'}</Row>
        </dl>
    </Card>
)

export default ProfileStats
