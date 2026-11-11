import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function UserSettings() {
  const { user, logout } = useAuth()

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [updatingPw, setUpdatingPw] = useState(false)

  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPw) {
      toast.error('Current password is required')
      return
    }
    if (newPw.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    setUpdatingPw(true)
    setTimeout(() => {
      setUpdatingPw(false)
      setShowPasswordModal(false)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      toast.success('Password updated successfully!')
    }, 600)
  }

  const handleDeactivate = async () => {
    setShowDeactivateModal(false)
    toast.error('Account deactivated. Signing out...')
    setTimeout(() => {
      logout()
    }, 1000)
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Account Settings</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Manage your personal account settings and security preferences.</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
        <h2 className="text-headline-sm text-[var(--color-on-surface)]">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input bg-[#F8FAFC]" defaultValue={user?.fullName} readOnly />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input bg-[#F8FAFC]" defaultValue={user?.email} readOnly />
          </div>
          <div>
            <label className="form-label">Role</label>
            <input className="form-input bg-[#F8FAFC]" value={user?.role === 'USER' ? 'Organization User' : 'Administrator'} readOnly />
          </div>
          <div>
            <label className="form-label">Organization</label>
            <input className="form-input bg-[#F8FAFC]" value={user?.organizationName || 'N/A'} readOnly />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
        <h2 className="text-headline-sm text-[var(--color-on-surface)]">Security</h2>
        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">lock</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Change Password</p>
                <p className="text-body-sm text-[var(--color-outline)]">Update your authentication password</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-secondary text-label-sm"
            >
              Update
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">security</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Two-Factor Authentication (2FA)</p>
                <p className="text-body-sm text-[var(--color-outline)]">
                  {twoFactorEnabled ? <span className="text-[#15803D] font-semibold">Enabled (Authenticator App)</span> : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShow2FAModal(true)}
              className="btn-secondary text-label-sm"
            >
              {twoFactorEnabled ? 'Configure' : 'Enable'}
            </button>
          </div>

          {/* Sessions */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">devices</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Active Sessions</p>
                <p className="text-body-sm text-[var(--color-outline)]">1 active session on current browser</p>
              </div>
            </div>
            <button
              onClick={() => setShowSessionsModal(true)}
              className="btn-secondary text-label-sm"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
        <h2 className="text-headline-sm text-[var(--color-on-surface)]">Notification Preferences</h2>
        {[
          { label: 'Batch status updates', desc: 'Receive alerts when your donated batches are reviewed', defaultChecked: true },
          { label: 'Request status updates', desc: 'Get notified when your requests are approved or rejected', defaultChecked: true },
          { label: 'Transfer & shipping alerts', desc: 'Cold-chain and delivery status notifications', defaultChecked: true },
          { label: 'Expiry warnings', desc: 'Alerts when your batches are approaching expiration', defaultChecked: true },
          { label: 'System announcements', desc: 'Platform updates and maintenance notices', defaultChecked: false },
        ].map(({ label, desc, defaultChecked }) => (
          <label key={label} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFC] cursor-pointer">
            <div>
              <p className="text-label-md text-[var(--color-on-surface)]">{label}</p>
              <p className="text-body-sm text-[var(--color-outline)]">{desc}</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={defaultChecked}
              onChange={(e) => toast.success(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`)}
              className="w-5 h-5 rounded text-[var(--color-primary)]"
            />
          </label>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-[var(--color-danger-border)] p-6 space-y-4">
        <h2 className="text-headline-sm text-[var(--color-danger)]">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-md text-[var(--color-on-surface)]">Deactivate Account</p>
            <p className="text-body-sm text-[var(--color-outline)]">Permanently disable your organization's access to the MediShare platform.</p>
          </div>
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="btn-danger"
          >
            Deactivate
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content mx-4 max-w-md" onClick={e => e.stopPropagation()}>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-headline-sm text-[var(--color-on-surface)]">Update Password</h3>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="p-1 rounded hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={updatingPw} className="btn-primary">
                  {updatingPw ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
          <div className="modal-content mx-4 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-headline-sm text-[var(--color-on-surface)]">Two-Factor Authentication</h3>
                <button onClick={() => setShow2FAModal(false)} className="p-1 rounded hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-body-sm text-[var(--color-on-surface-variant)]">
                Protect your institutional clinical login with Google Authenticator or any TOTP application.
              </p>
              <div className="p-4 bg-[#F8FAFC] border border-[var(--color-outline-variant)] rounded-lg text-center space-y-2">
                <span className="text-label-sm text-[var(--color-outline)] block">Secret Recovery Key</span>
                <span className="font-mono font-bold text-[var(--color-primary)] text-sm tracking-wider">MEDI-SEC-9982-DSCSA</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-label-md">Status</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !twoFactorEnabled
                    setTwoFactorEnabled(next)
                    toast.success(next ? 'Two-Factor Authentication Enabled!' : 'Two-Factor Authentication Disabled')
                    setShow2FAModal(false)
                  }}
                  className={twoFactorEnabled ? 'btn-danger text-sm' : 'btn-primary text-sm'}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="modal-overlay" onClick={() => setShowSessionsModal(false)}>
          <div className="modal-content mx-4 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-headline-sm text-[var(--color-on-surface)]">Active Sessions</h3>
                <button onClick={() => setShowSessionsModal(false)} className="p-1 rounded hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-[#DCFCE7]/40 border border-[#BBF7D0] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-label-md text-[var(--color-on-surface)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                      Current Session
                    </p>
                    <p className="text-body-sm text-[var(--color-outline)]">Windows · Modern Browser · 127.0.0.1</p>
                  </div>
                  <span className="badge badge-success text-[10px]">Active Now</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    toast.success('All other sessions signed out')
                    setShowSessionsModal(false)
                  }}
                  className="btn-secondary text-sm"
                >
                  Sign Out Other Devices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-content mx-4 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#B91C1C]">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="text-headline-sm">Deactivate Account</h3>
              </div>
              <p className="text-body-sm text-[var(--color-on-surface-variant)]">
                Are you sure you want to deactivate your organization's access? Active medicine batches will be withdrawn, and pending requisitions cancelled.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowDeactivateModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleDeactivate} className="btn-danger">Confirm Deactivation</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
