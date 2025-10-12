// App.jsx
// File to hold main app structure and functionality

// Imports
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';   // Import router functions
import { ToastContainer } from 'react-toastify';  // Import toast container
import 'react-toastify/dist/ReactToastify.css';   // Import toast css
import Spinner from './components/Spinner.jsx';

// Lazy load pages for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const NewWorkout = lazy(() => import('./pages/NewWorkout.jsx'));
const PrevWorkouts = lazy(() => import('./pages/PrevWorkouts.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const Help = lazy(() => import('./pages/Help.jsx'));

// App
const App = () => {

  // Visuals
  return (
    <>
      <Router>
        <div className="w-full min-h-screen bg-[#2B2D42]">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/new-workout' element={<NewWorkout />} />
              <Route path='/prev-workouts' element={<PrevWorkouts />} />
              <Route path='/progress' element={<Progress />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/privacy-policy' element={<PrivacyPolicy />} />
              <Route path='/help' element={<Help />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
};

export default App;