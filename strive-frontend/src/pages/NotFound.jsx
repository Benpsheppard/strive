// NotFound.jsx

import { Link } from 'react-router-dom'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Button from '../components/ui/Button.jsx'

const NotFound = () => (
    <>
        <PublicHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
            <p className="font-display text-7xl font-extrabold text-accent-fg">404</p>
            <h1 className="font-display text-3xl font-bold">Page not found</h1>
            <p className="text-muted">The page you are looking for does not exist or has moved.</p>
            <Button as={Link} to="/">Back to Strive</Button>
        </main>
    </>
)

export default NotFound
