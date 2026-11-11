import { useState, useEffect } from 'react'
import { transferApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Transfer {
  id: number
  medicineName: string
  ndcCode: string
  quantity: number
  status: string
  donorOrg: string
  recipientOrg: string
  dispatchedAt?: string | null
  deliveredAt?: string | null
  trackingId?: string | null
  temperatureStatus?: string | null
}

const STATUS_CONFIG: Record<string, { badge: string; label: string; progress: number }> = {
  APPROVED: { badge: 'badge-info', label: 'Ready for Dispatch', progress: 20 },
  IN_TRANSIT: { badge: 'badge-warning', label: 'In Transit', progress: 60 },
  DELIVERED: { badge: 'badge-success', label: 'Delivered', progress: 100 },
  RECEIPT_CONFIRMED: { badge: 'badge-success', label: 'Completed', progress: 100 },
  CANCELLED: { badge: 'badge-danger', label: 'Cancelled', progress: 0 },
}

export default function MyTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [receiptModal, setReceiptModal] = useState<Transfer | null>(null)
  const [tempStatus, setTempStatus] = useState('COMPLIANT')
  const [receiptNote, setReceiptNote] = useState('')

  const fetch = () => {
    setLoading(true)
    transferApi.getMy().then(r => setTransfers(r.data)).catch(() => setTransfers([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleConfirmReceipt = async () => {
    if (!receiptModal) return
    setConfirmingId(receiptModal.id)
    try {
      await transferApi.confirmReceipt(receiptModal.id, { temperatureStatus: tempStatus, receiptNote })
      toast.success('Receipt confirmed! Transfer closed.')
      setReceiptModal(null)
      fetch()
    } catch { toast.error('Failed to confirm receipt') } finally { setConfirmingId(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">My Transfers</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Track cold-chain shipment status for your pending medicine transfers.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white border border-[var(--color-outline-variant)] rounded-xl animate-pulse" />)}</div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[var(--color-outline-variant)]">
          <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">local_shipping</span>
          <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No transfers yet</p>
          <p className="text-body-md text-[var(--color-outline)] mt-1">Transfers appear here once your requests are approved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map(t => {
            const cfg = STATUS_CONFIG[t.status] || { badge: 'badge-neutral', label: t.status, progress: 0 }
            return (
              <div key={t.id} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">local_shipping</span>
                      </div>
                      <div>
                        <h3 className="text-headline-sm text-[var(--color-on-surface)]">{t.medicineName}</h3>
                        <p className="text-code-sm text-[var(--color-outline)]">{t.ndcCode} · {t.quantity} units</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-body-sm text-[var(--color-on-surface-variant)]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">upload</span>
                            From: <strong>{t.donorOrg}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[var(--color-secondary)]">download</span>
                            To: <strong>{t.recipientOrg}</strong>
                          </span>
                          {t.trackingId && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">qr_code_2</span>
                              Track: <span className="font-mono">{t.trackingId}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-label-sm text-[var(--color-outline)] mb-1">
                        <span>{cfg.label}</span>
                        <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary-container)] rounded-full transition-all duration-700" style={{ width: `${cfg.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--color-outline)] mt-0.5">
                        <span>Approved</span><span>In Transit</span><span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-fit">
                    {t.temperatureStatus && (
                      <span className={`badge ${t.temperatureStatus === 'COMPLIANT' ? 'badge-success' : 'badge-danger'} flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]">{t.temperatureStatus === 'COMPLIANT' ? 'ac_unit' : 'thermostat'}</span>
                        Cold-chain: {t.temperatureStatus}
                      </span>
                    )}
                    {t.status === 'DELIVERED' && (
                      <button onClick={() => { setReceiptModal(t); setTempStatus('COMPLIANT'); setReceiptNote('') }} className="btn-primary">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        Confirm Receipt
                      </button>
                    )}
                    {t.status === 'RECEIPT_CONFIRMED' && (
                      <span className="flex items-center gap-1 text-[#15803D] text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[18px]">task_alt</span> Transfer Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Receipt Confirmation Modal */}
      {receiptModal && (
        <div className="modal-overlay" onClick={() => setReceiptModal(null)}>
          <div className="modal-content mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <h2 className="text-headline-md text-[var(--color-on-surface)]">Confirm Receipt of Transfer</h2>
                <button onClick={() => setReceiptModal(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
                <p className="font-semibold">{receiptModal.medicineName}</p>
                <p className="text-body-sm text-[var(--color-outline)]">{receiptModal.quantity} units from {receiptModal.donorOrg}</p>
              </div>
              <div>
                <label className="form-label">Cold-Chain Temperature Status *</label>
                <select className="form-select" value={tempStatus} onChange={e => setTempStatus(e.target.value)}>
                  <option value="COMPLIANT">Compliant — All readings within specification</option>
                  <option value="MINOR_EXCURSION">Minor Excursion — Deviation logged but within acceptable range</option>
                  <option value="CRITICAL_EXCURSION">Critical Excursion — Deviation outside acceptable limits (QA review)</option>
                </select>
              </div>
              {tempStatus !== 'COMPLIANT' && (
                <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3 text-body-sm">
                  <strong>⚠️ Excursion Alert:</strong> Temperature deviations require QA documentation and may result in batch rejection. Provide detailed notes below.
                </div>
              )}
              <div>
                <label className="form-label">Receipt Notes</label>
                <textarea rows={3} className="form-input pt-2 resize-none" value={receiptNote} onChange={e => setReceiptNote(e.target.value)} placeholder="Describe any observations, packaging condition, or excursion details..." />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setReceiptModal(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleConfirmReceipt} disabled={!!confirmingId} className="btn-primary">
                  {confirmingId ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</> : <><span className="material-symbols-outlined">task_alt</span> Confirm Receipt & Close Transfer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
