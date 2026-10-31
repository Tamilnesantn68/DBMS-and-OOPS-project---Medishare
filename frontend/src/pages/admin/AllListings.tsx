import { useState, useEffect } from 'react'
import { batchApi } from '../../services/api'

interface Batch {
  id: number; medicineName: string; ndcCode: string; lotNumber: string; organizationName: string
  quantity: number; expiryDate: string; status: string; storageType: string; daysToExpiry: number
}

const STATUS_BADGE: Record<string, string> = { PENDING_REVIEW: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', WITHDRAWN: 'badge-neutral' }

export default function AllListings() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    batchApi.getAll(search ? { q: search } : {})
      .then(r => setBatches(r.data)).catch(() => setBatches([])).finally(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">All Medicine Listings</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Complete registry of all medicine batches across the network.</p>
        </div>
        <div className="relative min-w-[240px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input className="form-input pl-9" placeholder="Search NDC, name, lot..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>NDC</th><th>Lot</th><th>Donor Org</th><th>Qty</th><th>Expiry</th><th>Storage</th><th>Status</th></tr></thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id}>
                    <td className="font-semibold">{b.medicineName}</td>
                    <td className="text-code-sm">{b.ndcCode}</td>
                    <td className="text-code-sm">{b.lotNumber}</td>
                    <td>{b.organizationName}</td>
                    <td className="font-semibold">{b.quantity}</td>
                    <td>
                      <div>{new Date(b.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-label-sm ${b.daysToExpiry < 30 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>{b.daysToExpiry}d</div>
                    </td>
                    <td><span className="badge badge-info text-[10px]">{b.storageType.replace('_', ' ')}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>{b.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-[var(--color-outline)]">No listings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
