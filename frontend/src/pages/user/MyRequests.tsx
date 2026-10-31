import { useState, useEffect } from 'react'
import { requestApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Request { id: number; medicineName: string; ndcCode: string; requestedQuantity: number; status: string; donorOrganization: string; adminNote?: string; createdAt: string }

const STATUS_BADGE: Record<string, string> = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-neutral' }
const STATUS_LABEL: Record<string, string> = { PENDING: 'Pending Approval', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' }

export default function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const fetch = () => {
    setLoading(true)
    requestApi.getMy(filter !== 'ALL' ? { status: filter } : undefined)
      .then(r => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [filter])

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this request?')) return
    setCancellingId(id)
    try {
      await requestApi.cancel(id)
      toast.success('Request cancelled')
      fetch()
    } catch { toast.error('Failed to cancel') } finally { setCancellingId(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">My Medicine Requests</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Track the status of all your requisitions from the marketplace.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]'}`}>
            {f === 'ALL' ? 'All Requests' : STATUS_LABEL[f] || f}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">fact_check</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No requests found</p>
            <p className="text-body-md text-[var(--color-outline)] mt-1">Browse the marketplace to find available medicines.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>NDC</th>
                  <th>Qty</th>
                  <th>Donor Org</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.medicineName}</td>
                    <td className="text-code-sm text-[var(--color-outline)]">{r.ndcCode}</td>
                    <td className="font-semibold">{r.requestedQuantity} units</td>
                    <td>{r.donorOrganization}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[r.status] || 'badge-neutral'}`}>{STATUS_LABEL[r.status] || r.status}</span>
                      {r.adminNote && r.status === 'REJECTED' && (
                        <p className="text-[11px] text-[var(--color-danger)] mt-0.5">{r.adminNote}</p>
                      )}
                    </td>
                    <td className="text-body-sm text-[var(--color-outline)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleCancel(r.id)} disabled={cancellingId === r.id} className="btn-danger">
                          {cancellingId === r.id ? 'Cancelling...' : <><span className="material-symbols-outlined text-[14px]">cancel</span> Cancel</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
