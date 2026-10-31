import { useState, useEffect } from 'react'
import { batchApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Batch {
  id: number; medicineName: string; ndcCode: string; lotNumber: string; manufacturerName: string
  expiryDate: string; quantity: number; dosageForm: string; strength: string; storageType: string
  storageLog: string; status: string; specialNotes: string; organizationName: string; daysToExpiry: number
  createdAt: string; packagingIntegrity: boolean; notRecalled: boolean
}

const STATUS_BADGE: Record<string, string> = { PENDING_REVIEW: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' }

export default function MedicineVerification() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING_REVIEW')
  const [selected, setSelected] = useState<Batch | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [actioning, setActioning] = useState(false)

  const fetch = () => {
    setLoading(true)
    const params = filter === 'ALL' ? undefined : { status: filter }
    batchApi.getPending(params).then(r => setBatches(r.data)).catch(() => setBatches([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [filter])

  const handleReview = async (id: number, action: 'APPROVED' | 'REJECTED') => {
    setActioning(true)
    try {
      await batchApi.review(id, { status: action, reviewNote })
      toast.success(`Batch ${action === 'APPROVED' ? 'approved' : 'rejected'}`)
      setSelected(null); setReviewNote(''); fetch()
    } catch { toast.error('Action failed') } finally { setActioning(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Medicine Batch Verification</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Clinical pharmacist review queue for donated medicine batches.</p>
      </div>

      <div className="flex gap-2">
        {['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-label-md transition-colors ${filter === f ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'}`}>
            {f === 'ALL' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">inventory_2</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No batches in this queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>NDC</th><th>Lot #</th><th>Donor Org</th><th>Qty</th><th>Expiry</th><th>Storage</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id}>
                    <td className="font-semibold">{b.medicineName}<div className="text-body-sm text-[var(--color-outline)]">{(b.dosageForm || 'TABLET').replace('_', ' ')} {b.strength || ''}</div></td>
                    <td className="text-code-sm">{b.ndcCode}</td>
                    <td className="text-code-sm">{b.lotNumber}</td>
                    <td className="text-body-sm">{b.organizationName}</td>
                    <td className="font-semibold">{b.quantity}</td>
                    <td>
                      <div>{new Date(b.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-label-sm ${b.daysToExpiry < 30 ? 'text-[var(--color-danger)]' : b.daysToExpiry < 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>{b.daysToExpiry}d</div>
                    </td>
                    <td><span className="badge badge-info text-[10px]">{(b.storageType || 'AMBIENT').replace('_', ' ')}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>{b.status.replace('_', ' ')}</span></td>
                    <td>
                      <button onClick={() => { setSelected(b); setReviewNote('') }} className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">clinical_notes</span> Review
                      </button>
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
          <div className="modal-content mx-4 max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <h2 className="text-headline-md text-[var(--color-on-surface)]">Batch Review: {selected.medicineName}</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)]"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-body-sm">
                {[
                  ['NDC Code', selected.ndcCode], ['Lot #', selected.lotNumber], ['Manufacturer', selected.manufacturerName],
                  ['Dosage Form', `${(selected.dosageForm || 'TABLET').replace('_', ' ')} ${selected.strength || ''}`], ['Quantity', `${selected.quantity} units`],
                  ['Expiry', `${new Date(selected.expiryDate).toLocaleDateString()} (${selected.daysToExpiry}d remaining)`],
                  ['Storage', (selected.storageType || 'AMBIENT').replace('_', ' ')], ['Storage Logger', selected.storageLog || 'N/A'],
                  ['Donor Organization', selected.organizationName], ['Submitted', new Date(selected.createdAt).toLocaleString()],
                ].map(([l, v]) => (
                  <div key={l}><span className="text-label-sm text-[var(--color-outline)] block">{l}</span><span className="text-[var(--color-on-surface)] font-medium">{v}</span></div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${selected.packagingIntegrity ? 'border-[#BBF7D0] bg-[#DCFCE7]/30 text-[#15803D]' : 'border-[#FECACA] bg-[#FEE2E2]/30 text-[#B91C1C]'}`}>
                  <span className="material-symbols-outlined text-lg">{selected.packagingIntegrity ? 'check_circle' : 'cancel'}</span>
                  <span className="text-label-md">Packaging Integrity</span>
                </div>
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${selected.notRecalled ? 'border-[#BBF7D0] bg-[#DCFCE7]/30 text-[#15803D]' : 'border-[#FECACA] bg-[#FEE2E2]/30 text-[#B91C1C]'}`}>
                  <span className="material-symbols-outlined text-lg">{selected.notRecalled ? 'check_circle' : 'cancel'}</span>
                  <span className="text-label-md">Not Recalled</span>
                </div>
              </div>

              {selected.specialNotes && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
                  <span className="text-label-sm text-[var(--color-outline)]">Donor Notes:</span>
                  <p className="text-body-sm mt-0.5">{selected.specialNotes}</p>
                </div>
              )}

              {selected.daysToExpiry < 60 && (
                <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3 text-body-sm text-[#B91C1C]">
                  <strong>⚠️ Policy Violation:</strong> This batch has less than 60 days until expiry. MediShare policy requires ≥60 days. Consider rejecting.
                </div>
              )}

              <div>
                <label className="form-label">Review Notes</label>
                <textarea className="form-input pt-2 resize-none" rows={3} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Clinical review observations..." />
              </div>

              {selected.status === 'PENDING_REVIEW' && (
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => handleReview(selected.id, 'REJECTED')} disabled={actioning} className="px-4 py-2.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-label-md font-semibold border border-[#FECACA] hover:bg-[#FECACA] transition-colors">
                    <span className="material-symbols-outlined text-[18px] mr-1 align-middle">cancel</span> Reject Batch
                  </button>
                  <button onClick={() => handleReview(selected.id, 'APPROVED')} disabled={actioning} className="btn-primary px-5 py-2.5">
                    {actioning ? 'Processing...' : <><span className="material-symbols-outlined text-[18px]">verified</span> Approve & List</>}
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
