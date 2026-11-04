// AppLayout.jsx
// Shared shell for signed-in screens: navigation plus a centred, padded content area.

import { Outlet } from 'react-router-dom'
import Header from '../headers/Header.jsx'
import EmailBanner from './EmailBanner.jsx'

const AppLayout = ({ children }) => (
    <>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
            Skip to content
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-32 pt-4 md:pb-12">
            <EmailBanner />
            {children ?? <Outlet />}
        </main>
    </>
)

export default AppLayout
