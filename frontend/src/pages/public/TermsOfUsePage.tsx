export default function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Legal</span>
      <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1 mb-2">Terms of Use</h1>
      <p className="text-body-sm text-[var(--color-outline)] mb-8">Last updated: January 1, 2025</p>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-8 space-y-8 text-body-md text-[var(--color-on-surface-variant)]">
        {[
          { title: '1. Eligibility & Registration', body: 'Access to the MediShare redistribution network is limited to licensed healthcare organizations including hospitals, health systems, licensed pharmacies, Federally Qualified Health Centers (FQHCs), community clinics, and registered Non-Profit 501(c)(3) healthcare organizations. Individual persons may not register as participants. All registrations require submission of valid, current licensure documentation for administrative verification.' },
          { title: '2. DSCSA Compliance Obligations', body: 'All registered participants agree to comply with the Drug Supply Chain Security Act (DSCSA), applicable State Board of Pharmacy regulations, DEA registration requirements, and all applicable federal and state laws governing pharmaceutical handling, storage, and redistribution. Participants must maintain valid licensure throughout their membership in the MediShare network.' },
          { title: '3. Medicine Submission Standards', body: 'Organizations submitting medicines for redistribution attest that all submitted batches: (a) are in original, unopened, tamper-evident manufacturer packaging; (b) have a minimum of 60 days remaining before the printed expiration date; (c) have been stored in accordance with manufacturer specifications; (d) are not subject to any FDA recall, market withdrawal, or safety alert; (e) are not controlled substances; and (f) are not compounded preparations.' },
          { title: '4. Accuracy of Information', body: 'Participants are strictly prohibited from submitting false, misleading, or inaccurate information about medicine batches, organization credentials, or any other material facts. Submission of inaccurate information may result in immediate account suspension, removal from the network, and referral to applicable regulatory authorities.' },
          { title: '5. Prohibited Uses', body: 'The MediShare platform may not be used to redistribute controlled substances, compounded preparations, recalled or withdrawn products, expired medications, products with compromised packaging, patient-specific dispensed medications, or any product that does not meet the eligibility criteria established by MediShare and applicable law.' },
          { title: '6. Liability Limitation', body: 'MediShare serves as a compliance platform facilitating connections between verified healthcare organizations. MediShare is not a wholesale distributor, pharmacy, or manufacturer. Participating organizations retain responsibility for their own compliance with applicable laws. MediShare\'s liability is limited to the fees paid for platform access during the 12 months preceding any claim.' },
          { title: '7. Termination', body: 'MediShare reserves the right to suspend or terminate network access for: failure to maintain valid licensure, submission of inaccurate information, violation of redistribution eligibility criteria, failure to comply with DSCSA requirements, or any conduct that poses a risk to patient safety.' },
          { title: '8. Governing Law', body: 'These Terms are governed by the laws of the United States and the jurisdiction in which MediShare Health Technologies is incorporated. Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.' },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-2">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
