/**
 * MediShare Demo Data — Mock API responses for frontend-only testing.
 * When a demo user is logged in and the backend is unreachable,
 * the API interceptor returns this data instead.
 */

const today = new Date()
const d = (offset: number) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offset)
  return dt.toISOString().split('T')[0]
}
const ts = (offset: number) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offset)
  return dt.toISOString()
}

// ── User Dashboard ────────────────────────────────────
export const userDashboard = {
  activeDonations: 12,
  activeDonationsChange: 8,
  pendingRequests: 3,
  pendingRequestsChange: -2,
  completedTransfers: 47,
  completedTransfersChange: 15,
  totalUnitsDonated: 8420,
  totalUnitsDonatedChange: 12,
  expiringCount: 2,
  monthlyTrend: [
    { month: 'May', donated: 320, received: 180 },
    { month: 'Jun', donated: 450, received: 290 },
    { month: 'Jul', donated: 380, received: 410 },
    { month: 'Aug', donated: 520, received: 350 },
    { month: 'Sep', donated: 610, received: 480 },
    { month: 'Oct', donated: 490, received: 390 },
  ],
  recentBatches: [
    { id: 1, name: 'Amoxicillin 500mg Capsules', lot: 'AMX-20241', expiryDate: d(95), quantity: 500, status: 'APPROVED', daysToExpiry: 95 },
    { id: 2, name: 'Metformin HCl 850mg Tablets', lot: 'MET-8830', expiryDate: d(72), quantity: 1200, status: 'APPROVED', daysToExpiry: 72 },
    { id: 3, name: 'Human Albumin 20% Infusion', lot: 'HA-4412', expiryDate: d(28), quantity: 60, status: 'APPROVED', daysToExpiry: 28 },
    { id: 4, name: 'Insulin Glargine 100U/mL', lot: 'IG-7791', expiryDate: d(120), quantity: 300, status: 'PENDING_REVIEW', daysToExpiry: 120 },
    { id: 5, name: 'Atorvastatin 20mg Tablets', lot: 'ATV-5503', expiryDate: d(180), quantity: 2000, status: 'APPROVED', daysToExpiry: 180 },
  ],
  recentRequests: [
    { id: 1, medicineName: 'Ciprofloxacin 250mg', requestedQty: 200, status: 'APPROVED', donorOrg: 'St. Luke\'s Pharmacy', createdAt: ts(-2) },
    { id: 2, medicineName: 'Lisinopril 10mg Tablets', requestedQty: 500, status: 'PENDING', donorOrg: 'CareFirst Medical Center', createdAt: ts(-1) },
    { id: 3, medicineName: 'Omeprazole 20mg Capsules', requestedQty: 350, status: 'PENDING', donorOrg: 'Unity Health Pharmacy', createdAt: ts(0) },
  ],
}

// ── My Batches ────────────────────────────────────────
export const myBatches = [
  { id: 1, medicineName: 'Amoxicillin 500mg Capsules', ndcCode: '65162-0019-50', lotNumber: 'AMX-20241', manufacturerName: 'Amneal Pharmaceuticals', dosageForm: 'CAPSULE', strength: '500mg', expiryDate: d(95), quantity: 500, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-30), daysToExpiry: 95 },
  { id: 2, medicineName: 'Metformin HCl 850mg Tablets', ndcCode: '00228-2770-11', lotNumber: 'MET-8830', manufacturerName: 'Actavis Pharma', dosageForm: 'TABLET', strength: '850mg', expiryDate: d(72), quantity: 1200, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-25), daysToExpiry: 72 },
  { id: 3, medicineName: 'Human Albumin 20% Infusion', ndcCode: '00944-2833-04', lotNumber: 'HA-4412', manufacturerName: 'CSL Behring', dosageForm: 'INFUSION', strength: '20%', expiryDate: d(28), quantity: 60, status: 'APPROVED', storageType: 'REFRIGERATED', storageLog: 'Logger #TL-1102', packagingIntegrity: true, notRecalled: true, specialNotes: 'Requires 2–8°C cold-chain throughout. Do not freeze.', createdAt: ts(-20), daysToExpiry: 28 },
  { id: 4, medicineName: 'Insulin Glargine 100U/mL', ndcCode: '00088-2220-33', lotNumber: 'IG-7791', manufacturerName: 'Sanofi-Aventis', dosageForm: 'INJECTION', strength: '100U/mL', expiryDate: d(120), quantity: 300, status: 'PENDING_REVIEW', storageType: 'REFRIGERATED', storageLog: 'Logger #DL-3301', packagingIntegrity: true, notRecalled: true, specialNotes: 'Pen cartridges. Store at 2–8°C before first use.', createdAt: ts(-3), daysToExpiry: 120 },
  { id: 5, medicineName: 'Atorvastatin 20mg Tablets', ndcCode: '00378-3952-77', lotNumber: 'ATV-5503', manufacturerName: 'Mylan Pharmaceuticals', dosageForm: 'TABLET', strength: '20mg', expiryDate: d(180), quantity: 2000, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-15), daysToExpiry: 180 },
  { id: 6, medicineName: 'Cetirizine 10mg Tablets', ndcCode: '00904-6733-61', lotNumber: 'CTZ-1102', manufacturerName: 'Major Pharmaceuticals', dosageForm: 'TABLET', strength: '10mg', expiryDate: d(45), quantity: 800, status: 'REJECTED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: false, specialNotes: '', createdAt: ts(-10), daysToExpiry: 45, reviewNote: 'Lot under FDA recall MedWatch #RCL-8829' },
]


// ── Marketplace ───────────────────────────────────────
export const marketplace = [
  { id: 10, medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', lotNumber: 'CIP-3302', expiryDate: d(110), availableQuantity: 400, storageType: 'AMBIENT', donorOrganization: 'St. Luke\'s Pharmacy', daysToExpiry: 110, dosageForm: 'TABLET', strength: '250mg' },
  { id: 11, medicineName: 'Lisinopril 10mg Tablets', ndcCode: '00093-7342-01', lotNumber: 'LIS-9900', expiryDate: d(88), availableQuantity: 1500, storageType: 'AMBIENT', donorOrganization: 'CareFirst Medical Center', daysToExpiry: 88, dosageForm: 'TABLET', strength: '10mg' },
  { id: 12, medicineName: 'Omeprazole 20mg DR Capsules', ndcCode: '00378-6020-91', lotNumber: 'OMP-5541', expiryDate: d(65), availableQuantity: 900, storageType: 'AMBIENT', donorOrganization: 'Unity Health Pharmacy', daysToExpiry: 65, dosageForm: 'CAPSULE', strength: '20mg' },
  { id: 13, medicineName: 'Epinephrine 1mg/mL Injection', ndcCode: '00517-1071-25', lotNumber: 'EPI-4420', expiryDate: d(75), availableQuantity: 100, storageType: 'REFRIGERATED', donorOrganization: 'Regional Trauma Center', daysToExpiry: 75, dosageForm: 'INJECTION', strength: '1mg/mL' },
  { id: 14, medicineName: 'Azithromycin 250mg Tablets', ndcCode: '00093-7169-56', lotNumber: 'AZI-2208', expiryDate: d(140), availableQuantity: 600, storageType: 'AMBIENT', donorOrganization: 'PharmaUnity NGO', daysToExpiry: 140, dosageForm: 'TABLET', strength: '250mg' },
  { id: 15, medicineName: 'Levothyroxine 50mcg Tablets', ndcCode: '00378-1805-01', lotNumber: 'LVT-8891', expiryDate: d(200), availableQuantity: 3000, storageType: 'AMBIENT', donorOrganization: 'Mercy General Hospital', daysToExpiry: 200, dosageForm: 'TABLET', strength: '50mcg' },
]

// ── My Requests ───────────────────────────────────────
export const myRequests = [
  { id: 1, medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', requestedQuantity: 200, status: 'APPROVED', donorOrganization: 'St. Luke\'s Pharmacy', createdAt: ts(-5), adminNote: null },
  { id: 2, medicineName: 'Lisinopril 10mg Tablets', ndcCode: '00093-7342-01', requestedQuantity: 500, status: 'PENDING', donorOrganization: 'CareFirst Medical Center', createdAt: ts(-1), adminNote: null },
  { id: 3, medicineName: 'Omeprazole 20mg Capsules', ndcCode: '00378-6020-91', requestedQuantity: 350, status: 'PENDING', donorOrganization: 'Unity Health Pharmacy', createdAt: ts(0), adminNote: null },
  { id: 4, medicineName: 'Prednisone 10mg Tablets', ndcCode: '00591-5442-01', requestedQuantity: 100, status: 'REJECTED', donorOrganization: 'CityMed Distributors', createdAt: ts(-10), adminNote: 'Insufficient clinical justification for controlled substance redistribution.' },
]

// ── My Transfers ──────────────────────────────────────
export const myTransfers = [
  { id: 1, medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', quantity: 200, status: 'DELIVERED', donorOrg: 'St. Luke\'s Pharmacy', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-88201', temperatureStatus: 'COMPLIANT', dispatchedAt: ts(-3), deliveredAt: ts(-1), createdAt: ts(-4) },
  { id: 2, medicineName: 'Acetaminophen 500mg Tablets', ndcCode: '00904-1982-60', quantity: 1000, status: 'IN_TRANSIT', donorOrg: 'Mercy General Hospital', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-88245', temperatureStatus: null, dispatchedAt: ts(-1), deliveredAt: null, createdAt: ts(-2) },
  { id: 3, medicineName: 'Metoprolol Tartrate 25mg', ndcCode: '00378-0222-01', quantity: 600, status: 'RECEIPT_CONFIRMED', donorOrg: 'Unity Health Pharmacy', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-87990', temperatureStatus: 'COMPLIANT', dispatchedAt: ts(-10), deliveredAt: ts(-8), createdAt: ts(-12) },
]

// ── Notifications ─────────────────────────────────────
export const notifications = [
  { id: 1, title: 'Batch Approved — Insulin Glargine', message: 'Your donated batch IG-7791 (Insulin Glargine 100U/mL, 300 units) has been reviewed and approved by the clinical pharmacist. It is now listed on the marketplace.', type: 'BATCH_APPROVED', isRead: false, createdAt: ts(0) },
  { id: 2, title: 'Transfer Delivered — Ciprofloxacin', message: 'Transfer MS-TRK-88201 for Ciprofloxacin 250mg (200 units) from St. Luke\'s Pharmacy has been marked as delivered. Please confirm receipt.', type: 'TRANSFER_UPDATE', isRead: false, createdAt: ts(-1) },
  { id: 3, title: 'Expiry Alert — Human Albumin 20%', message: 'Your batch HA-4412 (Human Albumin 20% Infusion) has only 28 days until expiry. Consider withdrawing if no transfer is imminent.', type: 'EXPIRY_ALERT', isRead: false, createdAt: ts(-2) },
  { id: 4, title: 'Request Approved — Ciprofloxacin', message: 'Your request for 200 units of Ciprofloxacin 250mg from St. Luke\'s Pharmacy has been approved. Transfer logistics are being coordinated.', type: 'REQUEST_APPROVED', isRead: true, createdAt: ts(-5) },
  { id: 5, title: 'Batch Rejected — Cetirizine 10mg', message: 'Your donated batch CTZ-1102 (Cetirizine 10mg, 800 units) was rejected. Reason: Lot under FDA recall MedWatch #RCL-8829.', type: 'BATCH_REJECTED', isRead: true, createdAt: ts(-10) },
  { id: 6, title: 'Request Rejected — Prednisone 10mg', message: 'Your request for 100 units of Prednisone 10mg from CityMed Distributors was rejected. Insufficient clinical justification for controlled substance redistribution.', type: 'REQUEST_REJECTED', isRead: true, createdAt: ts(-10) },
]

// ── Organization Profile ──────────────────────────────
export const myOrg = {
  id: 1,
  name: 'Metro General Hospital',
  type: 'HOSPITAL',
  registrationNumber: 'REG-MGH-2019-0482',
  licenceReference: 'DEA-FM8293110',
  address: '450 Lexington Avenue',
  city: 'New York',
  state: 'NY',
  zip: '10017',
  storageType: 'REFRIGERATED',
  contactName: 'Dr. Eleanor Vance',
  contactLicence: 'RPH-NY-29481',
  email: 'user@medishare.health',
  status: 'VERIFIED',
  verifiedAt: ts(-90),
  createdAt: ts(-180),
}

// ── Admin Dashboard ───────────────────────────────────
export const adminDashboard = {
  totalOrganizations: 438,
  pendingOrgs: 7,
  totalBatches: 1284,
  pendingBatches: 14,
  totalRequests: 862,
  pendingRequests: 9,
  activeTransfers: 23,
  expiringBatches: 18,
  monthlyTrend: [
    { month: 'May', donated: 890, transferred: 640, requests: 720 },
    { month: 'Jun', donated: 1120, transferred: 820, requests: 950 },
    { month: 'Jul', donated: 980, transferred: 910, requests: 880 },
    { month: 'Aug', donated: 1340, transferred: 1050, requests: 1200 },
    { month: 'Sep', donated: 1560, transferred: 1280, requests: 1420 },
    { month: 'Oct', donated: 1210, transferred: 980, requests: 1100 },
  ],
  orgBreakdown: [
    { type: 'Hospital', count: 182 },
    { type: 'Pharmacy', count: 124 },
    { type: 'Clinic', count: 89 },
    { type: 'NGO', count: 43 },
  ],
  recentActivity: [
    { id: 1, action: 'verified organization', entity: 'Harbor View Clinic', user: 'Admin CCO', timestamp: ts(0) },
    { id: 2, action: 'approved batch', entity: 'Amoxicillin 500mg #AMX-20241', user: 'Admin CCO', timestamp: ts(0) },
    { id: 3, action: 'approved request', entity: 'REQ-8829 (Ciprofloxacin 250mg)', user: 'Admin CCO', timestamp: ts(-1) },
    { id: 4, action: 'rejected batch', entity: 'Cetirizine 10mg #CTZ-1102', user: 'Admin CCO', timestamp: ts(-2) },
    { id: 5, action: 'new org registration', entity: 'PharmaUnity NGO', user: 'System', timestamp: ts(-3) },
  ],
}

// ── Admin Orgs ────────────────────────────────────────
export const adminOrgs = [
  { id: 1, name: 'Metro General Hospital', type: 'HOSPITAL', registrationNumber: 'REG-MGH-2019-0482', licenceReference: 'DEA-FM8293110', address: '450 Lexington Ave', city: 'New York', state: 'NY', zip: '10017', contactName: 'Dr. Eleanor Vance', contactLicence: 'RPH-NY-29481', email: 'user@medishare.health', status: 'VERIFIED', storageType: 'REFRIGERATED', createdAt: ts(-180) },
  { id: 2, name: 'Harbor View Clinic', type: 'CLINIC', registrationNumber: 'REG-HVC-2024-1192', licenceReference: 'DEA-GH4102938', address: '88 Ocean Blvd', city: 'San Diego', state: 'CA', zip: '92101', contactName: 'Dr. James Chen', contactLicence: 'RPH-CA-55281', email: 'jchen@harborview.org', status: 'PENDING', storageType: 'AMBIENT', createdAt: ts(-2) },
  { id: 3, name: 'PharmaUnity NGO', type: 'NGO', registrationNumber: 'REG-PUN-2024-0893', licenceReference: '', address: '12 Mission St', city: 'San Francisco', state: 'CA', zip: '94105', contactName: 'Maria Santos', contactLicence: '', email: 'msantos@pharmaunity.org', status: 'PENDING', storageType: 'AMBIENT', createdAt: ts(-3) },
  { id: 4, name: 'CareFirst Medical Center', type: 'HOSPITAL', registrationNumber: 'REG-CFM-2020-0291', licenceReference: 'DEA-BC9301047', address: '200 Park Rd', city: 'Chicago', state: 'IL', zip: '60601', contactName: 'Dr. Sarah Kim', contactLicence: 'RPH-IL-33891', email: 'skim@carefirst.org', status: 'VERIFIED', storageType: 'REFRIGERATED', createdAt: ts(-120) },
]

// ── Admin Pending Batches ─────────────────────────────
export const adminBatches = [
  ...myBatches.map(b => ({ ...b, organizationName: 'Metro General Hospital' })),
  { id: 20, medicineName: 'Diazepam 5mg Tablets', ndcCode: '00378-0345-01', lotNumber: 'DZP-7701', expiryDate: d(90), quantity: 150, status: 'PENDING_REVIEW', storageType: 'AMBIENT', createdAt: ts(-1), daysToExpiry: 90, organizationName: 'CareFirst Medical Center', dosageForm: 'TABLET', strength: '5mg', manufacturerName: 'Mylan Pharmaceuticals', packagingIntegrity: true, notRecalled: true, specialNotes: 'Schedule IV controlled substance. DEA order form 222 attached.', storageLog: '' },
  { id: 21, medicineName: 'Ceftriaxone 1g Injection', ndcCode: '00781-3318-95', lotNumber: 'CFX-2290', expiryDate: d(150), quantity: 80, status: 'PENDING_REVIEW', storageType: 'REFRIGERATED', createdAt: ts(-1), daysToExpiry: 150, organizationName: 'St. Luke\'s Pharmacy', dosageForm: 'INJECTION', strength: '1g', manufacturerName: 'Sandoz Inc.', packagingIntegrity: true, notRecalled: true, specialNotes: '', storageLog: 'Logger #DL-4820' },
]

// ── Admin Requests ────────────────────────────────────
export const adminRequests = [
  { id: 1, medicineName: 'Ciprofloxacin 250mg', ndcCode: '00093-0861-01', requestedQuantity: 200, status: 'APPROVED', requesterOrg: 'Metro General Hospital', donorOrg: 'St. Luke\'s Pharmacy', clinicalNote: 'UTI outbreak in ward 4B. Immediate need for oral fluoroquinolone supply.', createdAt: ts(-5) },
  { id: 2, medicineName: 'Lisinopril 10mg', ndcCode: '00093-7342-01', requestedQuantity: 500, status: 'PENDING', requesterOrg: 'Metro General Hospital', donorOrg: 'CareFirst Medical Center', clinicalNote: 'Chronic care outpatient refills. Current stock critically low.', createdAt: ts(-1) },
  { id: 3, medicineName: 'Omeprazole 20mg', ndcCode: '00378-6020-91', requestedQuantity: 350, status: 'PENDING', requesterOrg: 'Metro General Hospital', donorOrg: 'Unity Health Pharmacy', clinicalNote: 'GI clinic protocol. Needed for step-down therapy program.', createdAt: ts(0) },
  { id: 4, medicineName: 'Epinephrine 1mg/mL', ndcCode: '00517-1071-25', requestedQuantity: 50, status: 'PENDING', requesterOrg: 'Harbor View Clinic', donorOrg: 'Regional Trauma Center', clinicalNote: 'Emergency anaphylaxis kits replenishment.', createdAt: ts(0) },
]

// ── Admin Transfers ───────────────────────────────────
export const adminTransfers = [
  ...myTransfers.map(t => ({ ...t })),
  { id: 4, medicineName: 'Azithromycin 250mg Tablets', ndcCode: '00093-7169-56', quantity: 300, status: 'APPROVED', donorOrg: 'PharmaUnity NGO', recipientOrg: 'Harbor View Clinic', trackingId: null, temperatureStatus: null, createdAt: ts(-1) },
]

// ── Admin Reports ─────────────────────────────────────
export const adminReports = {
  summary: { totalDonations: 1284, totalTransfers: 862, totalRequests: 1420, totalOrganizations: 438, totalUnitsSaved: 142890, estimatedValueSaved: '$4.82M' },
  monthlyTrend: adminDashboard.monthlyTrend.map(m => ({ month: m.month, donations: m.donated, transfers: m.transferred, requests: m.requests })),
  topMedicines: [
    { name: 'Amoxicillin', quantity: 18200 },
    { name: 'Metformin', quantity: 15600 },
    { name: 'Atorvastatin', quantity: 12400 },
    { name: 'Lisinopril', quantity: 9800 },
    { name: 'Omeprazole', quantity: 8200 },
  ],
  topDonors: [
    { name: 'Metro General Hospital', batches: 42, units: 18400 },
    { name: 'Mercy General Hospital', batches: 38, units: 15200 },
    { name: 'CareFirst Medical Center', batches: 31, units: 12800 },
    { name: 'St. Luke\'s Pharmacy', batches: 27, units: 9600 },
    { name: 'PharmaUnity NGO', batches: 19, units: 7400 },
  ],
}

// ── Audit Logs ────────────────────────────────────────
export const auditLogs = [
  { id: 1, action: 'VERIFY', entityType: 'ORGANIZATION', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Verified Metro General Hospital credentials', ipAddress: '10.0.1.42', timestamp: ts(0) },
  { id: 2, action: 'APPROVE', entityType: 'BATCH', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Approved Amoxicillin 500mg batch AMX-20241', ipAddress: '10.0.1.42', timestamp: ts(0) },
  { id: 3, action: 'CREATE', entityType: 'BATCH', entityId: 4, userId: 1, userName: 'Dr. Eleanor Vance', userRole: 'USER', details: 'Submitted Insulin Glargine batch IG-7791 for review', ipAddress: '172.16.0.8', timestamp: ts(-1) },
  { id: 4, action: 'APPROVE', entityType: 'REQUEST', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Approved request REQ-001 for Ciprofloxacin 200 units', ipAddress: '10.0.1.42', timestamp: ts(-1) },
  { id: 5, action: 'DISPATCH', entityType: 'TRANSFER', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Dispatched transfer MS-TRK-88201', ipAddress: '10.0.1.42', timestamp: ts(-3) },
  { id: 6, action: 'REJECT', entityType: 'BATCH', entityId: 6, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Rejected Cetirizine lot CTZ-1102 — FDA recall MedWatch #RCL-8829', ipAddress: '10.0.1.42', timestamp: ts(-5) },
  { id: 7, action: 'LOGIN', entityType: 'USER', entityId: 1, userId: 1, userName: 'Dr. Eleanor Vance', userRole: 'USER', details: 'Successful login from IP 172.16.0.8', ipAddress: '172.16.0.8', timestamp: ts(-5) },
  { id: 8, action: 'CREATE', entityType: 'ORGANIZATION', entityId: 3, userId: 0, userName: 'System', userRole: 'SYSTEM', details: 'New organization registration: PharmaUnity NGO', ipAddress: '0.0.0.0', timestamp: ts(-7) },
]
