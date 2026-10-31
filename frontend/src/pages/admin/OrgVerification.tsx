import { useState, useEffect } from 'react'
import { orgApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Org {
  id: number; name: string; type: string; registrationNumber: string; licenceReference: string
  address: string; city: string; state: string; zip: string; contactName: string; contactLicence: string
  email: string; status: string; storageType: string; createdAt: string; documentUrl?: string
}

const STATUS_BADGE: Record<string, string> = { PENDING: 'badge-warning', VERIFIED: 'badge-success', REJECTED: 'badge-danger', SUSPENDED: 'badge-neutral' }

export default function OrgVerification() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selected, setSelected] = useState<Org | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [actioning, setActioning] = useState(false)

  const fetch = () => {
    setLoading(true)
    orgApi.getAll(filter !== 'ALL' ? { status: filter } : undefined)
      .then(r => setOrgs(r.data)).catch(() => setOrgs([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [filter])

  const handleAction = async (orgId: number, action: 'VERIFIED' | 'REJECTED') => {
    setActioning(true)
    try {
      await orgApi.updateVerification(orgId, { status: action, reviewNote })
      toast.success(`Organization ${action === 'VERIFIED' ? 'verified' : 'rejected'}`)
      setSelected(null)
      setReviewNote('')
      fetch()
    } catch { toast.error('Action failed') } finally { setActioning(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Organization Verification Queue</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Review and verify healthcare organization credential applications.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]'}`}>
            {f === 'ALL' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">verified_user</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No organizations in this queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Organization</th><th>Type</th><th>Registration #</th><th>Contact</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {orgs.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="font-semibold text-[var(--color-on-surface)]">{o.name}</div>
                      <div className="text-body-sm text-[var(--color-outline)]">{o.city}, {o.state}</div>
                    </td>
                    <td><span className="badge badge-info">{o.type?.replace('_', ' ')}</span></td>
                    <td className="text-code-sm">{o.registrationNumber}</td>
                    <td>
                      <div className="text-body-sm">{o.contactName}</div>
                      <div className="text-body-sm text-[var(--color-outline)]">{o.email}</div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>{o.status}</span></td>
                    <td className="text-body-sm text-[var(--color-outline)]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => { setSelected(o); setReviewNote('') }} className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">visibility</span> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content mx-4 max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <h2 className="text-headline-md text-[var(--color-on-surface)]">Review: {selected.name}</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-body-sm">
                {[
                  ['Type', selected.type?.replace('_', ' ')],
                  ['Registration #', selected.registrationNumber],
                  ['DEA / Licence', selected.licenceReference || 'N/A'],
                  ['Contact', `${selected.contactName} (${selected.contactLicence})`],
                  ['Email', selected.email],
                  ['Address', `${selected.address}, ${selected.city}, ${selected.state} ${selected.zip}`],
                  ['Storage', selected.storageType?.replace('_', ' ')],
                  ['Applied', new Date(selected.createdAt).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-label-sm text-[var(--color-outline)] block">{label}</span>
                    <span className="text-[var(--color-on-surface)] font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {selected.documentUrl && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">description</span>
                  <span className="text-label-md text-[var(--color-on-surface)]">Uploaded Credential Document</span>
                  <a href={selected.documentUrl} target="_blank" rel="noopener" className="text-[var(--color-primary)] text-label-sm ml-auto hover:underline">View Document →</a>
                </div>
              )}

              <div>
                <label className="form-label">Review Notes (visible to applicant on rejection)</label>
                <textarea className="form-input pt-2 resize-none" rows={3} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Provide rationale for approval or rejection..." />
              </div>

              {selected.status === 'PENDING' && (
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => handleAction(selected.id, 'REJECTED')} disabled={actioning} className="px-4 py-2.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-label-md font-semibold border border-[#FECACA] hover:bg-[#FECACA] transition-colors">
                    <span className="material-symbols-outlined text-[18px] mr-1 align-middle">cancel</span> Reject Application
                  </button>
                  <button onClick={() => handleAction(selected.id, 'VERIFIED')} disabled={actioning} className="btn-primary px-5 py-2.5">
                    {actioning ? 'Processing...' : <><span className="material-symbols-outlined text-[18px]">verified</span> Verify & Approve</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
