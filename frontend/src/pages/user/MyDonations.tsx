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
  dosageForm?: string
  strength?: string
  specialNotes?: string
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
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Edit Modal State
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [editForm, setEditForm] = useState<Partial<Batch>>({})
  const [savingEdit, setSavingEdit] = useState(false)

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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return
    setDeletingId(id)
    try {
      await batchApi.delete(id)
      toast.success('Batch deleted successfully')
      fetchBatches()
    } catch {
      toast.error('Failed to delete batch')
    } finally {
      setDeletingId(null)
    }
  }

  const openEditModal = (b: Batch) => {
    setEditingBatch(b)
    setEditForm({
      medicineName: b.medicineName,
      strength: b.strength || '',
      quantity: b.quantity,
      storageType: b.storageType,
      expiryDate: b.expiryDate,
      specialNotes: b.specialNotes || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingBatch) return
    if (!editForm.medicineName?.trim()) {
      toast.error('Medicine name is required')
      return
    }
    if (!editForm.quantity || Number(editForm.quantity) <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }
    setSavingEdit(true)
    try {
      await batchApi.update(editingBatch.id, editForm)
      toast.success('Medicine batch updated successfully!')
      setEditingBatch(null)
      fetchBatches()
    } catch {
      toast.error('Failed to update batch')
    } finally {
      setSavingEdit(false)
    }
  }

  const FILTERS = ['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">My Donated Batches</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Track, edit, and manage all your medicine donation submissions.</p>
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
                      <div className="text-body-sm text-[var(--color-outline)]">
                        {b.strength && <span className="mr-2 text-[var(--color-primary)] font-medium">{b.strength}</span>}
                        Added {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-code-sm text-[var(--color-outline)]">{b.ndcCode}</td>
                    <td className="text-code-sm font-semibold">{b.lotNumber}</td>
                    <td>
                      <div className="text-body-md">{new Date(b.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-label-sm ${b.daysToExpiry < 30 ? 'text-[var(--color-danger)] font-bold' : b.daysToExpiry < 60 ? 'text-[var(--color-warning)] font-bold' : 'text-[var(--color-success)]'}`}>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(b)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[var(--color-on-surface)] flex items-center gap-1 transition-colors"
                          title="Edit Medicine Details"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                          <span>Edit</span>
                        </button>

                        {/* Withdraw Button */}
                        {b.status === 'APPROVED' && (
                          <button
                            onClick={() => handleWithdraw(b.id)}
                            disabled={withdrawingId === b.id}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] flex items-center gap-1 transition-colors"
                            title="Withdraw from Marketplace"
                          >
                            <span className="material-symbols-outlined text-[13px]">undo</span>
                            <span>{withdrawingId === b.id ? 'Withdrawing...' : 'Withdraw'}</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(b.id, b.medicineName)}
                          disabled={deletingId === b.id}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] flex items-center gap-1 transition-colors"
                          title="Delete Batch"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          <span>{deletingId === b.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Medicine Modal */}
      {editingBatch && (
        <div className="modal-overlay" onClick={() => setEditingBatch(null)}>
          <div className="modal-content mx-4 max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-headline-md text-[var(--color-on-surface)]">Edit Medicine Batch</h2>
                  <p className="text-body-sm text-[var(--color-outline)]">Update batch details and inventory volume</p>
                </div>
                <button onClick={() => setEditingBatch(null)} className="p-1 rounded hover:bg-[var(--color-surface-container-low)]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)] text-body-sm">
                <span className="text-label-sm text-[var(--color-outline)] block">NDC & Lot (Fixed Identity)</span>
                <span className="font-mono font-semibold">{editingBatch.ndcCode} · Lot #{editingBatch.lotNumber}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Medicine Name *</label>
                  <input
                    className="form-input"
                    value={editForm.medicineName || ''}
                    onChange={e => setEditForm({ ...editForm, medicineName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Strength / Concentration</label>
                  <input
                    className="form-input"
                    value={editForm.strength || ''}
                    onChange={e => setEditForm({ ...editForm, strength: e.target.value })}
                    placeholder="e.g. 500mg, 100U/mL"
                  />
                </div>
                <div>
                  <label className="form-label">Available Quantity (Units) *</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={editForm.quantity || ''}
                    onChange={e => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editForm.expiryDate || ''}
                    onChange={e => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Storage Classification</label>
                  <select
                    className="form-select"
                    value={editForm.storageType || 'AMBIENT'}
                    onChange={e => setEditForm({ ...editForm, storageType: e.target.value })}
                  >
                    <option value="AMBIENT">Ambient Controlled (15–25°C)</option>
                    <option value="REFRIGERATED">Refrigerated (2–8°C)</option>
                    <option value="FROZEN">Frozen (-15 to -25°C)</option>
                    <option value="DEEP_FROZEN">Ultra-Low Deep Freeze (-80°C)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Special Notes / Handling</label>
                  <textarea
                    rows={2}
                    className="form-input pt-2 resize-none"
                    value={editForm.specialNotes || ''}
                    onChange={e => setEditForm({ ...editForm, specialNotes: e.target.value })}
                    placeholder="Any storage excursion or delivery notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditingBatch(null)} className="btn-secondary">Cancel</button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="btn-primary"
                >
                  {savingEdit ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
