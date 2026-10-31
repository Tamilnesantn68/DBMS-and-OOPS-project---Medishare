import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Logo from '../components/Logo'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Contact', to: '/contact' },
]

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-slate-50)] text-[var(--color-on-surface)]">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[var(--color-outline-variant)]">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-[1440px] mx-auto">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3">
            <Logo variant="full" size={38} />
            <span className="badge badge-success ml-2 hidden sm:inline-flex">
              <span className="status-dot bg-[var(--color-success)]" />
              DSCSA Verified
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-label-md pb-1 transition-colors duration-150 border-b-2 ${
                    isActive
                      ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                      : 'text-[var(--color-on-surface-variant)] border-transparent hover:text-[var(--color-primary)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate('/signin')}
              className="px-3.5 py-2 text-label-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] rounded-lg transition-colors border border-[var(--color-outline-variant)] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span>User Sign In</span>
            </button>
            <button
              onClick={() => navigate('/admin/signin')}
              className="px-3.5 py-2 text-label-md text-[var(--color-tertiary)] bg-[var(--color-tertiary-fixed)]/30 hover:bg-[var(--color-tertiary-fixed)]/60 rounded-lg border border-[var(--color-tertiary-fixed-dim)]/50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">domain_add</span>
              <span>Register Organization</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--color-outline-variant)] px-6 py-4 space-y-3 animate-fade-in">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-label-md ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-[var(--color-outline-variant)] flex flex-col gap-2">
              <button onClick={() => { navigate('/signin'); setMobileMenuOpen(false) }} className="btn-secondary w-full justify-center">User Sign In</button>
              <button onClick={() => { navigate('/register'); setMobileMenuOpen(false) }} className="btn-primary w-full justify-center">Register Organization</button>
            </div>
          </div>
        )}
      </header>

      {/* ── DSCSA Notice Banner ── */}
      <div className="bg-[var(--color-primary)]/5 border-b border-[var(--color-primary)]/15 py-2 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between text-body-sm gap-2">
          <div className="flex items-center gap-2 text-[var(--color-on-surface)]">
            <span className="material-symbols-outlined text-[var(--color-primary-container)] text-base">verified_user</span>
            <span><strong>Live Network Notice:</strong> DSCSA Phase II electronic interoperable traceability active. Verified pharmaceutical redistribution network.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/register')} className="text-[var(--color-primary)] text-label-sm underline hover:text-[var(--color-primary-container)] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">local_hospital</span> Join Network
            </button>
            <span className="text-[var(--color-outline-variant)]">|</span>
            <button onClick={() => navigate('/how-it-works')} className="text-[var(--color-tertiary)] text-label-sm underline hover:text-[var(--color-tertiary-container)] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span> Learn More
            </button>
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] py-12 mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-3">
              <Logo variant="icon" size={32} />
              <span className="text-headline-sm text-white ml-2 align-middle">MediShare</span>
            </div>
            <p className="text-body-sm text-[var(--color-inverse-on-surface)]/70 max-w-sm">
              DSCSA-compliant pharmaceutical redistribution platform. Connecting healthcare organizations to eliminate medicine waste while serving communities in need.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="status-dot bg-[var(--color-secondary-container)] animate-pulse" />
              <span className="text-label-sm text-[var(--color-secondary-container)]">Cold-Chain Network: Operational</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-label-md text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {[['How It Works', '/how-it-works'], ['About Us', '/about'], ['Contact', '/contact'], ['Register Organization', '/register']].map(([label, to]) => (
                <li key={to}>
                  <NavLink to={to} className="text-body-sm text-[var(--color-inverse-on-surface)]/70 hover:text-white transition-colors">{label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-label-md text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              {[['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']].map(([label, to]) => (
                <li key={to}>
                  <NavLink to={to} className="text-body-sm text-[var(--color-inverse-on-surface)]/70 hover:text-white transition-colors">{label}</NavLink>
                </li>
              ))}
              <li>
                <a href="mailto:compliance@medishare.health" className="text-body-sm text-[var(--color-inverse-on-surface)]/70 hover:text-white transition-colors">
                  compliance@medishare.health
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-body-sm text-[var(--color-inverse-on-surface)]/50">© 2025 MediShare Health Technologies. All rights reserved.</p>
          <p className="text-body-sm text-[var(--color-inverse-on-surface)]/50">DSCSA Compliant · HIPAA Secure · SOC 2 Type II</p>
        </div>
      </footer>
    </div>
  )
}
