import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import Navbar from './components/navbar/navbar'

import './App.css'
import AboutPage from './pages/AboutPage'
import './styles/colors.css'
import BackgroundLayout from './components/backgroud_layout/background_layout'
import PricingPage from './pages/pricing/PricingPage'
import HomePage from './pages/home/HomePage'
import AccountPage from './pages/account/Account'
import TripsPage from './pages/trips/TripsPages'
import PricesSettingsPage from './pages/prices_settings/PricesSettingsPage'
import InboxPage from './pages/inbox/InboxPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p dir="rtl">טוען...</p>
  }

  const appRoutes = (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/home" replace />
            : <LoginPage />
        }
      />

      <Route
        path="/home"
        element={
          user
            ? <HomePage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/pricing"
        element={
          user
            ? <PricingPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/trips"
        element={
          user
            ? <TripsPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/account"
        element={
          user
            ? <AccountPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/about"
        element={
          user
            ? <AboutPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/prices"
        element={
          user
            ? <PricesSettingsPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/inbox"
        element={
          user
            ? <InboxPage />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={user ? '/home' : '/login'}
            replace
          />
        }
      />
    </Routes>
  )

  return (
    <div className={'home_wrapper'}>
      <Navbar />
      <BackgroundLayout >
        {appRoutes}
      </BackgroundLayout>
    </div>
  )
}

export default App