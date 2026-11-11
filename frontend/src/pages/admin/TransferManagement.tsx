import { useState, useEffect } from 'react'
import { transferApi } from '../../services/api'

interface Transfer {
  id: number; medicineName: string; ndcCode: string; quantity: number; status: string
  donorOrg: string; recipientOrg: string; dispatchedAt?: string | null; deliveredAt?: string | null
  trackingId?: string | null; temperatureStatus?: string | null; createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  APPROVED: 'badge-info', IN_TRANSIT: 'badge-warning', DELIVERED: 'badge-success',
  RECEIPT_CONFIRMED: 'badge-success', CANCELLED: 'badge-danger',
}

export default function TransferManagement() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    transferApi.getAll(filter !== 'ALL' ? { status: filter } : undefined)
      .then(r => setTransfers(r.data)).catch(() => setTransfers([])).finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Transfer Logistics Management</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Monitor all active and completed medicine transfers with cold-chain telemetry status.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'RECEIPT_CONFIRMED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'}`}>
            {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">local_shipping</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No transfers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>NDC</th><th>Qty</th><th>Donor → Recipient</th><th>Tracking</th><th>Cold-Chain</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.medicineName}</td>
                    <td className="text-code-sm">{t.ndcCode}</td>
                    <td className="font-semibold">{t.quantity}</td>
                    <td><div className="text-body-sm">{t.donorOrg}</div><div className="text-body-sm text-[var(--color-outline)]">→ {t.recipientOrg}</div></td>
                    <td className="text-code-sm text-[var(--color-outline)]">{t.trackingId || '—'}</td>
                    <td>
                      {t.temperatureStatus ? (
                        <span className={`badge ${t.temperatureStatus === 'COMPLIANT' ? 'badge-success' : 'badge-danger'}`}>
                          {t.temperatureStatus}
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[t.status] || 'badge-neutral'}`}>{t.status.replace(/_/g, ' ')}</span></td>
                    <td className="text-body-sm text-[var(--color-outline)]">{new Date(t.createdAt).toLocaleDateString()}</td>
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
