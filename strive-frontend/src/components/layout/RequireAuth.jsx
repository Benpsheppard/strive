// RequireAuth.jsx
// Sends signed-out visitors to the login page, then back to where they were going.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RequireAuth = () => {
    const { user } = useSelector((state) => state.auth)
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}

export default RequireAuth
