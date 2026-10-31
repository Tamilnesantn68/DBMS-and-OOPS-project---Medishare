import { useState, useEffect } from 'react'
import { marketplaceApi, requestApi } from '../../services/api'
import toast from 'react-hot-toast'

interface MarketplaceBatch {
  id: number
  medicineName: string
  ndcCode: string
  lotNumber: string
  expiryDate: string
  availableQuantity: number
  storageType: string
  donorOrganization: string
  daysToExpiry: number
  dosageForm: string
  strength: string
}

export default function RequestMedicines() {
  const [batches, setBatches] = useState<MarketplaceBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [storageFilter, setStorageFilter] = useState('ALL')
  const [requestModal, setRequestModal] = useState<MarketplaceBatch | null>(null)
  const [requestQty, setRequestQty] = useState(1)
  const [requestNote, setRequestNote] = useState('')
  const [requesting, setRequesting] = useState(false)

  const fetchBatches = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search) params.q = search
    if (storageFilter !== 'ALL') params.storageType = storageFilter
    marketplaceApi.getAll(params)
      .then(r => setBatches(r.data))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBatches() }, [search, storageFilter])

  const handleRequest = async () => {
    if (!requestModal) return
    if (requestQty <= 0 || requestQty > requestModal.availableQuantity) {
      toast.error(`Quantity must be 1 - ${requestModal.availableQuantity}`)
      return
    }
    setRequesting(true)
    try {
      await requestApi.create({ batchId: requestModal.id, requestedQuantity: requestQty, clinicalNote: requestNote })
      toast.success('Request submitted! Awaiting admin approval.')
      setRequestModal(null)
      setRequestQty(1)
      setRequestNote('')
      fetchBatches()
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{message?:string}}})?.response?.data?.message
      toast.error(msg || 'Failed to submit request')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Medicine Marketplace</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Browse available vetted medicine batches from verified donor organizations.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-grow min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            className="form-input pl-9 h-10"
            placeholder="Search by name, NDC, lot..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select h-10 min-w-[160px]" value={storageFilter} onChange={e => setStorageFilter(e.target.value)}>
          <option value="ALL">All Storage Types</option>
          <option value="AMBIENT">Ambient</option>
          <option value="REFRIGERATED">Refrigerated</option>
          <option value="FROZEN">Frozen</option>
          <option value="DEEP_FROZEN">Ultra-Low Freeze</option>
        </select>
      </div>

      {/* Batch cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white border border-[var(--color-outline-variant)] rounded-xl animate-pulse" />)}
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">storefront</span>
          <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No medicines available</p>
          <p className="text-body-md text-[var(--color-outline)] mt-1">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-headline-sm text-[var(--color-on-surface)]">{b.medicineName}</h3>
                  <span className="text-code-sm text-[var(--color-outline)]">{b.ndcCode}</span>
                </div>
                <span className={`badge ${b.daysToExpiry < 30 ? 'badge-danger' : b.daysToExpiry < 60 ? 'badge-warning' : 'badge-success'}`}>
                  {b.daysToExpiry}d left
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-body-sm text-[var(--color-on-surface-variant)] mb-3">
                <div className="bg-[#F8FAFC] p-2 rounded border border-[var(--color-outline-variant)]">
                  <span className="block text-label-sm text-[var(--color-outline)]">Lot#</span>
                  <span className="font-mono font-semibold">{b.lotNumber}</span>
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded border border-[var(--color-outline-variant)]">
                  <span className="block text-label-sm text-[var(--color-outline)]">Available</span>
                  <span className="font-semibold text-[var(--color-primary)]">{b.availableQuantity} units</span>
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded border border-[var(--color-outline-variant)]">
                  <span className="block text-label-sm text-[var(--color-outline)]">Storage</span>
                  <span className="badge badge-info text-[10px]">{(b.storageType || 'AMBIENT').replace('_', ' ')}</span>
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded border border-[var(--color-outline-variant)]">
                  <span className="block text-label-sm text-[var(--color-outline)]">Form</span>
                  <span className="text-[var(--color-on-surface)] text-[12px]">{(b.dosageForm || 'TABLET').replace('_', ' ')} {b.strength || ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-body-sm text-[var(--color-outline)] mb-4">
                <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">verified_user</span>
                <span>Donor: <strong className="text-[var(--color-on-surface)]">{b.donorOrganization}</strong></span>
              </div>

              <button
                onClick={() => { setRequestModal(b); setRequestQty(1); setRequestNote('') }}
                className="w-full btn-primary justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Request This Batch</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {requestModal && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="modal-content mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-headline-md text-[var(--color-on-surface)]">Request Medicine Batch</h2>
                  <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Submit a clinical requisition for this batch.</p>
                </div>
                <button onClick={() => setRequestModal(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
                <h3 className="text-headline-sm">{requestModal.medicineName}</h3>
                <p className="text-code-sm text-[var(--color-outline)]">{requestModal.ndcCode} · Lot {requestModal.lotNumber}</p>
                <p className="text-body-sm mt-1">Available: <strong className="text-[var(--color-primary)]">{requestModal.availableQuantity} units</strong> · Expires {new Date(requestModal.expiryDate).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="form-label">Requested Quantity *</label>
                <input
                  type="number"
                  min={1}
                  max={requestModal.availableQuantity}
                  value={requestQty}
                  onChange={e => setRequestQty(parseInt(e.target.value) || 1)}
                  className="form-input"
                />
                <p className="text-body-sm text-[var(--color-outline)] mt-1">Maximum available: {requestModal.availableQuantity} units</p>
              </div>
              <div>
                <label className="form-label">Clinical Justification / Notes</label>
                <textarea
                  value={requestNote}
                  onChange={e => setRequestNote(e.target.value)}
                  rows={3}
                  className="form-input pt-2 resize-none"
                  placeholder="Brief description of clinical need, patient population served..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setRequestModal(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleRequest} disabled={requesting} className="btn-primary">
                  {requesting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><span className="material-symbols-outlined">send</span> Submit Request</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
