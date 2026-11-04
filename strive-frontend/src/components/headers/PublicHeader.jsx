// PublicHeader.jsx
// Slim header for the landing page, sign in/up and onboarding

import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Wordmark from './Wordmark.jsx'
import Button from '../ui/Button.jsx'

const PublicHeader = () => {
    const { user } = useSelector((state) => state.auth)

    return (
        <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Wordmark />

                <nav aria-label="Account" className="flex items-center gap-2">
                    <Link to="/how-it-works" className="hidden px-3 py-2 text-sm text-muted hover:text-fg sm:block">How it works</Link>
                    {user ? (
                        <Button as={Link} to="/" size="sm">Open app</Button>
                    ) : (
                        <>
                            <Link to="/login" className="px-3 py-2 text-sm font-semibold text-fg hover:text-accent-fg">Sign in</Link>
                            <Button as={Link} to="/register" size="sm">Get started</Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default PublicHeader
