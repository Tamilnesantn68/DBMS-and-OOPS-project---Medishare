import { useState, useEffect } from 'react'
import { batchApi } from '../../services/api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Batch {
  id: number
  medicineName: string
  ndcCode: string
  lotNumber: string
  expiryDate: string
  quantity: number
  status: string
  storageType: string
  createdAt: string
  daysToExpiry: number
  reviewNote?: string
}

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  WITHDRAWN: 'badge-neutral',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved & Listed',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export default function MyDonations() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null)

  const fetchBatches = () => {
    setLoading(true)
    batchApi.getMy(filter !== 'ALL' ? { status: filter } : undefined)
      .then(r => setBatches(r.data))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBatches() }, [filter])

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this batch from the marketplace?')) return
    setWithdrawingId(id)
    try {
      await batchApi.withdraw(id)
      toast.success('Batch withdrawn')
      fetchBatches()
    } catch {
      toast.error('Failed to withdraw batch')
    } finally {
      setWithdrawingId(null)
    }
  }

  const FILTERS = ['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">My Donated Batches</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Track and manage all your medicine donation submissions.</p>
        </div>
        <Link to="/portal/donate" className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Donate New Batch</span>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]'}`}
          >
            {f === 'ALL' ? 'All Batches' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[var(--color-surface-container)] rounded animate-pulse" />)}
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">inventory_2</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No batches found</p>
            <p className="text-body-md text-[var(--color-outline)] mt-1">Start donating to make a difference.</p>
            <Link to="/portal/donate" className="btn-primary mt-4 inline-flex">+ Donate First Batch</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>NDC Code</th>
                  <th>Lot #</th>
                  <th>Expiry</th>
                  <th>Qty</th>
                  <th>Storage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="font-semibold text-[var(--color-on-surface)]">{b.medicineName}</div>
                      <div className="text-body-sm text-[var(--color-outline)]">Added {new Date(b.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="text-code-sm text-[var(--color-outline)]">{b.ndcCode}</td>
                    <td className="text-code-sm">{b.lotNumber}</td>
                    <td>
                      <div className="text-body-md">{new Date(b.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-label-sm ${b.daysToExpiry < 30 ? 'text-[var(--color-danger)]' : b.daysToExpiry < 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                        {b.daysToExpiry}d left
                      </div>
                    </td>
                    <td className="font-semibold">{b.quantity}</td>
                    <td>
                      <span className="badge badge-info">{b.storageType.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>{STATUS_LABEL[b.status] || b.status}</span>
                      {b.reviewNote && b.status === 'REJECTED' && (
                        <p className="text-body-sm text-[var(--color-danger)] mt-1 text-[11px]">{b.reviewNote}</p>
                      )}
                    </td>
                    <td>
                      {b.status === 'APPROVED' && (
                        <button
                          onClick={() => handleWithdraw(b.id)}
                          disabled={withdrawingId === b.id}
                          className="btn-danger text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[14px]">undo</span>
                          {withdrawingId === b.id ? 'Withdrawing...' : 'Withdraw'}
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
