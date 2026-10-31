import { useState } from 'react'
import { batchApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const STORAGE_TYPES = [
  { value: 'AMBIENT', label: 'Ambient / Room Temperature (15–25°C)', icon: 'thermostat' },
  { value: 'REFRIGERATED', label: 'Refrigerated 2–8°C (Insulin, Biologics)', icon: 'ac_unit' },
  { value: 'FROZEN', label: 'Frozen −15 to −25°C', icon: 'severe_cold' },
  { value: 'DEEP_FROZEN', label: 'Ultra-Low Deep Freeze (−80°C)', icon: 'snowing' },
]

interface BatchForm {
  medicineName: string
  ndcCode: string
  lotNumber: string
  manufacturerName: string
  expiryDate: string
  quantity: number | ''
  dosageForm: string
  strength: string
  storageType: string
  storageLog: string
  packagingIntegrity: boolean
  notRecalled: boolean
  specialNotes: string
}

export default function DonateMedicines() {
  const navigate = useNavigate()
  const [form, setForm] = useState<BatchForm>({
    medicineName: '', ndcCode: '', lotNumber: '', manufacturerName: '',
    expiryDate: '', quantity: '', dosageForm: 'TABLET', strength: '',
    storageType: 'AMBIENT', storageLog: '', packagingIntegrity: false,
    notRecalled: false, specialNotes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BatchForm, string>>>({})

  const minExpiry = new Date()
  minExpiry.setDate(minExpiry.getDate() + 60)
  const minExpiryStr = minExpiry.toISOString().split('T')[0]

  const validate = () => {
    const e: Partial<Record<keyof BatchForm, string>> = {}
    if (!form.medicineName.trim()) e.medicineName = 'Required'
    if (!form.ndcCode.trim()) e.ndcCode = 'Required'
    else if (!/^\d{4,5}-\d{3,4}-\d{1,2}$/.test(form.ndcCode)) e.ndcCode = 'Must be valid NDC format (e.g. 54288-124-02)'
    if (!form.lotNumber.trim()) e.lotNumber = 'Required'
    if (!form.expiryDate) e.expiryDate = 'Required'
    else if (form.expiryDate < minExpiryStr) e.expiryDate = 'Expiry must be at least 60 days from today (MediShare policy)'
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Must be greater than 0'
    if (!form.manufacturerName.trim()) e.manufacturerName = 'Required'
    if (!form.packagingIntegrity) e.packagingIntegrity = 'Confirmation required'
    if (!form.notRecalled) e.notRecalled = 'Confirmation required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await batchApi.create(form)
      toast.success('Batch submitted for clinical review!')
      navigate('/portal/donations')
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{message?:string}}})?.response?.data?.message
      toast.error(msg || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const F = (key: keyof BatchForm) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Donate Medicine Batch</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-1">All batches undergo clinical pharmacist review before listing. Minimum 60-day expiry required.</p>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#DCFCE7]/40 border border-[#BBF7D0] rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-[#15803D] mt-0.5">health_and_safety</span>
        <div className="text-body-sm text-[var(--color-on-surface)]">
          <strong>Eligibility Check:</strong> Only submit medicines in original sealed manufacturer packaging with ≥60 days until expiry, no recalls, and verified cold-chain compliance. Submitting ineligible batches violates DSCSA terms and may suspend your account.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-7 space-y-6">
        {/* Section 1: Identity */}
        <section>
          <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Product Identification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Medicine / Product Name *</label>
              <input {...F('medicineName')} className={`form-input ${errors.medicineName ? 'border-[var(--color-error)]' : ''}`} placeholder="Human Albumin 20% Infusion" />
              {errors.medicineName && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.medicineName}</p>}
            </div>
            <div>
              <label className="form-label">NDC Code *</label>
              <input {...F('ndcCode')} className={`form-input font-mono ${errors.ndcCode ? 'border-[var(--color-error)]' : ''}`} placeholder="54288-124-02" />
              {errors.ndcCode && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.ndcCode}</p>}
            </div>
            <div>
              <label className="form-label">Lot / Batch Number *</label>
              <input {...F('lotNumber')} className={`form-input font-mono ${errors.lotNumber ? 'border-[var(--color-error)]' : ''}`} placeholder="MS-88910" />
              {errors.lotNumber && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.lotNumber}</p>}
            </div>
            <div>
              <label className="form-label">Manufacturer Name *</label>
              <input {...F('manufacturerName')} className={`form-input ${errors.manufacturerName ? 'border-[var(--color-error)]' : ''}`} placeholder="Baxter International Inc." />
              {errors.manufacturerName && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.manufacturerName}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Details */}
        <section className="border-t border-[var(--color-outline-variant)] pt-5">
          <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Batch Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Dosage Form</label>
              <select {...F('dosageForm')} className="form-select">
                {['TABLET', 'CAPSULE', 'INJECTION', 'INFUSION', 'ORAL_LIQUID', 'CREAM', 'PATCH', 'OTHER'].map(v => (
                  <option key={v} value={v}>{v.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Strength / Concentration</label>
              <input {...F('strength')} className="form-input" placeholder="500mg / 250mL / 20% etc." />
            </div>
            <div>
              <label className="form-label">Expiry Date * (≥60 days)</label>
              <input type="date" {...F('expiryDate')} min={minExpiryStr} className={`form-input ${errors.expiryDate ? 'border-[var(--color-error)]' : ''}`} />
              {errors.expiryDate && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.expiryDate}</p>}
            </div>
            <div>
              <label className="form-label">Available Quantity (units) *</label>
              <input type="number" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: parseInt(e.target.value) || ''}))} min={1} className={`form-input ${errors.quantity ? 'border-[var(--color-error)]' : ''}`} placeholder="200" />
              {errors.quantity && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.quantity}</p>}
            </div>
          </div>
        </section>

        {/* Section 3: Storage */}
        <section className="border-t border-[var(--color-outline-variant)] pt-5">
          <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Cold-Chain & Storage</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {STORAGE_TYPES.map(({ value, label, icon }) => (
              <label key={value} className={`border-2 rounded-lg p-3 cursor-pointer flex items-start gap-2 transition-all ${form.storageType === value ? 'border-[var(--color-primary-container)] bg-[var(--color-primary)]/5' : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]'}`}>
                <input type="radio" className="hidden" checked={form.storageType === value} onChange={() => setForm(p => ({...p, storageType: value}))} />
                <span className="material-symbols-outlined text-[var(--color-primary)] text-lg">{icon}</span>
                <span className="text-body-sm font-semibold">{label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="form-label">Storage Log Reference / Device ID</label>
            <input {...F('storageLog')} className="form-input" placeholder="Logger #DL-4820 · Facility Ref: CLSRM-A2" />
          </div>
        </section>

        {/* Section 4: Attestation */}
        <section className="border-t border-[var(--color-outline-variant)] pt-5 space-y-3">
          <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Safety Attestation</h2>
          <label className={`flex items-start gap-2 cursor-pointer p-3 rounded-lg border ${errors.packagingIntegrity ? 'border-[var(--color-error)] bg-[#FEE2E2]/20' : 'border-[var(--color-outline-variant)] hover:bg-[#F8FAFC]'}`}>
            <input type="checkbox" className="mt-0.5 rounded" checked={form.packagingIntegrity} onChange={e => setForm(p => ({...p, packagingIntegrity: e.target.checked}))} />
            <span className="text-body-sm text-[var(--color-on-surface)]">I confirm that all units are in original, <strong>factory-sealed, tamper-evident manufacturer packaging</strong> with no signs of damage or tampering.</span>
          </label>
          {errors.packagingIntegrity && <p className="text-body-sm text-[var(--color-error)]">{errors.packagingIntegrity}</p>}
          <label className={`flex items-start gap-2 cursor-pointer p-3 rounded-lg border ${errors.notRecalled ? 'border-[var(--color-error)] bg-[#FEE2E2]/20' : 'border-[var(--color-outline-variant)] hover:bg-[#F8FAFC]'}`}>
            <input type="checkbox" className="mt-0.5 rounded" checked={form.notRecalled} onChange={e => setForm(p => ({...p, notRecalled: e.target.checked}))} />
            <span className="text-body-sm text-[var(--color-on-surface)]">I confirm that this product <strong>is NOT subject to any FDA recall</strong>, market withdrawal, or safety alert. I have verified this batch against MedWatch as of today.</span>
          </label>
          {errors.notRecalled && <p className="text-body-sm text-[var(--color-error)]">{errors.notRecalled}</p>}
          <div>
            <label className="form-label">Special Notes / Additional Information</label>
            <textarea {...F('specialNotes')} rows={3} className="form-input pt-2 resize-none" placeholder="Any special handling requirements, storage notes, or additional compliance information..." />
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/portal/donations')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary px-6 py-3">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><span className="material-symbols-outlined">send</span> Submit for Clinical Review</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
