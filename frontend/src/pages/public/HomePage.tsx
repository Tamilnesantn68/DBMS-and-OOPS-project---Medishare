import { useNavigate } from 'react-router-dom'

const STEPS = [
  { n: '01', title: 'Surplus Logging', desc: 'Facility scans 2D DataMatrix code. NDC, Lot ID, and expiration date populate automatically.' },
  { n: '02', title: 'Clinical Review', desc: 'Licensed pharmacist auditors inspect lot pedigree, minimum shelf life, and recall registers.' },
  { n: '03', title: 'Protected Hub', desc: 'Verified batch is listed in the private redistribution exchange visible only to qualified receivers.' },
  { n: '04', title: 'Chain-of-Custody', desc: 'Certified cold-chain dispatch with continuous electronic temperature telemetry logging.' },
  { n: '05', title: 'Acceptance Seal', desc: 'Receiving pharmacist scans batch upon receipt, finalizing DSCSA compliance ledger transfer.' },
]

const METRICS = [
  { value: '$4.82M', label: 'Medication Cost Saved', sublabel: 'Verified wholesale acquisition cost', icon: 'payments', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
  { value: '142,890', label: 'Units Salvaged', sublabel: 'Inspected sealed vials and oral solids', icon: 'medication_liquid', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]' },
  { value: '99.4%', label: 'Cold-Chain Compliance', sublabel: 'Continuous calibrated IoT validation', icon: 'ac_unit', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
  { value: '438', label: 'Vetted Facilities', sublabel: 'Licensed pharmacies, hospitals, clinics', icon: 'domain', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]' },
]

const BENEFITS = [
  {
    title: 'Hospitals & Systems', subtitle: 'Donors & Re-allocators', icon: 'local_hospital', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10',
    benefits: ['Eliminate hazardous pharmaceutical destruction costs and regulatory fees.', 'Automatic tax deduction documentation for certified charitable transfers.', 'Zero liability risk under Good Samaritan and state Drug Repository Acts.'],
    dotColor: 'text-[var(--color-primary)]', btnLabel: 'Register as Hospital Donor', btnClass: 'border-[var(--color-primary)] text-[var(--color-primary)]'
  },
  {
    title: 'Community Clinics', subtitle: 'Frontline Recipients', icon: 'health_and_safety', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]',
    benefits: ['Access vital oncology, insulin, and antibiotic inventories at near-zero cost.', 'Guaranteed minimum 90-day shelf life on all received therapeutic lots.', 'Pre-vetted clinical packaging ensuring manufacturer integrity seals.'],
    dotColor: 'text-[#15803D]', btnLabel: 'Request Stock Access', btnClass: 'border-[#15803D] text-[#15803D]'
  },
  {
    title: 'Charitable Relief & NGOs', subtitle: 'Disaster & Rural Reach', icon: 'volunteer_activism', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]',
    benefits: ['Urgent lot requisitioning for regional humanitarian health responses.', 'Interoperable electronic export records for cross-jurisdiction audits.', 'Multi-facility bulk transfer pooling to minimize transport costs.'],
    dotColor: 'text-[#B45309]', btnLabel: 'Partner as Relief Agency', btnClass: 'border-[var(--color-outline)] text-[var(--color-on-surface)]'
  },
]

const FAQS = [
  { q: 'How does MediShare comply with DSCSA?', a: 'MediShare integrates direct EPCIS (Electronic Product Code Information Services) transaction records. When a participating donor transfers an unexpired lot, transaction information (TI), transaction history (TH), and transaction statements (TS) are digitally signed and archived for a minimum 6-year period.' },
  { q: 'What legal liability protections exist for donating hospitals?', a: 'Donating entities are shielded under state Drug Repository and Redistribution Statutes, as well as the federal Good Samaritan framework. Once batch verification is executed by our registered PharmDs, legal chain-of-custody transfers directly to MediShare Logistics.' },
  { q: 'How are cold-chain refrigerated biologics preserved during transit?', a: 'All 2°C–8°C shipments use validated VIP insulated coolers packed with phase-change materials and real-time cellular data loggers. The receiving pharmacy cannot sign for receipt until the logger cryptographic hash verifies zero thermal deviations.' },
  { q: 'Who is eligible to open a recipient account?', a: 'Only licensed entities holding a valid State Board of Pharmacy license, DEA Registration, and verified Non-Profit 501(c)(3) or governmental healthcare provider credentials may register. Individual patients cannot order directly.' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-b from-[#F2F3FF] via-[#FAF8FF] to-[#F8FAFC] pt-12 pb-16 border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[var(--color-outline-variant)] shadow-sm">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px]">verified</span>
              <span className="text-label-sm uppercase tracking-wide">DSCSA Compliant & Chain-of-Custody Verified</span>
            </div>

            <h1 className="text-display text-[var(--color-on-surface)] tracking-tight leading-tight">
              Give Medicines a <br />
              <span className="text-[var(--color-primary-container)]">Second Chance.</span>
            </h1>

            <p className="text-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
              Connect healthcare organizations, redistribute eligible surplus medicine stock responsibly, and eliminate pharmaceutical waste through certified batch tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/signin')}
                className="btn-primary text-base px-5 py-3"
              >
                <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                <span>Donate Surplus Medicines</span>
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="btn-secondary text-base px-5 py-3"
              >
                <span className="material-symbols-outlined text-[20px]">medication</span>
                <span>Request Needed Stock</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[var(--color-outline-variant)]/60 flex items-center gap-3">
              <span className="text-label-sm text-[var(--color-outline)]">Simulate Experience:</span>
              <button
                onClick={() => navigate('/signin')}
                className="px-3 py-1.5 text-label-sm rounded-lg bg-white border border-[#CBD5E1] text-[var(--color-primary)] hover:border-[var(--color-primary)] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Switch to User Portal</span>
              </button>
              <button
                onClick={() => navigate('/admin/signin')}
                className="px-3 py-1.5 text-label-sm rounded-lg bg-white border border-[#CBD5E1] text-[var(--color-tertiary)] hover:border-[var(--color-tertiary)] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">policy</span>
                <span>Switch to Admin Review</span>
              </button>
            </div>
          </div>

          {/* Right — Live Batch Card */}
          <div className="lg:col-span-5 animate-slide-in-right">
            <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] shadow-md p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-outline-variant)]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">fact_check</span>
                  <span className="text-headline-sm">Live Batch Redistribution</span>
                </div>
                <span className="badge badge-info">In-Flight Lot</span>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-headline-sm text-[var(--color-on-surface)]">Human Albumin 20% Infusion</h3>
                    <p className="text-code-sm text-[var(--color-outline)]">NDC 54288-124-02 | Lot #MS-88910</p>
                  </div>
                  <span className="badge badge-success">Valid: 11 Mo</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-sm pt-2">
                  <div className="bg-white p-2 rounded border border-[var(--color-outline-variant)]">
                    <span className="text-[var(--color-outline)] text-label-sm block">Donor Origin</span>
                    <span className="font-semibold text-[var(--color-on-surface)] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">local_hospital</span> Metro General Hospital
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[var(--color-outline-variant)]">
                    <span className="text-[var(--color-outline)] text-label-sm block">Cold-Chain Temp</span>
                    <span className="font-semibold text-[#15803D] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">thermostat</span> 4.2°C (Optimal 2-8°C)
                    </span>
                  </div>
                </div>
                {/* Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-label-sm text-[var(--color-outline)]">
                    <span>DSCSA Electronic Chain of Custody</span>
                    <span className="text-[var(--color-primary)] font-bold">Step 4 of 5 (Transit)</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--color-primary-container)] h-full w-4/5 rounded-full transition-all duration-500" />
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['$4.8M+', 'Salvaged Value'], ['142,500', 'Safe Doses'], ['99.4%', 'Cold Integrity']].map(([v, l]) => (
                  <div key={l} className="bg-white border border-[var(--color-outline-variant)] p-2.5 rounded-lg">
                    <span className="block text-headline-sm text-[var(--color-primary)] font-bold">{v}</span>
                    <span className="text-label-sm text-[var(--color-outline)]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT METRICS ── */}
      <section className="py-12 bg-white border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Empirical Verification</span>
            <h2 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Real-Time Redistribution Impact</h2>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">Cryptographically signed logs track pharmaceutical units diverted from incinerators to frontline clinics. <em className="text-[var(--color-outline)] not-italic">(Demonstration data — not actual impact figures)</em></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {METRICS.map(({ value, label, sublabel, icon, color, bg }) => (
              <div key={label} className="p-6 rounded-xl border border-[var(--color-outline-variant)] bg-[#F8FAFC] hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className={`text-display font-bold ${color}`}>{value}</span>
                <h3 className="text-headline-sm text-[var(--color-on-surface)] mt-1">{label}</h3>
                <p className="text-body-sm text-[var(--color-outline)] mt-1">{sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 bg-[#F8FAFC] border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Operational Workflow</span>
              <h2 className="text-headline-lg text-[var(--color-on-surface)] mt-1">How MediShare Redistributes Safely</h2>
            </div>
            <button onClick={() => navigate('/how-it-works')} className="text-[var(--color-primary)] text-label-md flex items-center gap-1 hover:underline mt-2 md:mt-0">
              <span>View In-Depth 10-Step Protocol</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="bg-white p-5 rounded-xl border border-[var(--color-outline-variant)]">
                <div className="text-headline-lg text-[var(--color-primary)]/20 font-bold mb-2">{n}</div>
                <h3 className="text-headline-sm text-[var(--color-on-surface)]">{title}</h3>
                <p className="text-body-sm text-[var(--color-outline)] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-16 bg-white border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Ecosystem Value</span>
            <h2 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Built For Every Healthcare Partner</h2>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">Eliminate disposal liabilities while sustaining under-resourced community health facilities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map(({ title, subtitle, icon, color, bg, benefits, dotColor, btnLabel, btnClass }) => (
              <div key={title} className="p-6 rounded-xl border border-[var(--color-outline-variant)] bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg ${bg} ${color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <div>
                      <h3 className="text-headline-sm text-[var(--color-on-surface)]">{title}</h3>
                      <span className="text-label-sm text-[var(--color-outline)]">{subtitle}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-body-sm text-[var(--color-on-surface-variant)]">
                    {benefits.map(b => (
                      <li key={b} className="flex items-start gap-2">
                        <span className={`material-symbols-outlined ${dotColor} text-base shrink-0 mt-0.5`}>check_circle</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/register')}
                  className={`mt-6 w-full py-2.5 rounded-lg border ${btnClass} text-label-md font-semibold hover:bg-gray-50 transition-colors`}
                >
                  {btnLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY CRITERIA ── */}
      <section className="py-16 bg-[#F8FAFC] border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">health_and_safety</span>
              <div>
                <h2 className="text-headline-md text-[var(--color-on-surface)]">Strict Pharmaceutical Acceptance Criteria</h2>
                <p className="text-body-sm text-[var(--color-outline)]">What medicine can and cannot enter the MediShare redistribution network.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-[#BBF7D0] bg-[#DCFCE7]/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#15803D]">
                  <span className="material-symbols-outlined">check_circle</span>
                  <h3 className="text-headline-sm">Eligible For Redistribution</h3>
                </div>
                <ul className="space-y-2 text-body-sm text-[var(--color-on-surface)]">
                  {['Unopened Manufacturer Packaging: Unit-dose blister packs, factory-sealed tamper-evident bottles, and sealed ampules.', 'Minimum Expiration Margin: Greater than 60 days before printed manufacturer expiration date.', 'Continuous Temperature Verification: Complete storage log confirmation from facility pharmacy grade monitoring.', 'Clear 2D DataMatrix: Legible barcode displaying NDC, Serial, Lot, and Expiry under DSCSA mandates.'].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-[#15803D] mt-0.5">done</span>
                      <span><strong>{t.split(':')[0]}:</strong>{t.split(':').slice(1).join(':')}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-[#FECACA] bg-[#FEE2E2]/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#B91C1C]">
                  <span className="material-symbols-outlined">cancel</span>
                  <h3 className="text-headline-sm">Strictly Prohibited & Ineligible</h3>
                </div>
                <ul className="space-y-2 text-body-sm text-[var(--color-on-surface)]">
                  {['Controlled Substances: Schedule I–V controlled pharmaceuticals (DEA strict quarantine).', 'Compounded Medications: Custom non-commercial compounding or individual patient-labeled vials.', 'Compromised Cold-Chain: Any excursion beyond manufacturer specifications (+/- 0.5°C violation).', 'Recalled Or Investigational: Any lot subject to FDA Class I/II/III enforcement notices.'].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-[#B91C1C] mt-0.5">close</span>
                      <span><strong>{t.split(':')[0]}:</strong>{t.split(':').slice(1).join(':')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-[880px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Frequently Asked Questions</span>
            <h2 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Regulatory & Operational Inquiries</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="border border-[var(--color-outline-variant)] rounded-xl overflow-hidden group">
                <summary className="w-full text-left px-5 py-4 flex justify-between items-center bg-[#F8FAFC] hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer list-none">
                  <span className="text-headline-sm text-[var(--color-on-surface)]">{q}</span>
                  <span className="material-symbols-outlined text-[var(--color-outline)] transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="px-5 py-4 bg-white text-body-md text-[var(--color-on-surface-variant)] border-t border-[var(--color-outline-variant)]">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
