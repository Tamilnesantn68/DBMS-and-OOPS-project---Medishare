import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage'
import TermsOfUsePage from './pages/public/TermsOfUsePage'

// Auth Pages
import UserSignIn from './pages/auth/UserSignIn'
import AdminSignIn from './pages/auth/AdminSignIn'
import RegisterPage from './pages/auth/RegisterPage'

// User Portal Pages
import UserDashboard from './pages/user/UserDashboard'
import DonateMedicines from './pages/user/DonateMedicines'
import MyDonations from './pages/user/MyDonations'
import RequestMedicines from './pages/user/RequestMedicines'
import MyRequests from './pages/user/MyRequests'
import MyTransfers from './pages/user/MyTransfers'
import UserNotifications from './pages/user/UserNotifications'
import OrganizationProfile from './pages/user/OrganizationProfile'
import UserSettings from './pages/user/UserSettings'

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import OrgVerification from './pages/admin/OrgVerification'
import MedicineVerification from './pages/admin/MedicineVerification'
import AllListings from './pages/admin/AllListings'
import RequestApproval from './pages/admin/RequestApproval'
import TransferManagement from './pages/admin/TransferManagement'
import ExpiryAlerts from './pages/admin/ExpiryAlerts'
import AdminReports from './pages/admin/AdminReports'
import AuditLogs from './pages/admin/AuditLogs'
import AdminSettings from './pages/admin/AdminSettings'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'USER' | 'ADMIN' }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-slate-50)]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-container)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-body-md text-[var(--color-outline)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={requiredRole === 'ADMIN' ? '/admin/signin' : '/signin'} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<ErrorBoundary><PublicLayout /></ErrorBoundary>}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfUsePage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="signin" element={<UserSignIn />} />
        <Route path="admin/signin" element={<AdminSignIn />} />
        <Route path="register" element={<RegisterPage />} />

        {/* User Portal Routes */}
        <Route path="portal" element={<ProtectedRoute requiredRole="USER"><ErrorBoundary><UserLayout /></ErrorBoundary></ProtectedRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="donate" element={<DonateMedicines />} />
          <Route path="donations" element={<MyDonations />} />
          <Route path="marketplace" element={<RequestMedicines />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="transfers" element={<MyTransfers />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="organization" element={<OrganizationProfile />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="admin" element={<ProtectedRoute requiredRole="ADMIN"><ErrorBoundary><AdminLayout /></ErrorBoundary></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="organizations" element={<OrgVerification />} />
          <Route path="medicines" element={<MedicineVerification />} />
          <Route path="listings" element={<AllListings />} />
          <Route path="requests" element={<RequestApproval />} />
          <Route path="transfers" element={<TransferManagement />} />
          <Route path="expiry-alerts" element={<ExpiryAlerts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
