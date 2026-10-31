import { useState, useEffect } from 'react'
import { batchApi } from '../../services/api'

interface ExpiringBatch {
  id: number; medicineName: string; ndcCode: string; lotNumber: string; organizationName: string
  quantity: number; expiryDate: string; daysToExpiry: number; storageType: string; status: string
}

export default function ExpiryAlerts() {
  const [batches, setBatches] = useState<ExpiringBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')

  useEffect(() => {
    setLoading(true)
    batchApi.getPending({ expiringWithin: range, status: 'APPROVED' })
      .then(r => setBatches(r.data)).catch(() => setBatches([])).finally(() => setLoading(false))
  }, [range])

  const critical = batches.filter(b => b.daysToExpiry <= 7)
  const urgent = batches.filter(b => b.daysToExpiry > 7 && b.daysToExpiry <= 30)
  const warning = batches.filter(b => b.daysToExpiry > 30)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Expiry Alerts & Monitoring</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Proactive monitoring of medicine batches approaching expiration.</p>
        </div>
        <select className="form-select h-10 min-w-[180px]" value={range} onChange={e => setRange(e.target.value)}>
          <option value="7">Expiring in 7 days</option>
          <option value="30">Expiring in 30 days</option>
          <option value="60">Expiring in 60 days</option>
          <option value="90">Expiring in 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-[#FECACA] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#B91C1C]">emergency</span>
            <span className="text-label-md text-[#B91C1C]">CRITICAL (≤7 days)</span>
          </div>
          <span className="text-headline-lg text-[#B91C1C] font-bold">{critical.length}</span>
          <p className="text-body-sm text-[var(--color-outline)] mt-1">Batches requiring immediate withdrawal or expedited transfer</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-[#FDE68A] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#B45309]">warning</span>
            <span className="text-label-md text-[#B45309]">URGENT (8-30 days)</span>
          </div>
          <span className="text-headline-lg text-[#B45309] font-bold">{urgent.length}</span>
          <p className="text-body-sm text-[var(--color-outline)] mt-1">Batches needing priority transfer or donor notification</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-[var(--color-outline-variant)] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">schedule</span>
            <span className="text-label-md text-[var(--color-primary)]">WATCH (30+ days)</span>
          </div>
          <span className="text-headline-lg text-[var(--color-primary)] font-bold">{warning.length}</span>
          <p className="text-body-sm text-[var(--color-outline)] mt-1">Batches on monitoring list for upcoming expiration</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[#15803D]">check_circle</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No expiring batches in this range</p>
            <p className="text-body-md text-[var(--color-outline)]">All active listings have sufficient shelf life remaining.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>NDC</th><th>Lot</th><th>Organization</th><th>Qty</th><th>Expiry Date</th><th>Days Left</th><th>Severity</th></tr></thead>
              <tbody>
                {batches.sort((a, b) => a.daysToExpiry - b.daysToExpiry).map(b => (
                  <tr key={b.id} className={b.daysToExpiry <= 7 ? 'bg-[#FEE2E2]/20' : ''}>
                    <td className="font-semibold">{b.medicineName}</td>
                    <td className="text-code-sm">{b.ndcCode}</td>
                    <td className="text-code-sm">{b.lotNumber}</td>
                    <td>{b.organizationName}</td>
                    <td className="font-semibold">{b.quantity}</td>
                    <td>{new Date(b.expiryDate).toLocaleDateString()}</td>
                    <td className={`font-bold ${b.daysToExpiry <= 7 ? 'text-[#B91C1C]' : b.daysToExpiry <= 30 ? 'text-[#B45309]' : 'text-[var(--color-primary)]'}`}>{b.daysToExpiry}d</td>
                    <td>
                      <span className={`badge ${b.daysToExpiry <= 7 ? 'badge-danger' : b.daysToExpiry <= 30 ? 'badge-warning' : 'badge-info'}`}>
                        {b.daysToExpiry <= 7 ? 'CRITICAL' : b.daysToExpiry <= 30 ? 'URGENT' : 'WATCH'}
                      </span>
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
