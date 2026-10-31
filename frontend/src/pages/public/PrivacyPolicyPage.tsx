export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <span className="text-label-sm uppercase tracking-wider text-[var(--color-primary)] font-bold">Legal</span>
      <h1 className="text-headline-lg text-[var(--color-on-surface)] mt-1 mb-2">Privacy Policy</h1>
      <p className="text-body-sm text-[var(--color-outline)] mb-8">Last updated: January 1, 2025</p>
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-8 space-y-8 text-body-md text-[var(--color-on-surface-variant)]">
        {[
          { title: '1. Information We Collect', body: 'MediShare collects organization registration information including legal entity names, DEA registration numbers, state pharmacy licenses, NPI identifiers, contact person details, facility addresses, and uploaded credential documents. We also collect medicine batch data including NDC codes, lot numbers, expiration dates, and storage conditions submitted by registered organizations.' },
          { title: '2. How We Use Information', body: 'Collected information is used to verify organizational eligibility for network participation, facilitate DSCSA-compliant pharmaceutical redistribution transactions, maintain required electronic transaction records for the statutory minimum 6-year retention period, monitor compliance with redistribution eligibility criteria, and communicate about application status, transfer updates, and compliance matters.' },
          { title: '3. Information Sharing', body: 'MediShare does not sell or share personal information with third parties for commercial purposes. We share organizational information with other verified network participants only as necessary to facilitate specific approved redistribution transactions. We may share information with regulatory authorities including FDA, DEA, and State Boards of Pharmacy when required by law or subpoena.' },
          { title: '4. HIPAA Compliance', body: 'MediShare operates as a Business Associate under HIPAA. We maintain appropriate administrative, physical, and technical safeguards to protect any protected health information that may be associated with pharmaceutical transaction records. We do not collect individual patient health information.' },
          { title: '5. Data Security', body: 'We implement industry-standard security measures including encryption of data in transit (TLS 1.3) and at rest (AES-256), access controls with role-based permissions, multi-factor authentication for administrative accounts, regular security audits, and SOC 2 Type II certification. Uploaded credential documents are stored in private, access-controlled storage systems.' },
          { title: '6. Data Retention', body: 'DSCSA-required transaction records are retained for a minimum of 6 years as required by federal law. Organization credential documents are retained while the organization remains active in the network plus 3 years after termination. Contact form submissions are retained for 2 years.' },
          { title: '7. Your Rights', body: 'Registered organizations may request access to their stored information, request correction of inaccurate data, request deletion of non-legally-required records, and receive a copy of their data in a portable format. Requests should be submitted to compliance@medishare.health.' },
          { title: '8. Contact', body: 'For privacy-related questions, requests, or complaints, contact our Data Protection Officer at: privacy@medishare.health | MediShare Health Technologies, Compliance Department.' },
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
