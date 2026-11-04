// FlexibleLayout.jsx
// For pages that signed-in and signed-out visitors can both open (How it works, legal pages):
// the app shell for members, the public header for everyone else.

import { useSelector } from 'react-redux'
import PublicHeader from '../headers/PublicHeader.jsx'
import AppLayout from './AppLayout.jsx'

const FlexibleLayout = ({ children }) => {
    const { user } = useSelector((state) => state.auth)

    return user ? (
        <AppLayout>{children}</AppLayout>
    ) : (
        <>
            <PublicHeader />
            <main className="px-4 pb-12 pt-4">{children}</main>
        </>
    )
}

export default FlexibleLayout
