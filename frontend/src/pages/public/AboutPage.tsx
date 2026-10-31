export default function AboutPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">About MediShare</span>
        <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1">Eliminating the $3B Medicine Incineration Crisis</h1>
        <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-3">
          Every year in the United States alone, over $3 billion worth of pristine, unexpired, and lifesaving medicines are incinerated due to institutional stock overages, while millions of under-insured patients struggle to afford basic therapeutic regimens. MediShare was built as the digital trust bridge between surplus and scarcity.
        </p>
      </div>

      {/* Traceability architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'hub', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', title: 'FDA Interoperability', desc: 'Direct EPCIS schema connections ensure full electronic traceability matching DSCSA Enhanced Drug Distribution Security (EDDS) requirements.' },
          { icon: 'policy', color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary)]/10', title: 'Dual-Sign Pharmacist Ledger', desc: 'Every batch listed and received requires independent digital signatures from verified licensed pharmacists (RPh / PharmD).' },
          { icon: 'sensors', color: 'text-[var(--color-tertiary-container)]', bg: 'bg-[var(--color-tertiary-fixed)]/20', title: 'IoT Microclimate Telemetry', desc: 'Real-time GPS, shock, and temperature sensors prevent spoiled or destabilized vials from ever reaching vulnerable patients.' },
        ].map(({ icon, color, bg, title, desc }) => (
          <div key={title} className="p-6 bg-white rounded-xl border border-[var(--color-outline-variant)] space-y-3">
            <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center`}>
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)]">{title}</h3>
            <p className="text-body-sm text-[var(--color-outline)]">{desc}</p>
          </div>
        ))}
      </div>

      {/* Mission sections */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-8 space-y-6">
        <h2 className="text-headline-md text-[var(--color-on-surface)]">Our Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-2">The Problem</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">Pharmaceutical waste costs the US healthcare system billions annually. Hospitals and pharmacies regularly dispose of unexpired, sealed medications because they lack a compliant, efficient channel for redistribution. Meanwhile, community clinics and NGOs face chronic shortages of life-saving drugs.</p>
          </div>
          <div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Our Solution</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">MediShare provides a DSCSA-compliant digital platform that connects donor facilities (hospitals, health systems, pharmacies) with eligible recipient organizations (community clinics, FQHCs, NGOs) through a verified, auditable redistribution process.</p>
          </div>
          <div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Safety & Compliance</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">Every medicine that enters the MediShare network undergoes rigorous review by licensed pharmacists. We verify expiration dates, storage history, packaging integrity, recall status, and DSCSA traceability documentation before any batch is made available.</p>
          </div>
          <div>
            <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Verification & Traceability</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)]">Every transfer generates a complete DSCSA-compliant electronic record including transaction information (TI), transaction history (TH), and transaction statement (TS), archived for the statutory 6-year period and available for regulatory inspection at any time.</p>
          </div>
        </div>
      </div>

      {/* Compliance Matrix */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-6 space-y-4">
        <h2 className="text-headline-md text-[var(--color-on-surface)]">Regulatory Compliance Matrix</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Standard / Statute</th>
                <th>Authority Body</th>
                <th>Implementation Status</th>
                <th>Audit Frequency</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['DSCSA 21 U.S.C. 360eee-1 (EDDS)', 'U.S. FDA Center for Drug Evaluation', '100% Interoperable', 'Continuous Automated'],
                ['State Drug Repository Acts (38 States)', 'State Boards of Pharmacy (NABP)', 'Certified Facility', 'Bi-Annual Field Audit'],
                ['USP <1079> Good Storage & Shipping Practices', 'United States Pharmacopeia', 'Validated Passive VIP', 'Per-Consignment Logger'],
                ['HIPAA / HITECH Patient Data Guard', 'U.S. Dept of Health & Human Services', 'SOC 2 Type II Certified', 'Annual Third-Party'],
              ].map(([std, body, status, freq]) => (
                <tr key={std}>
                  <td className="font-semibold">{std}</td>
                  <td>{body}</td>
                  <td><span className="badge badge-success">{status}</span></td>
                  <td className="text-code-sm text-[var(--color-outline)]">{freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-8">
        <h2 className="text-headline-md text-[var(--color-on-surface)] mb-2">Contact Us</h2>
        <p className="text-body-md text-[var(--color-on-surface-variant)] mb-4">For partnership inquiries, compliance questions, or regulatory documentation requests:</p>
        <div className="flex flex-wrap gap-4">
          <a href="mailto:info@medishare.health" className="flex items-center gap-2 text-[var(--color-primary)] hover:underline">
            <span className="material-symbols-outlined text-[18px]">email</span>
            <span className="text-label-md">info@medishare.health</span>
          </a>
          <a href="mailto:compliance@medishare.health" className="flex items-center gap-2 text-[var(--color-primary)] hover:underline">
            <span className="material-symbols-outlined text-[18px]">policy</span>
            <span className="text-label-md">compliance@medishare.health</span>
          </a>
        </div>
      </div>
    </div>
  )
}
