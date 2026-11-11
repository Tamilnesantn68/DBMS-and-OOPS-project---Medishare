import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

const ORG_TYPES = [
  { value: 'HOSPITAL', label: 'Hospital / Health System', icon: 'local_hospital', desc: 'Inpatient hospitals, academic medical centers, ambulatory networks.' },
  { value: 'CLINIC', label: 'Community Clinic / FQHC', icon: 'health_and_safety', desc: 'Federally Qualified Health Centers, rural health clinics, free pharmacies.' },
  { value: 'NGO', label: 'Non-Profit / NGO Relief', icon: 'volunteer_activism', desc: '501(c)(3) global health relief agencies and charitable medication funds.' },
  { value: 'PHARMACY', label: 'Retail / Institutional Pharmacy', icon: 'medication', desc: 'Licensed retail pharmacies, hospital pharmacies, specialty pharmacies.' },
]

interface Step1 { orgType: string }
interface Step2 { orgName: string; registrationNumber: string; licenceReference: string }
interface Step3 { address: string; city: string; state: string; zip: string; storageType: string }
interface Step4 { contactName: string; contactLicence: string; email: string; password: string; confirmPassword: string }

const TOTAL_STEPS = 6

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [s1, setS1] = useState<Step1>({ orgType: 'HOSPITAL' })
  const [s2, setS2] = useState<Step2>({ orgName: '', registrationNumber: '', licenceReference: '' })
  const [s3, setS3] = useState<Step3>({ address: '', city: '', state: '', zip: '', storageType: 'REFRIGERATED' })
  const [s4, setS4] = useState<Step4>({ contactName: '', contactLicence: '', email: '', password: '', confirmPassword: '' })
  const [docFile, setDocFile] = useState<File | null>(null)
  const [attestation, setAttestation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [trackingId, setTrackingId] = useState('')

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 2) {
      if (!s2.orgName.trim()) e.orgName = 'Organization name is required'
      if (!s2.registrationNumber.trim()) e.registrationNumber = 'Registration number is required'
    }
    if (step === 3) {
      if (!s3.address.trim()) e.address = 'Street address is required'
      if (!s3.city.trim()) e.city = 'City is required'
      if (!s3.state.trim()) e.state = 'State is required'
    }
    if (step === 4) {
      if (!s4.contactName.trim()) e.contactName = 'Contact name is required'
      if (!s4.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s4.email)) e.email = 'Invalid email'
      if (!s4.password) e.password = 'Password is required'
      else if (s4.password.length < 8) e.password = 'Password must be at least 8 characters'
      if (s4.password !== s4.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep()) next()
  }

  const handleSubmit = async () => {
    if (!attestation) { toast.error('Please read and accept the attestation'); return }
    setSubmitting(true)
    try {
      const payload = {
        organizationType: s1.orgType,
        organizationName: s2.orgName,
        registrationNumber: s2.registrationNumber,
        licenceReference: s2.licenceReference,
        address: s3.address,
        city: s3.city,
        state: s3.state,
        zip: s3.zip,
        storageType: s3.storageType,
        contactName: s4.contactName,
        contactLicence: s4.contactLicence,
        email: s4.email,
        password: s4.password,
      }
      const { data } = await authApi.register(payload)
      setTrackingId(data.trackingId || `REG-${Date.now()}`)
      setSubmitted(true)
      toast.success('Registration submitted successfully!')
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{message?:string}}})?.response?.data?.message
      toast.error(msg || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const StepIndicator = () => (
    <div className="bg-white p-4 rounded-xl border border-[var(--color-outline-variant)] shadow-sm">
      <div className="grid grid-cols-6 gap-2 text-center">
        {['Org Type', 'Legal Info', 'Facility', 'Account', 'Documents', 'Review'].map((label, i) => {
          const sn = i + 1
          const done = step > sn
          const active = step === sn
          return (
            <div key={label} className="flex flex-col items-center">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold ${done ? 'bg-[var(--color-secondary)] text-white' : active ? 'bg-[var(--color-primary-container)] text-white' : 'bg-[var(--color-surface-container)] text-[var(--color-outline)]'}`}>
                {done ? <span className="material-symbols-outlined text-[16px]">check</span> : sn}
              </span>
              <span className={`text-label-sm mt-1 ${active ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-outline)]'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="max-w-[980px] mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] shadow-sm p-10 text-center space-y-5">
          <div className="w-16 h-16 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">verified</span>
          </div>
          <h2 className="text-headline-lg text-[var(--color-on-surface)]">Application Submitted Successfully</h2>
          <p className="text-body-md text-[var(--color-on-surface-variant)] max-w-lg mx-auto">
            Your organization file has been routed to the MediShare Regulatory Vetting Board. Verification typically completes within <strong>4 to 6 business hours</strong>.
          </p>
          <div className="inline-block bg-[#F8FAFC] border border-[var(--color-outline-variant)] rounded-lg p-3 text-code-sm text-[var(--color-outline)]">
            Tracking Ticket ID: <span className="text-[var(--color-primary)] font-bold">{trackingId}</span>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => navigate('/')} className="btn-primary">Return to Homepage</button>
            <button onClick={() => navigate('/signin')} className="btn-secondary">Sign In</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[980px] mx-auto px-6 py-12 space-y-8 animate-fade-in">
      <div>
        <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Onboarding Gateway</span>
        <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Healthcare Organization Registration</h1>
        <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">Complete this multi-step credentialing wizard to enable pharmaceutical donations or requisitions.</p>
      </div>

      <StepIndicator />

      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-8 shadow-sm">
        {/* Step 1: Org Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 1: Select Facility Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORG_TYPES.map(({ value, label, icon, desc }) => (
                <label key={value} className={`border-2 rounded-xl p-5 cursor-pointer block transition-all ${s1.orgType === value ? 'border-[var(--color-primary-container)] bg-[var(--color-primary)]/5' : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]'}`}>
                  <input type="radio" name="facility_type" className="hidden" checked={s1.orgType === value} onChange={() => setS1({ orgType: value })} />
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl block mb-2">{icon}</span>
                  <span className="text-headline-sm block text-[var(--color-on-surface)]">{label}</span>
                  <span className="text-body-sm text-[var(--color-outline)] block mt-1">{desc}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={next} className="btn-primary">Continue to Legal Information →</button>
            </div>
          </div>
        )}

        {/* Step 2: Legal Info */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 2: Legal Entity & Licensing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Legal Registered Organization Name *</label>
                <input className={`form-input ${errors.orgName ? 'border-[var(--color-error)]' : ''}`} value={s2.orgName} onChange={e => setS2({...s2, orgName: e.target.value})} placeholder="St. Jude Health Network" />
                {errors.orgName && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.orgName}</p>}
              </div>
              <div>
                <label className="form-label">State Board of Pharmacy License # *</label>
                <input className={`form-input ${errors.registrationNumber ? 'border-[var(--color-error)]' : ''}`} value={s2.registrationNumber} onChange={e => setS2({...s2, registrationNumber: e.target.value})} placeholder="BOP-CA-992014-X" />
                {errors.registrationNumber && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.registrationNumber}</p>}
              </div>
              <div>
                <label className="form-label">DEA Registration Number / Licence Reference</label>
                <input className="form-input font-mono" value={s2.licenceReference} onChange={e => setS2({...s2, licenceReference: e.target.value})} placeholder="BS9182341" />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={back} className="btn-secondary">← Back</button>
              <button onClick={handleNext} className="btn-primary">Continue to Facility Address →</button>
            </div>
          </div>
        )}

        {/* Step 3: Facility */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 3: Primary Physical Facility Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label">Street Address *</label>
                <input className={`form-input ${errors.address ? 'border-[var(--color-error)]' : ''}`} value={s3.address} onChange={e => setS3({...s3, address: e.target.value})} placeholder="742 Evergreen Healthcare Blvd, Dock #4" />
                {errors.address && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="form-label">City *</label>
                <input className={`form-input ${errors.city ? 'border-[var(--color-error)]' : ''}`} value={s3.city} onChange={e => setS3({...s3, city: e.target.value})} placeholder="San Francisco" />
                {errors.city && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="form-label">State *</label>
                <input className={`form-input ${errors.state ? 'border-[var(--color-error)]' : ''}`} value={s3.state} onChange={e => setS3({...s3, state: e.target.value})} placeholder="CA" />
                {errors.state && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="form-label">ZIP Code</label>
                <input className="form-input" value={s3.zip} onChange={e => setS3({...s3, zip: e.target.value})} placeholder="94107" />
              </div>
              <div>
                <label className="form-label">Cold Storage Facility</label>
                <select className="form-select" value={s3.storageType} onChange={e => setS3({...s3, storageType: e.target.value})}>
                  <option value="REFRIGERATED">Yes, 2°C - 8°C Refrigerator On-Site</option>
                  <option value="AMBIENT">Ambient Controlled (15°C - 25°C) Only</option>
                  <option value="DEEP_FREEZE">Ultra-Low Deep Freeze (-80°C to -20°C)</option>
                  <option value="NONE">No Special Storage</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={back} className="btn-secondary">← Back</button>
              <button onClick={handleNext} className="btn-primary">Continue to Account Security →</button>
            </div>
          </div>
        )}

        {/* Step 4: Account */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 4: Pharmacist-in-Charge (PIC) & Account Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Contact Person Full Name *</label>
                <input className={`form-input ${errors.contactName ? 'border-[var(--color-error)]' : ''}`} value={s4.contactName} onChange={e => setS4({...s4, contactName: e.target.value})} placeholder="Dr. Eleanor Vance, PharmD" />
                {errors.contactName && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.contactName}</p>}
              </div>
              <div>
                <label className="form-label">PIC Professional Licence #</label>
                <input className="form-input font-mono" value={s4.contactLicence} onChange={e => setS4({...s4, contactLicence: e.target.value})} placeholder="RPH-99201" />
              </div>
              <div>
                <label className="form-label">Corporate Email Address *</label>
                <input type="email" className={`form-input ${errors.email ? 'border-[var(--color-error)]' : ''}`} value={s4.email} onChange={e => setS4({...s4, email: e.target.value})} placeholder="contact@yourorg.com" />
                {errors.email && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="form-label">Create Secure Password *</label>
                <input type="password" className={`form-input ${errors.password ? 'border-[var(--color-error)]' : ''}`} value={s4.password} onChange={e => setS4({...s4, password: e.target.value})} placeholder="Min 8 characters" />
                {errors.password && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input type="password" className={`form-input ${errors.confirmPassword ? 'border-[var(--color-error)]' : ''}`} value={s4.confirmPassword} onChange={e => setS4({...s4, confirmPassword: e.target.value})} placeholder="Repeat password" />
                {errors.confirmPassword && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={back} className="btn-secondary">← Back</button>
              <button onClick={handleNext} className="btn-primary">Continue to Document Upload →</button>
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 5: Credential Document Uploads</h2>
            <p className="text-body-sm text-[var(--color-outline)]">Upload current unexpired copies of your State Pharmacy Permit and DEA Certificate.</p>
            <div
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[var(--color-primary)] rounded-xl p-8 text-center bg-[#F8FAFC] transition-colors cursor-pointer"
              onClick={() => document.getElementById('docFileInput')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setDocFile(e.dataTransfer.files[0]) }}
            >
              <input type="file" id="docFileInput" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setDocFile(e.target.files?.[0] || null)} />
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">cloud_upload</span>
              <p className="text-headline-sm text-[var(--color-on-surface)] mt-2">Click to browse or drop license PDFs here</p>
              <p className="text-body-sm text-[var(--color-outline)] mt-1">Accepted: PDF, PNG, JPG (Max 25MB each). Must show official state seal.</p>
            </div>
            {docFile && (
              <div className="flex items-center justify-between p-3 bg-white border border-[var(--color-outline-variant)] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">description</span>
                  <span className="text-label-md text-[var(--color-on-surface)]">{docFile.name}</span>
                  <span className="text-code-sm text-[var(--color-outline)]">({(docFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <div className="flex items-center gap-1 text-[#15803D] text-label-sm font-bold">
                  <span className="material-symbols-outlined text-sm">check</span> Ready
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <button onClick={back} className="btn-secondary">← Back</button>
              <button onClick={next} className="btn-primary">Review & Finalize →</button>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-headline-md text-[var(--color-on-surface)]">Step 6: Review Application & Attestation</h2>
            <div className="bg-[#F8FAFC] border border-[var(--color-outline-variant)] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-[var(--color-outline-variant)] pb-3">
                <div>
                  <h3 className="text-headline-sm text-[var(--color-on-surface)]">{s2.orgName || '(Not provided)'}</h3>
                  <span className="text-body-sm text-[var(--color-outline)]">{s1.orgType} · {s2.registrationNumber}</span>
                </div>
                <span className="badge badge-warning">Application Pending Submission</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div>
                  <span className="text-[var(--color-outline)] block text-label-sm">Facility Address:</span>
                  <span className="font-medium text-[var(--color-on-surface)]">{s3.address}, {s3.city}, {s3.state} {s3.zip}</span>
                </div>
                <div>
                  <span className="text-[var(--color-outline)] block text-label-sm">Contact Person:</span>
                  <span className="font-medium text-[var(--color-on-surface)]">{s4.contactName} ({s4.contactLicence})</span>
                </div>
                <div>
                  <span className="text-[var(--color-outline)] block text-label-sm">Email:</span>
                  <span className="font-medium text-[var(--color-on-surface)]">{s4.email}</span>
                </div>
                <div>
                  <span className="text-[var(--color-outline)] block text-label-sm">Document:</span>
                  <span className="font-medium text-[var(--color-on-surface)]">{docFile?.name || 'Not uploaded'}</span>
                </div>
              </div>
              <div className="bg-[var(--color-primary)]/5 p-3 rounded border border-[var(--color-primary)]/20 flex items-start gap-2">
                <input type="checkbox" id="attestCheck" className="mt-1 rounded" checked={attestation} onChange={e => setAttestation(e.target.checked)} />
                <label className="text-body-sm text-[var(--color-on-surface)] cursor-pointer" htmlFor="attestCheck">
                  I solemnly attest under penalty of perjury that all submitted credentials are valid and active. I confirm that our institution will strictly comply with DSCSA traceability rules and MediShare redistribution quality standards.
                </label>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={back} className="btn-secondary">← Back</button>
              <button onClick={handleSubmit} disabled={submitting || !attestation} className="btn-primary">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><span className="material-symbols-outlined text-lg">send</span> Submit Application for Vetting</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-body-sm text-[var(--color-outline)]">
          Already registered?{' '}
          <Link to="/signin" className="text-[var(--color-primary)] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
