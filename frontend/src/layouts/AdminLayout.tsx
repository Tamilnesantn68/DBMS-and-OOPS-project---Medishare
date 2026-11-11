import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: 'dashboard', end: true },
  { label: 'Organization Queue', to: '/admin/organizations', icon: 'verified_user', badge: '' },
  { label: 'Batch Verification', to: '/admin/medicines', icon: 'inventory_2', badge: '' },
  { label: 'Request Approvals', to: '/admin/requests', icon: 'fact_check', badge: '' },
  { label: 'Transfer Logistics', to: '/admin/transfers', icon: 'local_shipping', badge: '' },
  { label: 'Expiry & Alerts', to: '/admin/expiry-alerts', icon: 'alarm', badge: '' },
  { label: 'All Listings', to: '/admin/listings', icon: 'store', badge: '' },
  { label: 'Audit Ledger', to: '/admin/audit-logs', icon: 'receipt_long' },
  { label: 'Reports', to: '/admin/reports', icon: 'bar_chart' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await logout()
    toast.success('Admin logged out')
    navigate('/')
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin/listings?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-slate-50)]">
      {/* Admin Top Bar — dark styling */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[#E2E8F0]">
        <div className="flex justify-between items-center w-full px-6 py-2.5 max-w-[1720px] mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Logo variant="icon" size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-headline-sm text-[var(--color-primary)] tracking-tight font-bold">MediShare</span>
                  <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-primary)]/20">ENTERPRISE</span>
                </div>
                <p className="text-[11px] text-[var(--color-outline)]">Redistribution Core v2.4 · Clinical Gov</p>
              </div>
            </div>

            <div className="h-6 w-px bg-[var(--color-outline-variant)]/60 hidden lg:block mx-1" />

            {/* Admin identity badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
              <span className="material-symbols-outlined text-[var(--color-primary-container)] text-[18px]">verified_user</span>
              <div className="text-[11px] leading-tight">
                <span className="text-label-md text-[var(--color-on-surface)] block">{user?.fullName} <span className="text-[var(--color-outline)] font-normal font-mono">· Admin</span></span>
                <span className="text-[var(--color-outline)] text-[10px]">Master Regulatory & Compliance Officer</span>
              </div>
            </div>
          </div>

          {/* Center search + status */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#DCFCE7] border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              <span className="text-[11px] text-label-md text-[#15803D]">DSCSA Interoperable: <strong>Online</strong></span>
            </div>
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                className="w-full h-9 pl-9 pr-4 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[#94A3B8]"
                placeholder="Search NDC, Lot#, org ID (Press Enter)..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { navigate('/admin/requests'); toast('Showing all pending requests', { icon: '🚨' }) }}
              className="flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-1.5 rounded text-[12px] font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span className="hidden sm:inline">Emergency Request</span>
            </button>
            <div className="h-6 w-px bg-[var(--color-outline-variant)]/60 hidden sm:block" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => { toast('3 unread alerts — org verifications pending', { icon: '🔔' }) }}
                className="relative p-2 rounded text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
              </button>
            </div>
            {/* Admin avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-[var(--color-outline-variant)]/50">
              <div
                className="w-8 h-8 rounded bg-[var(--color-primary-fixed-dim)]/40 border border-[var(--color-primary)]/30 flex items-center justify-center font-mono text-[var(--color-primary)] font-bold text-xs cursor-pointer"
                onClick={() => navigate('/admin/settings')}
                title={user?.fullName}
              >
                {initials}
              </div>
            </div>
            <button className="lg:hidden p-2 rounded hover:bg-[var(--color-surface-container-low)]" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex-col justify-between shrink-0 fixed lg:relative z-20 top-[57px] lg:top-0 left-0 h-full lg:h-auto`}>
          <div className="p-3.5 space-y-5 overflow-y-auto custom-scroll flex-1">
            {/* Context badge */}
            <div className="px-2.5 py-2 bg-white rounded border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-outline)]">AUTHORITY DOMAIN</span>
                <span className="text-[10px] font-mono bg-[var(--color-secondary-container)]/40 text-[var(--color-secondary)] px-1.5 py-0.5 rounded font-medium">LIVE EPCIS</span>
              </div>
              <div className="text-[12px] text-[var(--color-on-surface)] mt-1 truncate font-semibold">Tri-State Clinical Zone</div>
            </div>

            <div>
              <div className="px-2 text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold mb-2">Clinical Queues</div>
              <nav className="space-y-1">
                {NAV_ITEMS.map(({ label, to, icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded text-left text-[13px] font-semibold transition-colors w-full ${
                        isActive
                          ? 'bg-[var(--color-primary-container)] text-white shadow-sm'
                          : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[#EEF2F6]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[19px]">{icon}</span>
                      <span>{label}</span>
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* FDA Compliance indicator */}
            <div className="p-3 bg-white rounded border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-on-surface)] font-semibold">FDA 21 CFR Part 11</span>
                <span className="material-symbols-outlined text-[#15803D] text-[16px]">check_circle</span>
              </div>
              <p className="text-[11px] text-[var(--color-outline)] leading-tight">Digital signatures & audit logs are cryptographically sealed.</p>
              <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary-container)] w-[98%]" />
              </div>
              <div className="text-[10px] font-mono text-[var(--color-outline)] flex justify-between">
                <span>Seal integrity</span>
                <span className="font-bold text-[var(--color-primary)]">99.98%</span>
              </div>
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white space-y-1">
            <NavLink to="/admin/settings" className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[12px] text-[var(--color-on-surface-variant)] hover:bg-[#F1F5F9] transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>System Settings</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[12px] text-[var(--color-on-surface-variant)] hover:bg-[#F1F5F9] hover:text-[var(--color-error)] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scroll p-6 lg:p-8 space-y-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
