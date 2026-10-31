import { useAuth } from '../../contexts/AuthContext'

export default function UserSettings() {
  const { user } = useAuth()
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
            <input className="form-input" defaultValue={user?.fullName} readOnly />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" defaultValue={user?.email} readOnly />
          </div>
          <div>
            <label className="form-label">Role</label>
            <input className="form-input" value={user?.role === 'USER' ? 'Organization User' : 'Administrator'} readOnly />
          </div>
          <div>
            <label className="form-label">Organization</label>
            <input className="form-input" value={user?.organizationName || 'N/A'} readOnly />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
        <h2 className="text-headline-sm text-[var(--color-on-surface)]">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">lock</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Change Password</p>
                <p className="text-body-sm text-[var(--color-outline)]">Update your authentication password</p>
              </div>
            </div>
            <button className="btn-secondary text-label-sm">Update</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">security</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Two-Factor Authentication</p>
                <p className="text-body-sm text-[var(--color-outline)]">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button className="btn-secondary text-label-sm">Enable</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">devices</span>
              <div>
                <p className="text-label-md text-[var(--color-on-surface)]">Active Sessions</p>
                <p className="text-body-sm text-[var(--color-outline)]">Manage your active login sessions</p>
              </div>
            </div>
            <button className="btn-secondary text-label-sm">Manage</button>
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
            <input type="checkbox" defaultChecked={defaultChecked} className="w-5 h-5 rounded text-[var(--color-primary)]" />
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
          <button className="btn-danger">Deactivate</button>
        </div>
      </div>
    </div>
  )
}
