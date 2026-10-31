import { useState, useEffect } from 'react'
import { orgApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface OrgData {
  id: number
  name: string
  type: string
  registrationNumber: string
  licenceReference: string
  address: string
  city: string
  state: string
  zip: string
  storageType: string
  contactName: string
  contactLicence: string
  email: string
  status: string
  verifiedAt?: string
  createdAt: string
}

export default function OrganizationProfile() {
  const { user } = useAuth()
  const [org, setOrg] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<OrgData>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    orgApi.getMyOrg().then(r => { setOrg(r.data); setForm(r.data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await orgApi.updateMyOrg(form)
      setOrg(data)
      setEditing(false)
      toast.success('Organization profile updated')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-[var(--color-outline-variant)] rounded-xl animate-pulse" />)}</div>

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Organization Profile</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Manage your organization's credentials and facility details.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
          </button>
        )}
      </div>

      {/* Status Banner */}
      {org && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${org.status === 'VERIFIED' ? 'bg-[#DCFCE7]/40 border-[#BBF7D0]' : org.status === 'PENDING' ? 'bg-[#FEF3C7]/40 border-[#FDE68A]' : 'bg-[#FEE2E2]/40 border-[#FECACA]'}`}>
          <span className={`material-symbols-outlined text-xl ${org.status === 'VERIFIED' ? 'text-[#15803D]' : org.status === 'PENDING' ? 'text-[#B45309]' : 'text-[#B91C1C]'}`}>
            {org.status === 'VERIFIED' ? 'verified' : org.status === 'PENDING' ? 'pending' : 'error'}
          </span>
          <div>
            <span className="text-label-md text-[var(--color-on-surface)]">
              {org.status === 'VERIFIED' ? 'Organization Verified' : org.status === 'PENDING' ? 'Verification Pending' : 'Verification Issue'}
            </span>
            {org.verifiedAt && <span className="text-body-sm text-[var(--color-outline)] ml-2">Verified on {new Date(org.verifiedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-6">
        {editing ? (
          <>
            <h2 className="text-headline-sm text-[var(--color-on-surface)]">Edit Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Organization Name</label>
                <input className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Registration Number</label>
                <input className="form-input font-mono" value={form.registrationNumber || ''} onChange={e => setForm({...form, registrationNumber: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Street Address</label>
                <input className="form-input" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div>
                <label className="form-label">City</label>
                <input className="form-input" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
              <div>
                <label className="form-label">State</label>
                <input className="form-input" value={form.state || ''} onChange={e => setForm({...form, state: e.target.value})} />
              </div>
              <div>
                <label className="form-label">ZIP Code</label>
                <input className="form-input" value={form.zip || ''} onChange={e => setForm({...form, zip: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Contact Person</label>
                <input className="form-input" value={form.contactName || ''} onChange={e => setForm({...form, contactName: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Contact Licence</label>
                <input className="form-input font-mono" value={form.contactLicence || ''} onChange={e => setForm({...form, contactLicence: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setEditing(false); setForm(org || {}) }} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-outline-variant)]">
              <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">business</span>
              </div>
              <div>
                <h2 className="text-headline-md text-[var(--color-on-surface)]">{org?.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge badge-info">{org?.type?.replace('_', ' ')}</span>
                  <span className="text-code-sm text-[var(--color-outline)]">Reg# {org?.registrationNumber}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {[
                ['DEA / Licence Ref', org?.licenceReference || 'N/A'],
                ['Email', org?.email || user?.email],
                ['Address', `${org?.address}, ${org?.city}, ${org?.state} ${org?.zip}`],
                ['Storage Capability', org?.storageType?.replace('_', ' ')],
                ['Contact Person', org?.contactName],
                ['Contact Licence', org?.contactLicence || 'N/A'],
                ['Registered Since', org?.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span className="text-label-sm text-[var(--color-outline)] block">{label}</span>
                  <span className="text-body-md text-[var(--color-on-surface)] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
