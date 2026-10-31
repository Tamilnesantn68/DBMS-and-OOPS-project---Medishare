const STEPS = [
  { n: 'Step 01', title: 'Org Registration', desc: 'Healthcare entity provides state license, DEA credentials, and NPI identifiers. A compliance officer reviews all legal documentation.' },
  { n: 'Step 02', title: 'Document Vetting', desc: 'Compliance staff checks state licensing boards and sanction exclusion registers (OIG/SAM). DEA registration is cross-referenced.' },
  { n: 'Step 03', title: 'Batch Upload', desc: 'Donor scans 2D barcode: NDC, Lot #, unit count, expiration, and cold storage history. System auto-populates product details.' },
  { n: 'Step 04', title: 'Admin Review', desc: 'In-house pharmacist verifies manufacturer seals, FDA safety recalls, minimum shelf life ≥60 days, and storage compliance.' },
  { n: 'Step 05', title: 'Marketplace Post', desc: 'Batch is posted to verified recipient portal with transparent expiration timelines. Only approved, eligible batches appear.' },
  { n: 'Step 06', title: 'Stock Requisition', desc: 'Qualified clinic submits requisition matching clinical treatment protocols. Available quantity is validated before request is accepted.' },
  { n: 'Step 07', title: 'Transfer Approval', desc: 'Admin reviews donor and recipient permissions, validates remaining stock, and approves transfer. Transaction statements generated.' },
  { n: 'Step 08', title: 'Cold-Chain Pickup', desc: 'Certified cold-chain courier locks thermal logger, initiating live continuous telemetry. Dispatch status updates in real time.' },
  { n: 'Step 09', title: 'Arrival & Scan', desc: 'Receiving pharmacist scans batch and downloads logger data to verify zero temperature excursions during entire transit journey.' },
  { n: 'Step 10', title: 'Ledger Finalization', desc: 'DSCSA audit record permanently written to tamper-evident redistribution log. Recipient confirms receipt, closing the transfer.' },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-10 animate-fade-in">
      <div className="max-w-3xl">
        <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">End-To-End Architecture</span>
        <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1">The 10-Step Redistribution Chain-of-Custody</h1>
        <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
          Explore the forensic custody protocol that converts potential biohazard waste into certified lifesaving care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STEPS.map(({ n, title, desc }) => (
          <div key={n} className="bg-white p-5 rounded-xl border border-[var(--color-outline-variant)] space-y-2 hover:shadow-md transition-shadow">
            <span className="text-label-sm bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded font-mono">{n}</span>
            <h3 className="text-headline-sm text-[var(--color-on-surface)]">{title}</h3>
            <p className="text-body-sm text-[var(--color-outline)]">{desc}</p>
          </div>
        ))}
      </div>

      {/* Download SOP */}
      <div className="p-6 bg-white rounded-xl border border-[var(--color-outline-variant)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-2xl">file_download</span>
          <div>
            <h4 className="text-headline-sm text-[var(--color-on-surface)]">Download Complete SOP Guidelines</h4>
            <p className="text-body-sm text-[var(--color-outline)]">Comprehensive Standard Operating Procedures for participating health systems.</p>
          </div>
        </div>
        <button className="btn-primary">Download SOP PDF (v4.2)</button>
      </div>

      {/* Safety note */}
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#B45309] text-2xl mt-0.5">warning</span>
          <div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)]">Important Safety Notice</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">An unexpired medicine is not automatically safe or eligible for redistribution. Every batch must pass a comprehensive eligibility review including packaging integrity, recall status, storage compliance, and product-specific safety assessment before it can be listed in the marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
