// App.jsx

// Imports
import { Suspense, lazy, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Spinner from './components/spinners/Spinner.jsx'
import { ConfirmProvider } from './components/ui/ConfirmProvider.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import WorkoutDashboardSkeleton from './components/workouts/WorkoutDashboardSkeleton.jsx'
import RequireAuth from './components/layout/RequireAuth.jsx'
import { getMe } from './features/auth/authSlice.js'

// Lazy load pages for performance optimization
const Landing = lazy(() => import('./pages/Landing.jsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const NewWorkout = lazy(() => import('./pages/NewWorkout.jsx'))
const WorkoutComplete = lazy(() => import('./pages/WorkoutComplete.jsx'))
const ProgressUpdate = lazy(() => import('./pages/ProgressUpdate.jsx'))
const StreakUpdate = lazy(() => import('./pages/StreakUpdate.jsx'))
const PrevWorkouts = lazy(() => import('./pages/PrevWorkouts.jsx'))
const Progress = lazy(() => import('./pages/Progress.jsx'))
const Games = lazy(() => import('./pages/Games.jsx'))
const Achievements = lazy(() => import('./pages/Achievements.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const GuestMigration = lazy(() => import('./pages/GuestMigration.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const Routines = lazy(() => import('./pages/Routines.jsx'))

// The home screen is the workout logger when signed in, and the landing page when not
const Home = () => {
	const { user } = useSelector((state) => state.auth)

	// While the NewWorkout chunk downloads, paint the app shell and a skeleton instead of a spinner
	return user ? (
		<AppLayout>
			<Suspense fallback={<WorkoutDashboardSkeleton user={user} />}>
				<NewWorkout />
			</Suspense>
		</AppLayout>
	) : <Landing />
}

// App
const App = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		const cachedUser = JSON.parse(localStorage.getItem('Strive:user'))

		if (cachedUser) {
			dispatch(getMe())
		}
	}, [dispatch])

	return (
		<ConfirmProvider>
			<Router>
				<Suspense fallback={<Spinner />}>
					<Routes>
						{/* Public */}
						<Route path='/' element={<Home />} />
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
						<Route path='/how-it-works' element={<HowItWorks />} />
						<Route path='/forgot-password' element={<ForgotPassword />} />
						<Route path='/reset-password' element={<ResetPassword />} />
						<Route path='/verify-email' element={<VerifyEmail />} />
						<Route path='/privacy' element={<Privacy />} />
						<Route path='/terms' element={<Terms />} />
						<Route path='/support' element={<Support />} />

						{/* Signed in, no app navigation */}
						<Route element={<RequireAuth />}>
							<Route path='/onboarding' element={<Onboarding />} />
							<Route path='/migrate' element={<GuestMigration />} />
						</Route>

						{/* Signed in, inside the app shell */}
						<Route element={<RequireAuth />}>
							<Route element={<AppLayout />}>
								<Route path='/workout-complete' element={<WorkoutComplete />} />
								<Route path='/progress-update' element={<ProgressUpdate />} />
								<Route path='/streaks' element={<StreakUpdate />} />
								<Route path='/prev-workouts' element={<PrevWorkouts />} />
								<Route path='/progress' element={<Progress />} />
								<Route path='/games' element={<Games />} />
								<Route path='/achievements' element={<Achievements />} />
								<Route path='/routines' element={<Routines />} />
								<Route path='/profile' element={<Profile />} />
							</Route>
						</Route>

						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</Router>
			<ToastContainer position="top-center" />
		</ConfirmProvider>
	)
}

export default App
