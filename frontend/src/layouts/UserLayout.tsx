import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/portal', icon: 'dashboard', end: true },
  { label: 'Donate Medicines', to: '/portal/donate', icon: 'volunteer_activism' },
  { label: 'My Donations', to: '/portal/donations', icon: 'inventory_2' },
  { label: 'Marketplace', to: '/portal/marketplace', icon: 'storefront' },
  { label: 'My Requests', to: '/portal/requests', icon: 'fact_check' },
  { label: 'My Transfers', to: '/portal/transfers', icon: 'local_shipping' },
  { label: 'Notifications', to: '/portal/notifications', icon: 'notifications' },
]

const GOVERNANCE_ITEMS = [
  { label: 'Organization Profile', to: '/portal/organization', icon: 'business' },
  { label: 'Settings', to: '/portal/settings', icon: 'settings' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-slate-50)]">
      {/* Top Header */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[var(--color-outline-variant)]">
        <div className="flex justify-between items-center w-full px-6 py-2.5 max-w-[1440px] mx-auto">
          {/* Brand + Org Badge */}
          <div className="flex items-center gap-4">
            <NavLink to="/portal">
              <Logo variant="header" />
            </NavLink>
            <div className="hidden sm:block h-6 w-px bg-[var(--color-outline-variant)]" />
            {user?.organizationName && (
              <div className="hidden sm:flex items-center gap-2 bg-[var(--color-surface-container-low)] px-3 py-1.5 rounded border border-[var(--color-outline-variant)]">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-[18px]">verified_user</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-label-md text-[var(--color-on-surface)]">{user.organizationName}</span>
                    {user.organizationStatus === 'VERIFIED' && (
                      <span className="badge badge-success text-[10px]">Verified</span>
                    )}
                    {user.organizationStatus === 'PENDING' && (
                      <span className="badge badge-warning text-[10px]">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <NavLink to="/portal/donate" className="btn-primary hidden md:flex">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Donate Batch</span>
            </NavLink>
            <NavLink to="/portal/marketplace" className="btn-secondary hidden md:flex">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px]">storefront</span>
              <span>Request Stock</span>
            </NavLink>
            <div className="h-6 w-px bg-[var(--color-outline-variant)]" />
            <NavLink to="/portal/notifications" className="relative w-9 h-9 rounded flex items-center justify-center hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-error)] ring-2 ring-white" />
            </NavLink>
            {/* Avatar */}
            <div className="flex items-center gap-2 pl-1 cursor-pointer" onClick={() => navigate('/portal/settings')}>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center text-[var(--color-primary)] font-bold text-label-md border border-[var(--color-primary-fixed-dim)]">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-label-md block text-[var(--color-on-surface)]">{user?.fullName}</span>
                <span className="text-label-sm block text-[var(--color-outline)] text-[11px]">User Portal</span>
              </div>
            </div>
            {/* Mobile menu */}
            <button className="lg:hidden p-2 rounded hover:bg-[var(--color-surface-container-low)]" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-64 bg-[var(--color-surface-container-low)] border-r border-[var(--color-outline-variant)] flex-shrink-0 flex-col justify-between min-h-[calc(100vh-61px)] fixed lg:relative z-30 top-[61px] lg:top-0 left-0 h-full lg:h-auto`}>
          <div className="p-3 space-y-1 overflow-y-auto custom-scroll flex-1">
            <div className="px-3 py-2 text-label-sm uppercase tracking-wider text-[var(--color-outline)]">Clinical Portal</div>
            {NAV_ITEMS.map(({ label, to, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="pt-4 pb-1">
              <div className="px-3 py-1 text-label-sm uppercase tracking-wider text-[var(--color-outline)]">Governance</div>
            </div>
            {GOVERNANCE_ITEMS.map(({ label, to, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[var(--color-outline-variant)] bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-dot bg-[var(--color-secondary)] animate-pulse" />
              <span className="text-label-sm text-[var(--color-secondary)] font-semibold">Cold-Chain Network: Operational</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-body-sm text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-error)] transition-colors mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6 lg:p-8 bg-[var(--color-slate-50)]">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
