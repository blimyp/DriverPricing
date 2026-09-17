import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DriverLoginPage from './pages/DriverLoginPage'
import Navbar from './components/navbar/navbar'

import './App.css'
import AboutPage from './pages/AboutPage'
import './styles/colors.css'
import PricingPage from './pages/pricing/PricingPage'
import HomePage from './pages/home/HomePage'
import AccountPage from './pages/account/Account'
import TripsPage from './pages/trips/TripsPages'
import PricesSettingsPage from './pages/prices_settings/PricesSettingsPage'
import InboxPage from './pages/inbox/InboxPage'
import DriverPage from './pages/driver/DriverPage'
import DriversPage from './pages/drivers/DriversPage'

function App() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-loading-screen" dir="rtl">
        <img
          src="/logo.png"
          alt="טוען..."
          className="app-loading-logo"
        />
      </div>
    )
  }

  const isDriver = user?.role === 'driver'
  const homeRoute = isDriver ? '/driver' : '/home'

  const appRoutes = (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={homeRoute} replace />
            : <LoginPage />
        }
      />

      <Route
        path="/driver-login"
        element={<DriverLoginPage />}
      />

      <Route
        path="/home"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <HomePage />
        }
      />

      <Route
        path="/driver"
        element={
          user
            ? <DriverPage />
            : <Navigate to="/driver-login" replace />
        }
      />

      <Route
        path="/pricing"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <PricingPage />
        }
      />

      <Route
        path="/trips"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <TripsPage />
        }
      />

      <Route
        path="/account"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <AccountPage />
        }
      />

      <Route
        path="/about"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <AboutPage />
        }
      />

      <Route
        path="/prices"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <PricesSettingsPage />
        }
      />

      <Route
        path="/inbox"
        element={
          !user
            ? <Navigate to="/login" replace />
            : isDriver
              ? <Navigate to="/driver" replace />
              : <InboxPage />
        }
      />

      <Route
        path="/drivers"
        element={
          user && isAdmin
            ? <DriversPage />
            : <Navigate to={user ? homeRoute : '/login'} replace />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={user ? homeRoute : '/login'}
            replace
          />
        }
      />
    </Routes>
  )

  const hideNavbar =
    isDriver || location.pathname === '/driver-login'

  return (
    <div className={'home_wrapper'}>
      {!hideNavbar && <Navbar />}
      {appRoutes}
    </div>
  )
}

export default App