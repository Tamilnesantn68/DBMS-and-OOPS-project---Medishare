import { useState } from 'react'
import { contactApi } from '../../services/api'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  email: string
  organization: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', organization: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validate = () => {
    const e: Partial<FormData> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message is required'
    else if (form.message.length < 20) e.message = 'Message must be at least 20 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await contactApi.send(form)
      setSuccess(true)
      setForm({ name: '', email: '', organization: '', subject: '', message: '' })
      toast.success('Message sent successfully!')
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 animate-fade-in">
      <div className="max-w-3xl">
        <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Contact</span>
        <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Get In Touch</h1>
        <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">For partnership inquiries, compliance questions, regulatory documentation requests, or general support.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          {success ? (
            <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-headline-md text-[var(--color-on-surface)]">Message Sent Successfully</h2>
              <p className="text-body-md text-[var(--color-on-surface-variant)]">Your message has been received. Our compliance team will respond within 1-2 business days.</p>
              <button onClick={() => setSuccess(false)} className="btn-primary mx-auto">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
              <h2 className="text-headline-sm text-[var(--color-on-surface)]">Send a Message</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input className={`form-input ${errors.name ? 'border-[var(--color-error)]' : ''}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. Jane Smith" />
                  {errors.name && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input className={`form-input ${errors.email ? 'border-[var(--color-error)]' : ''}`} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@hospital.org" />
                  {errors.email && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="form-label">Organization</label>
                  <input className="form-input" value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} placeholder="City General Hospital" />
                </div>
                <div>
                  <label className="form-label">Subject *</label>
                  <select className={`form-select ${errors.subject ? 'border-[var(--color-error)]' : ''}`} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                    <option value="">Select a subject...</option>
                    <option>Partnership Inquiry</option>
                    <option>Compliance & Regulatory</option>
                    <option>Technical Support</option>
                    <option>Organization Verification</option>
                    <option>General Inquiry</option>
                  </select>
                  {errors.subject && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.subject}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Message *</label>
                <textarea
                  className={`form-input h-32 resize-none pt-2 ${errors.message ? 'border-[var(--color-error)]' : ''}`}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Describe your inquiry in detail..."
                />
                {errors.message && <p className="text-body-sm text-[var(--color-error)] mt-1">{errors.message}</p>}
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">send</span> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 space-y-4">
            <h3 className="text-headline-sm text-[var(--color-on-surface)]">Contact Information</h3>
            {[
              { icon: 'email', label: 'General Inquiries', value: 'info@medishare.health' },
              { icon: 'policy', label: 'Compliance & Regulatory', value: 'compliance@medishare.health' },
              { icon: 'support_agent', label: 'Technical Support', value: 'support@medishare.health' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <div>
                  <p className="text-label-sm text-[var(--color-outline)]">{label}</p>
                  <a href={`mailto:${value}`} className="text-body-sm text-[var(--color-primary)] hover:underline">{value}</a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px]">schedule</span>
              <h3 className="text-label-md text-[var(--color-on-surface)]">Response Times</h3>
            </div>
            <ul className="space-y-1 text-body-sm text-[var(--color-on-surface-variant)]">
              <li>General inquiries: 1–2 business days</li>
              <li>Compliance issues: 4–6 business hours</li>
              <li>Technical support: Same business day</li>
              <li>Emergency hotline: 24/7 availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
