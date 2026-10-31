import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'

export default function UserSignIn() {
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password, 'USER')
      toast.success('Welcome back!')
      navigate('/portal')
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{message?:string}}})?.response?.data?.message
      toast.error(msg || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F2F3FF] to-[#F8FAFC] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <Logo variant="icon" size={52} />
            <span className="text-headline-md text-[var(--color-primary)] mt-1">MediShare</span>
          </Link>
          <h1 className="text-headline-sm text-[var(--color-on-surface)] mt-4">Organization Sign In</h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">Access your clinical logistics portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[var(--color-outline-variant)] shadow-lg p-8 space-y-4">
          {/* Email */}
          <div>
            <label className="form-label">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-[18px]">email</span>
              </span>
              <input
                type="email"
                className={`form-input pl-9 ${errors.email ? 'border-[var(--color-error)]' : ''}`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className={`form-input pl-9 pr-10 ${errors.password ? 'border-[var(--color-error)]' : ''}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-outline)] hover:text-[var(--color-on-surface)]" onClick={() => setShowPw(!showPw)}>
                <span className="material-symbols-outlined text-[18px]">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.password && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-body-sm text-[var(--color-on-surface-variant)] cursor-pointer">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-body-sm text-[var(--color-primary)] hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
            ) : (
              <><span className="material-symbols-outlined">login</span> Sign In to Portal</>
            )}
          </button>

          <div className="text-center text-body-sm text-[var(--color-on-surface-variant)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">Register Organization</Link>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 bg-[var(--color-info-bg)] border border-[var(--color-info-border)] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-label-md text-[var(--color-info)]">
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Demo Credentials (no backend needed)</span>
          </div>
          <button
            type="button"
            onClick={() => { setEmail('user@medishare.health'); setPassword('demo1234') }}
            className="w-full text-left p-2.5 rounded-lg bg-white border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <div className="text-code-sm text-[var(--color-on-surface)]">user@medishare.health</div>
            <div className="text-code-sm text-[var(--color-outline)]">demo1234</div>
            <div className="text-label-sm text-[var(--color-primary)] mt-0.5">Dr. Eleanor Vance · Metro General Hospital</div>
          </button>
        </div>

        {/* Security notice */}
        <div className="mt-4 flex items-center justify-center gap-2 text-body-sm text-[var(--color-outline)]">
          <span className="material-symbols-outlined text-[16px] text-[var(--color-primary-container)]">lock</span>
          <span>Secured with JWT authentication · HIPAA compliant</span>
        </div>

        {/* Admin link */}
        <div className="mt-3 text-center">
          <p className="text-body-sm text-[var(--color-outline)]">
            Are you an administrator?{' '}
            <Link to="/admin/signin" className="text-[var(--color-tertiary)] font-semibold hover:underline inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield_person</span> Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
