import { useState, useEffect } from 'react'
import { requestApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Req {
  id: number; medicineName: string; ndcCode: string; requestedQuantity: number
  status: string; requesterOrg: string; donorOrg: string; clinicalNote: string; createdAt: string
}

const STATUS_BADGE: Record<string, string> = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-neutral' }

export default function RequestApproval() {
  const [requests, setRequests] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selected, setSelected] = useState<Req | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [actioning, setActioning] = useState(false)

  const fetch = () => {
    setLoading(true)
    requestApi.getAll(filter !== 'ALL' ? { status: filter } : undefined)
      .then(r => setRequests(r.data)).catch(() => setRequests([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [filter])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActioning(true)
    try {
      if (action === 'approve') await requestApi.approve(id)
      else await requestApi.reject(id, { reviewNote })
      toast.success(`Request ${action}d`)
      setSelected(null); setReviewNote(''); fetch()
    } catch { toast.error('Action failed') } finally { setActioning(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Request Approval Queue</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Review and approve or reject stock requisitions from recipient organizations.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'}`}>
            {f === 'ALL' ? 'All' : f}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">fact_check</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No requests in this queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>NDC</th><th>Qty</th><th>Requester</th><th>Donor</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.medicineName}</td>
                    <td className="text-code-sm">{r.ndcCode}</td>
                    <td className="font-semibold">{r.requestedQuantity} units</td>
                    <td>{r.requesterOrg}</td>
                    <td>{r.donorOrg}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-neutral'}`}>{r.status}</span></td>
                    <td className="text-body-sm text-[var(--color-outline)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => { setSelected(r); setReviewNote('') }} className="text-label-sm text-[var(--color-primary)] hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <h2 className="text-headline-md text-[var(--color-on-surface)]">Review Request</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)]"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)] space-y-2">
                <h3 className="text-headline-sm">{selected.medicineName}</h3>
                <p className="text-code-sm text-[var(--color-outline)]">{selected.ndcCode}</p>
                <div className="grid grid-cols-2 gap-2 text-body-sm mt-2">
                  <div><span className="text-[var(--color-outline)] text-label-sm block">Requested Qty</span><span className="font-semibold">{selected.requestedQuantity} units</span></div>
                  <div><span className="text-[var(--color-outline)] text-label-sm block">Requester</span><span className="font-semibold">{selected.requesterOrg}</span></div>
                  <div><span className="text-[var(--color-outline)] text-label-sm block">Donor</span><span className="font-semibold">{selected.donorOrg}</span></div>
                  <div><span className="text-[var(--color-outline)] text-label-sm block">Date</span><span>{new Date(selected.createdAt).toLocaleString()}</span></div>
                </div>
                {selected.clinicalNote && <div className="mt-2"><span className="text-label-sm text-[var(--color-outline)]">Clinical Note:</span><p className="text-body-sm mt-0.5">{selected.clinicalNote}</p></div>}
              </div>
              {selected.status === 'PENDING' && (
                <>
                  <div>
                    <label className="form-label">Admin Notes (for rejection)</label>
                    <textarea className="form-input pt-2 resize-none" rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Reason for rejection..." />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => handleAction(selected.id, 'reject')} disabled={actioning} className="px-4 py-2 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-label-md font-semibold border border-[#FECACA]">Reject</button>
                    <button onClick={() => handleAction(selected.id, 'approve')} disabled={actioning} className="btn-primary px-5">
                      {actioning ? 'Processing...' : <><span className="material-symbols-outlined text-[18px]">task_alt</span> Approve & Create Transfer</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
