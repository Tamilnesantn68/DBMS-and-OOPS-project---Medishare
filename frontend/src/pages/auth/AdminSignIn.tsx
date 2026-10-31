import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'

export default function AdminSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?:string;password?:string}>({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e: {email?:string;password?:string} = {}
    if (!email) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password, 'ADMIN')
      toast.success('Admin console access granted')
      navigate('/admin')
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{message?:string}}})?.response?.data?.message
      toast.error(msg || 'Access denied — invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--color-tertiary-fixed)]/20 to-[#F8FAFC] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <Logo variant="icon" size={52} />
            <span className="text-headline-md text-[var(--color-primary)] mt-1">MediShare</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="material-symbols-outlined text-[var(--color-tertiary)]">shield_person</span>
            <h1 className="text-headline-sm text-[var(--color-on-surface)]">Regulatory Console Sign In</h1>
          </div>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">Authorized administrators only</p>
        </div>

        {/* Security warning */}
        <div className="bg-[var(--color-tertiary-fixed)]/30 border border-[var(--color-tertiary-fixed-dim)]/50 rounded-lg p-3 flex items-start gap-2 mb-4">
          <span className="material-symbols-outlined text-[var(--color-tertiary)] text-[18px] mt-0.5 shrink-0">warning</span>
          <p className="text-body-sm text-[var(--color-on-surface)]">This portal is restricted to authorized MediShare regulatory staff. Unauthorized access attempts are logged and reported. The backend verifies your actual admin role — selecting this page does not grant any elevated privileges.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[var(--color-tertiary-fixed-dim)]/50 shadow-lg p-8 space-y-4">
          <div>
            <label className="form-label">Admin Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </span>
              <input
                type="email"
                className={`form-input pl-9 ${errors.email ? 'border-[var(--color-error)]' : ''}`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@medishare.health"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="form-label">Administrator Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-[18px]">key</span>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className={`form-input pl-9 pr-10 ${errors.password ? 'border-[var(--color-error)]' : ''}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-outline)]" onClick={() => setShowPw(!showPw)}>
                <span className="material-symbols-outlined text-[18px]">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.password && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-[var(--color-tertiary-container)] text-white text-label-md font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
            ) : (
              <><span className="material-symbols-outlined">verified_user</span> Access Regulatory Console</>
            )}
          </button>

          <div className="text-center">
            <Link to="/signin" className="text-body-sm text-[var(--color-primary)] hover:underline">← Back to User Sign In</Link>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 bg-[#F0EDFF] border border-[#DDD6FE] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-label-md text-[#7C3AED]">
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Demo Admin Credentials</span>
          </div>
          <button
            type="button"
            onClick={() => { setEmail('admin@medishare.health'); setPassword('admin1234') }}
            className="w-full text-left p-2.5 rounded-lg bg-white border border-[var(--color-outline-variant)] hover:border-[#7C3AED] transition-colors cursor-pointer"
          >
            <div className="text-code-sm text-[var(--color-on-surface)]">admin@medishare.health</div>
            <div className="text-code-sm text-[var(--color-outline)]">admin1234</div>
            <div className="text-label-sm text-[#7C3AED] mt-0.5">Chief Compliance Officer · Full Access</div>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-body-sm text-[var(--color-outline)]">
          <span className="material-symbols-outlined text-[16px] text-[var(--color-primary-container)]">security</span>
          <span>All admin actions are audit-logged · Role verified server-side</span>
        </div>
      </div>
    </div>
  )
}
