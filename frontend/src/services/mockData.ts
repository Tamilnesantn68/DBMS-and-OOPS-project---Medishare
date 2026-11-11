/**
 * MediShare Dynamic Data Engine & Persistent Mock Store.
 * Backed by localStorage so that all CRUD operations (create, read, update, delete,
 * review, request, transfer, notifications) persist across reloads and pages.
 */

const STORAGE_KEYS = {
  BATCHES: 'medishare_store_batches_v2',
  REQUESTS: 'medishare_store_requests_v2',
  TRANSFERS: 'medishare_store_transfers_v2',
  NOTIFICATIONS: 'medishare_store_notifications_v2',
  ORGS: 'medishare_store_orgs_v2',
  AUDIT: 'medishare_store_audit_v2',
  SETTINGS: 'medishare_store_settings_v2',
  USERS: 'medishare_store_users_v2',
}

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

const computeDaysRemaining = (expiryDateStr: string): number => {
  const expiry = new Date(expiryDateStr)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

// ── Default Seed Data ─────────────────────────────────

const INITIAL_ORGS = [
  { id: 1, name: 'Metro General Hospital', type: 'HOSPITAL', registrationNumber: 'REG-MGH-2019-0482', licenceReference: 'DEA-FM8293110', address: '450 Lexington Ave', city: 'New York', state: 'NY', zip: '10017', contactName: 'Dr. Eleanor Vance', contactLicence: 'RPH-NY-29481', email: 'user@medishare.health', status: 'VERIFIED', storageType: 'REFRIGERATED', createdAt: ts(-180), verifiedAt: ts(-90) },
  { id: 2, name: 'Harbor View Clinic', type: 'CLINIC', registrationNumber: 'REG-HVC-2024-1192', licenceReference: 'DEA-GH4102938', address: '88 Ocean Blvd', city: 'San Diego', state: 'CA', zip: '92101', contactName: 'Dr. James Chen', contactLicence: 'RPH-CA-55281', email: 'jchen@harborview.org', status: 'PENDING', storageType: 'AMBIENT', createdAt: ts(-2) },
  { id: 3, name: 'PharmaUnity NGO', type: 'NGO', registrationNumber: 'REG-PUN-2024-0893', licenceReference: '', address: '12 Mission St', city: 'San Francisco', state: 'CA', zip: '94105', contactName: 'Maria Santos', contactLicence: '', email: 'msantos@pharmaunity.org', status: 'PENDING', storageType: 'AMBIENT', createdAt: ts(-3) },
  { id: 4, name: 'CareFirst Medical Center', type: 'HOSPITAL', registrationNumber: 'REG-CFM-2020-0291', licenceReference: 'DEA-BC9301047', address: '200 Park Rd', city: 'Chicago', state: 'IL', zip: '60601', contactName: 'Dr. Sarah Kim', contactLicence: 'RPH-IL-33891', email: 'skim@carefirst.org', status: 'VERIFIED', storageType: 'REFRIGERATED', createdAt: ts(-120) },
  { id: 5, name: 'St. Luke\'s Pharmacy', type: 'PHARMACY', registrationNumber: 'REG-SLP-2021-0812', licenceReference: 'DEA-SL9910245', address: '120 Main Street', city: 'Boston', state: 'MA', zip: '02115', contactName: 'David Miller, RPh', contactLicence: 'RPH-MA-88192', email: 'dmiller@stlukes.org', status: 'VERIFIED', storageType: 'AMBIENT', createdAt: ts(-150) },
]

const INITIAL_BATCHES = [
  { id: 1, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Amoxicillin 500mg Capsules', ndcCode: '65162-0019-50', lotNumber: 'AMX-20241', manufacturerName: 'Amneal Pharmaceuticals', dosageForm: 'CAPSULE', strength: '500mg', expiryDate: d(95), quantity: 500, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-30), daysToExpiry: 95 },
  { id: 2, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Metformin HCl 850mg Tablets', ndcCode: '00228-2770-11', lotNumber: 'MET-8830', manufacturerName: 'Actavis Pharma', dosageForm: 'TABLET', strength: '850mg', expiryDate: d(72), quantity: 1200, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-25), daysToExpiry: 72 },
  { id: 3, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Human Albumin 20% Infusion', ndcCode: '00944-2833-04', lotNumber: 'HA-4412', manufacturerName: 'CSL Behring', dosageForm: 'INFUSION', strength: '20%', expiryDate: d(28), quantity: 60, status: 'APPROVED', storageType: 'REFRIGERATED', storageLog: 'Logger #TL-1102', packagingIntegrity: true, notRecalled: true, specialNotes: 'Requires 2–8°C cold-chain throughout. Do not freeze.', createdAt: ts(-20), daysToExpiry: 28 },
  { id: 4, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Insulin Glargine 100U/mL', ndcCode: '00088-2220-33', lotNumber: 'IG-7791', manufacturerName: 'Sanofi-Aventis', dosageForm: 'INJECTION', strength: '100U/mL', expiryDate: d(120), quantity: 300, status: 'PENDING_REVIEW', storageType: 'REFRIGERATED', storageLog: 'Logger #DL-3301', packagingIntegrity: true, notRecalled: true, specialNotes: 'Pen cartridges. Store at 2–8°C before first use.', createdAt: ts(-3), daysToExpiry: 120 },
  { id: 5, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Atorvastatin 20mg Tablets', ndcCode: '00378-3952-77', lotNumber: 'ATV-5503', manufacturerName: 'Mylan Pharmaceuticals', dosageForm: 'TABLET', strength: '20mg', expiryDate: d(180), quantity: 2000, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-15), daysToExpiry: 180 },
  { id: 6, organizationId: 1, organizationName: 'Metro General Hospital', medicineName: 'Cetirizine 10mg Tablets', ndcCode: '00904-6733-61', lotNumber: 'CTZ-1102', manufacturerName: 'Major Pharmaceuticals', dosageForm: 'TABLET', strength: '10mg', expiryDate: d(45), quantity: 800, status: 'REJECTED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: false, specialNotes: '', createdAt: ts(-10), daysToExpiry: 45, reviewNote: 'Lot under FDA recall MedWatch #RCL-8829' },
  { id: 10, organizationId: 5, organizationName: 'St. Luke\'s Pharmacy', medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', lotNumber: 'CIP-3302', manufacturerName: 'Teva Pharmaceuticals', dosageForm: 'TABLET', strength: '250mg', expiryDate: d(110), quantity: 400, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-18), daysToExpiry: 110 },
  { id: 11, organizationId: 4, organizationName: 'CareFirst Medical Center', medicineName: 'Lisinopril 10mg Tablets', ndcCode: '00093-7342-01', lotNumber: 'LIS-9900', manufacturerName: 'Lupin Pharmaceuticals', dosageForm: 'TABLET', strength: '10mg', expiryDate: d(88), quantity: 1500, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-12), daysToExpiry: 88 },
  { id: 12, organizationId: 5, organizationName: 'Unity Health Pharmacy', medicineName: 'Omeprazole 20mg DR Capsules', ndcCode: '00378-6020-91', lotNumber: 'OMP-5541', manufacturerName: 'Mylan Pharmaceuticals', dosageForm: 'CAPSULE', strength: '20mg', expiryDate: d(65), quantity: 900, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-14), daysToExpiry: 65 },
  { id: 13, organizationId: 4, organizationName: 'Regional Trauma Center', medicineName: 'Epinephrine 1mg/mL Injection', ndcCode: '00517-1071-25', lotNumber: 'EPI-4420', manufacturerName: 'American Regent', dosageForm: 'INJECTION', strength: '1mg/mL', expiryDate: d(75), quantity: 100, status: 'APPROVED', storageType: 'REFRIGERATED', storageLog: 'Logger #DL-9011', packagingIntegrity: true, notRecalled: true, specialNotes: 'Ampules. Keep protected from light.', createdAt: ts(-8), daysToExpiry: 75 },
  { id: 14, organizationId: 3, organizationName: 'PharmaUnity NGO', medicineName: 'Azithromycin 250mg Tablets', ndcCode: '00093-7169-56', lotNumber: 'AZI-2208', manufacturerName: 'Teva Pharmaceuticals', dosageForm: 'TABLET', strength: '250mg', expiryDate: d(140), quantity: 600, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-5), daysToExpiry: 140 },
  { id: 15, organizationId: 4, organizationName: 'Mercy General Hospital', medicineName: 'Levothyroxine 50mcg Tablets', ndcCode: '00378-1805-01', lotNumber: 'LVT-8891', manufacturerName: 'Mylan Pharmaceuticals', dosageForm: 'TABLET', strength: '50mcg', expiryDate: d(200), quantity: 3000, status: 'APPROVED', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-2), daysToExpiry: 200 },
  { id: 20, organizationId: 4, organizationName: 'CareFirst Medical Center', medicineName: 'Diazepam 5mg Tablets', ndcCode: '00378-0345-01', lotNumber: 'DZP-7701', manufacturerName: 'Mylan Pharmaceuticals', dosageForm: 'TABLET', strength: '5mg', expiryDate: d(90), quantity: 150, status: 'PENDING_REVIEW', storageType: 'AMBIENT', storageLog: '', packagingIntegrity: true, notRecalled: true, specialNotes: 'Schedule IV controlled substance documentation attached.', createdAt: ts(-1), daysToExpiry: 90 },
  { id: 21, organizationId: 5, organizationName: 'St. Luke\'s Pharmacy', medicineName: 'Ceftriaxone 1g Injection', ndcCode: '00781-3318-95', lotNumber: 'CFX-2290', manufacturerName: 'Sandoz Inc.', dosageForm: 'INJECTION', strength: '1g', expiryDate: d(150), quantity: 80, status: 'PENDING_REVIEW', storageType: 'REFRIGERATED', storageLog: 'Logger #DL-4820', packagingIntegrity: true, notRecalled: true, specialNotes: '', createdAt: ts(-1), daysToExpiry: 150 },
]

const INITIAL_REQUESTS = [
  { id: 1, batchId: 10, medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', requestedQuantity: 200, status: 'APPROVED', requesterOrg: 'Metro General Hospital', donorOrganization: 'St. Luke\'s Pharmacy', donorOrg: 'St. Luke\'s Pharmacy', clinicalNote: 'UTI outbreak in ward 4B. Immediate need.', createdAt: ts(-5), adminNote: 'Verified and approved by Clinical Pharmacist.' },
  { id: 2, batchId: 11, medicineName: 'Lisinopril 10mg Tablets', ndcCode: '00093-7342-01', requestedQuantity: 500, status: 'PENDING', requesterOrg: 'Metro General Hospital', donorOrganization: 'CareFirst Medical Center', donorOrg: 'CareFirst Medical Center', clinicalNote: 'Chronic care outpatient refills.', createdAt: ts(-1), adminNote: null },
  { id: 3, batchId: 12, medicineName: 'Omeprazole 20mg Capsules', ndcCode: '00378-6020-91', requestedQuantity: 350, status: 'PENDING', requesterOrg: 'Metro General Hospital', donorOrganization: 'Unity Health Pharmacy', donorOrg: 'Unity Health Pharmacy', clinicalNote: 'GI clinic protocol.', createdAt: ts(0), adminNote: null },
  { id: 4, batchId: 13, medicineName: 'Epinephrine 1mg/mL Injection', ndcCode: '00517-1071-25', requestedQuantity: 50, status: 'PENDING', requesterOrg: 'Harbor View Clinic', donorOrganization: 'Regional Trauma Center', donorOrg: 'Regional Trauma Center', clinicalNote: 'Emergency anaphylaxis kits replenishment.', createdAt: ts(0), adminNote: null },
  { id: 5, batchId: 5, medicineName: 'Prednisone 10mg Tablets', ndcCode: '00591-5442-01', requestedQuantity: 100, status: 'REJECTED', requesterOrg: 'Metro General Hospital', donorOrganization: 'CityMed Distributors', donorOrg: 'CityMed Distributors', clinicalNote: 'Rheumatoid arthritis clinic.', createdAt: ts(-10), adminNote: 'Insufficient clinical justification for redistribution protocol.' },
]

const INITIAL_TRANSFERS = [
  { id: 1, requestId: 1, batchId: 10, medicineName: 'Ciprofloxacin 250mg Tablets', ndcCode: '00093-0861-01', quantity: 200, status: 'DELIVERED', donorOrg: 'St. Luke\'s Pharmacy', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-88201', temperatureStatus: 'COMPLIANT', dispatchedAt: ts(-3), deliveredAt: ts(-1), createdAt: ts(-4) },
  { id: 2, requestId: 2, batchId: 11, medicineName: 'Acetaminophen 500mg Tablets', ndcCode: '00904-1982-60', quantity: 1000, status: 'IN_TRANSIT', donorOrg: 'Mercy General Hospital', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-88245', temperatureStatus: null, dispatchedAt: ts(-1), deliveredAt: null, createdAt: ts(-2) },
  { id: 3, requestId: 3, batchId: 12, medicineName: 'Metoprolol Tartrate 25mg', ndcCode: '00378-0222-01', quantity: 600, status: 'RECEIPT_CONFIRMED', donorOrg: 'Unity Health Pharmacy', recipientOrg: 'Metro General Hospital', trackingId: 'MS-TRK-87990', temperatureStatus: 'COMPLIANT', dispatchedAt: ts(-10), deliveredAt: ts(-8), createdAt: ts(-12) },
  { id: 4, requestId: 4, batchId: 14, medicineName: 'Azithromycin 250mg Tablets', ndcCode: '00093-7169-56', quantity: 300, status: 'APPROVED', donorOrg: 'PharmaUnity NGO', recipientOrg: 'Harbor View Clinic', trackingId: 'MS-TRK-89110', temperatureStatus: null, createdAt: ts(-1) },
]

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Batch Approved — Insulin Glargine', message: 'Your donated batch IG-7791 (Insulin Glargine 100U/mL, 300 units) has been reviewed and approved by the clinical pharmacist. It is now listed on the marketplace.', type: 'BATCH_APPROVED', isRead: false, createdAt: ts(0) },
  { id: 2, title: 'Transfer Delivered — Ciprofloxacin', message: 'Transfer MS-TRK-88201 for Ciprofloxacin 250mg (200 units) from St. Luke\'s Pharmacy has been marked as delivered. Please confirm receipt.', type: 'TRANSFER_UPDATE', isRead: false, createdAt: ts(-1) },
  { id: 3, title: 'Expiry Alert — Human Albumin 20%', message: 'Your batch HA-4412 (Human Albumin 20% Infusion) has only 28 days until expiry. Consider withdrawing if no transfer is imminent.', type: 'EXPIRY_ALERT', isRead: false, createdAt: ts(-2) },
  { id: 4, title: 'Request Approved — Ciprofloxacin', message: 'Your request for 200 units of Ciprofloxacin 250mg from St. Luke\'s Pharmacy has been approved. Transfer logistics are being coordinated.', type: 'REQUEST_APPROVED', isRead: true, createdAt: ts(-5) },
  { id: 5, title: 'Batch Rejected — Cetirizine 10mg', message: 'Your donated batch CTZ-1102 (Cetirizine 10mg, 800 units) was rejected. Reason: Lot under FDA recall MedWatch #RCL-8829.', type: 'BATCH_REJECTED', isRead: true, createdAt: ts(-10) },
]

const INITIAL_AUDIT = [
  { id: 1, action: 'VERIFY', entityType: 'ORGANIZATION', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Verified Metro General Hospital credentials', ipAddress: '10.0.1.42', timestamp: ts(0) },
  { id: 2, action: 'APPROVE', entityType: 'BATCH', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Approved Amoxicillin 500mg batch AMX-20241', ipAddress: '10.0.1.42', timestamp: ts(0) },
  { id: 3, action: 'CREATE', entityType: 'BATCH', entityId: 4, userId: 1, userName: 'Dr. Eleanor Vance', userRole: 'USER', details: 'Submitted Insulin Glargine batch IG-7791 for review', ipAddress: '172.16.0.8', timestamp: ts(-1) },
  { id: 4, action: 'APPROVE', entityType: 'REQUEST', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Approved request REQ-001 for Ciprofloxacin 200 units', ipAddress: '10.0.1.42', timestamp: ts(-1) },
  { id: 5, action: 'DISPATCH', entityType: 'TRANSFER', entityId: 1, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Dispatched transfer MS-TRK-88201', ipAddress: '10.0.1.42', timestamp: ts(-3) },
  { id: 6, action: 'REJECT', entityType: 'BATCH', entityId: 6, userId: 99, userName: 'Chief Compliance Officer', userRole: 'ADMIN', details: 'Rejected Cetirizine lot CTZ-1102 — FDA recall MedWatch #RCL-8829', ipAddress: '10.0.1.42', timestamp: ts(-5) },
  { id: 7, action: 'LOGIN', entityType: 'USER', entityId: 1, userId: 1, userName: 'Dr. Eleanor Vance', userRole: 'USER', details: 'Successful login from IP 172.16.0.8', ipAddress: '172.16.0.8', timestamp: ts(-5) },
]

const INITIAL_SETTINGS = {
  min_expiry_days: '60',
  max_cold_chain_excursion: '0.5',
  auto_withdrawal_days: '14',
  audit_retention_years: '6',
}

// ── Storage Helpers ───────────────────────────────────

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData))
      return defaultData
    }
    return JSON.parse(raw) as T
  } catch {
    return defaultData
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage quota exceeded
  }
}

// ── Batches Store ─────────────────────────────────────

export function getMyBatches(params?: { status?: string }): typeof INITIAL_BATCHES {
  let list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  // Recompute days to expiry dynamically
  list = list.map(b => ({ ...b, daysToExpiry: computeDaysRemaining(b.expiryDate) }))
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(b => b.status === params.status)
  }
  return list
}

export function createBatch(data: Record<string, unknown>): (typeof INITIAL_BATCHES)[0] {
  const list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const newId = Date.now()
  const expiryDate = String(data.expiryDate || d(90))
  const newBatch = {
    id: newId,
    organizationId: 1,
    organizationName: 'Metro General Hospital',
    medicineName: String(data.medicineName || 'Medicine'),
    ndcCode: String(data.ndcCode || '00000-000-00'),
    lotNumber: String(data.lotNumber || `LOT-${newId}`),
    manufacturerName: String(data.manufacturerName || 'Generic Manufacturer'),
    dosageForm: String(data.dosageForm || 'TABLET'),
    strength: String(data.strength || 'Standard'),
    expiryDate,
    quantity: Number(data.quantity || 100),
    status: 'PENDING_REVIEW',
    storageType: String(data.storageType || 'AMBIENT'),
    storageLog: String(data.storageLog || ''),
    packagingIntegrity: Boolean(data.packagingIntegrity),
    notRecalled: Boolean(data.notRecalled),
    specialNotes: String(data.specialNotes || ''),
    createdAt: ts(0),
    daysToExpiry: computeDaysRemaining(expiryDate),
  }
  list.unshift(newBatch)
  saveToStorage(STORAGE_KEYS.BATCHES, list)

  addAuditLog({ action: 'CREATE', entityType: 'BATCH', entityId: newId, details: `Submitted batch ${newBatch.medicineName} (#${newBatch.lotNumber})` })
  return newBatch
}

export function updateBatch(id: number, data: Record<string, unknown>): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const idx = list.findIndex(b => b.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data }
    if (data.expiryDate) {
      list[idx].daysToExpiry = computeDaysRemaining(String(data.expiryDate))
    }
    saveToStorage(STORAGE_KEYS.BATCHES, list)
    addAuditLog({ action: 'UPDATE', entityType: 'BATCH', entityId: id, details: `Updated batch ${list[idx].medicineName}` })
  }
  return { message: `Batch ${id} updated` }
}

export function withdrawBatch(id: number): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const idx = list.findIndex(b => b.id === id)
  if (idx !== -1) {
    list[idx].status = 'WITHDRAWN'
    saveToStorage(STORAGE_KEYS.BATCHES, list)
    addAuditLog({ action: 'WITHDRAW', entityType: 'BATCH', entityId: id, details: `Withdrew batch ${list[idx].medicineName}` })
  }
  return { message: `Batch ${id} withdrawn` }
}

export function deleteBatch(id: number): { message: string } {
  let list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const item = list.find(b => b.id === id)
  list = list.filter(b => b.id !== id)
  saveToStorage(STORAGE_KEYS.BATCHES, list)
  if (item) {
    addAuditLog({ action: 'DELETE', entityType: 'BATCH', entityId: id, details: `Deleted batch ${item.medicineName} (#${item.lotNumber})` })
  }
  return { message: `Batch ${id} deleted` }
}

export function getAdminBatches(params?: { status?: string; expiringWithin?: string; q?: string }): typeof INITIAL_BATCHES {
  let list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  list = list.map(b => ({ ...b, daysToExpiry: computeDaysRemaining(b.expiryDate) }))
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(b => b.status === params.status)
  }
  if (params?.expiringWithin) {
    const days = parseInt(params.expiringWithin, 10)
    if (!isNaN(days)) {
      list = list.filter(b => b.daysToExpiry <= days)
    }
  }
  if (params?.q) {
    const q = params.q.toLowerCase()
    list = list.filter(b => b.medicineName.toLowerCase().includes(q) || b.ndcCode.toLowerCase().includes(q) || b.lotNumber.toLowerCase().includes(q))
  }
  return list
}

export function reviewBatch(id: number, data: { status: string; reviewNote?: string }): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const idx = list.findIndex(b => b.id === id)
  if (idx !== -1) {
    list[idx].status = data.status
    if (data.reviewNote) list[idx].reviewNote = data.reviewNote
    saveToStorage(STORAGE_KEYS.BATCHES, list)

    addAuditLog({ action: data.status === 'APPROVED' ? 'APPROVE' : 'REJECT', entityType: 'BATCH', entityId: id, details: `${data.status === 'APPROVED' ? 'Approved' : 'Rejected'} batch ${list[idx].medicineName}: ${data.reviewNote || ''}` })

    // Create donor notification
    addNotification({
      title: `Batch ${data.status === 'APPROVED' ? 'Approved' : 'Rejected'} — ${list[idx].medicineName}`,
      message: data.status === 'APPROVED' ? `Your donated batch ${list[idx].lotNumber} has been verified and approved.` : `Your batch was rejected. Note: ${data.reviewNote || 'Does not meet redistribution guidelines.'}`,
      type: data.status === 'APPROVED' ? 'BATCH_APPROVED' : 'BATCH_REJECTED',
    })
  }
  return { message: `Batch ${id} reviewed as ${data.status}` }
}

// ── Marketplace Store ─────────────────────────────────

export function getMarketplace(params?: { q?: string; storageType?: string }): Array<{ id: number; medicineName: string; ndcCode: string; lotNumber: string; expiryDate: string; availableQuantity: number; storageType: string; donorOrganization: string; daysToExpiry: number; dosageForm: string; strength: string }> {
  const batches = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  let list = batches
    .filter(b => b.status === 'APPROVED' && b.quantity > 0)
    .map(b => ({
      id: b.id,
      medicineName: b.medicineName,
      ndcCode: b.ndcCode,
      lotNumber: b.lotNumber,
      expiryDate: b.expiryDate,
      availableQuantity: b.quantity,
      storageType: b.storageType,
      donorOrganization: b.organizationName,
      daysToExpiry: computeDaysRemaining(b.expiryDate),
      dosageForm: b.dosageForm,
      strength: b.strength,
    }))

  if (params?.q) {
    const q = params.q.toLowerCase()
    list = list.filter(m => m.medicineName.toLowerCase().includes(q) || m.ndcCode.toLowerCase().includes(q) || m.lotNumber.toLowerCase().includes(q))
  }
  if (params?.storageType && params.storageType !== 'ALL') {
    list = list.filter(m => m.storageType === params.storageType)
  }
  return list
}

// ── Requests Store ────────────────────────────────────

export function getMyRequests(params?: { status?: string }): typeof INITIAL_REQUESTS {
  let list = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(r => r.status === params.status)
  }
  return list
}

export function createRequest(data: { batchId: number; requestedQuantity: number; clinicalNote?: string }): (typeof INITIAL_REQUESTS)[0] {
  const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  const batches = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
  const batch = batches.find(b => b.id === data.batchId)

  const newId = Date.now()
  const newReq = {
    id: newId,
    batchId: data.batchId,
    medicineName: batch?.medicineName || 'Medicine',
    ndcCode: batch?.ndcCode || '00000-000-00',
    requestedQuantity: data.requestedQuantity,
    status: 'PENDING',
    requesterOrg: 'Metro General Hospital',
    donorOrganization: batch?.organizationName || 'Verified Donor',
    donorOrg: batch?.organizationName || 'Verified Donor',
    clinicalNote: data.clinicalNote || 'Clinical protocol requisition.',
    createdAt: ts(0),
    adminNote: null,
  }
  requests.unshift(newReq)
  saveToStorage(STORAGE_KEYS.REQUESTS, requests)

  addAuditLog({ action: 'CREATE', entityType: 'REQUEST', entityId: newId, details: `Created request for ${data.requestedQuantity} units of ${newReq.medicineName}` })
  return newReq
}

export function cancelRequest(id: number): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  const idx = list.findIndex(r => r.id === id)
  if (idx !== -1) {
    list[idx].status = 'CANCELLED'
    saveToStorage(STORAGE_KEYS.REQUESTS, list)
    addAuditLog({ action: 'CANCEL', entityType: 'REQUEST', entityId: id, details: `Cancelled request for ${list[idx].medicineName}` })
  }
  return { message: `Request ${id} cancelled` }
}

export function getAdminRequests(params?: { status?: string }): typeof INITIAL_REQUESTS {
  let list = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(r => r.status === params.status)
  }
  return list
}

export function approveRequest(id: number): { message: string } {
  const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  const reqIdx = requests.findIndex(r => r.id === id)
  if (reqIdx !== -1) {
    requests[reqIdx].status = 'APPROVED'
    saveToStorage(STORAGE_KEYS.REQUESTS, requests)

    const req = requests[reqIdx]

    // Deduct available quantity from batch
    const batches = loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES)
    const batchIdx = batches.findIndex(b => b.id === req.batchId)
    if (batchIdx !== -1) {
      batches[batchIdx].quantity = Math.max(0, batches[batchIdx].quantity - req.requestedQuantity)
      saveToStorage(STORAGE_KEYS.BATCHES, batches)
    }

    // Automatically generate Transfer
    const transfers = loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
    const newTransferId = Date.now()
    const newTransfer = {
      id: newTransferId,
      requestId: req.id,
      batchId: req.batchId,
      medicineName: req.medicineName,
      ndcCode: req.ndcCode,
      quantity: req.requestedQuantity,
      status: 'APPROVED',
      donorOrg: req.donorOrganization,
      recipientOrg: req.requesterOrg,
      trackingId: `MS-TRK-${Math.floor(10000 + Math.random() * 90000)}`,
      temperatureStatus: null,
      createdAt: ts(0),
    }
    transfers.unshift(newTransfer)
    saveToStorage(STORAGE_KEYS.TRANSFERS, transfers)

    addAuditLog({ action: 'APPROVE', entityType: 'REQUEST', entityId: id, details: `Approved request for ${req.requestedQuantity} units of ${req.medicineName}. Created transfer ${newTransfer.trackingId}` })

    addNotification({
      title: `Request Approved — ${req.medicineName}`,
      message: `Your request for ${req.requestedQuantity} units from ${req.donorOrganization} has been approved. Tracking ID: ${newTransfer.trackingId}`,
      type: 'REQUEST_APPROVED',
    })
  }
  return { message: `Request ${id} approved` }
}

export function rejectRequest(id: number, data: { reviewNote?: string }): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  const idx = list.findIndex(r => r.id === id)
  if (idx !== -1) {
    list[idx].status = 'REJECTED'
    list[idx].adminNote = data.reviewNote || 'Request does not fulfill clinical reallocation criteria.'
    saveToStorage(STORAGE_KEYS.REQUESTS, list)

    addAuditLog({ action: 'REJECT', entityType: 'REQUEST', entityId: id, details: `Rejected request for ${list[idx].medicineName}: ${data.reviewNote || ''}` })

    addNotification({
      title: `Request Rejected — ${list[idx].medicineName}`,
      message: `Your request was rejected. Reason: ${data.reviewNote || 'Does not fulfill redistribution criteria.'}`,
      type: 'REQUEST_REJECTED',
    })
  }
  return { message: `Request ${id} rejected` }
}

// ── Transfers Store ───────────────────────────────────

export function getMyTransfers(): typeof INITIAL_TRANSFERS {
  return loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
}

export function getAdminTransfers(params?: { status?: string }): typeof INITIAL_TRANSFERS {
  let list = loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(t => t.status === params.status)
  }
  return list
}

export function dispatchTransfer(id: number): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
  const idx = list.findIndex(t => t.id === id)
  if (idx !== -1) {
    list[idx].status = 'IN_TRANSIT'
    list[idx].dispatchedAt = ts(0)
    saveToStorage(STORAGE_KEYS.TRANSFERS, list)
    addAuditLog({ action: 'DISPATCH', entityType: 'TRANSFER', entityId: id, details: `Dispatched transfer ${list[idx].trackingId || id}` })
    addNotification({
      title: `Transfer In Transit — ${list[idx].medicineName}`,
      message: `Consignment ${list[idx].trackingId || id} is in transit with cold-chain monitoring.`,
      type: 'TRANSFER_UPDATE',
    })
  }
  return { message: `Transfer ${id} dispatched` }
}

export function confirmReceipt(id: number, data: { temperatureStatus?: string; receiptNote?: string }): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
  const idx = list.findIndex(t => t.id === id)
  if (idx !== -1) {
    list[idx].status = 'RECEIPT_CONFIRMED'
    list[idx].deliveredAt = list[idx].deliveredAt || ts(0)
    list[idx].temperatureStatus = data.temperatureStatus || 'COMPLIANT'
    saveToStorage(STORAGE_KEYS.TRANSFERS, list)

    addAuditLog({ action: 'CONFIRM_RECEIPT', entityType: 'TRANSFER', entityId: id, details: `Confirmed receipt of transfer ${list[idx].trackingId || id}. Temperature status: ${data.temperatureStatus}` })
    addNotification({
      title: `Transfer Complete — ${list[idx].medicineName}`,
      message: `Receipt confirmed for ${list[idx].medicineName} (${list[idx].quantity} units). Cold-chain status: ${data.temperatureStatus || 'COMPLIANT'}.`,
      type: 'TRANSFER_UPDATE',
    })
  }
  return { message: `Transfer ${id} receipt confirmed` }
}

// ── Notifications Store ───────────────────────────────

export function getNotifications(): typeof INITIAL_NOTIFICATIONS {
  return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
}

export function markNotificationRead(id: number): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  const idx = list.findIndex(n => n.id === id)
  if (idx !== -1) {
    list[idx].isRead = true
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list)
  }
  return { message: `Notification ${id} marked read` }
}

export function markAllNotificationsRead(): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  const updated = list.map(n => ({ ...n, isRead: true }))
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated)
  return { message: 'All notifications marked read' }
}

function addNotification(notif: { title: string; message: string; type: string }): void {
  const list = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  const newNotif = {
    id: Date.now(),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    isRead: false,
    createdAt: ts(0),
  }
  list.unshift(newNotif)
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list)
}

// ── Organizations Store ───────────────────────────────

export function getAdminOrgs(params?: { status?: string }): typeof INITIAL_ORGS {
  let list = loadFromStorage(STORAGE_KEYS.ORGS, INITIAL_ORGS)
  if (params?.status && params.status !== 'ALL') {
    list = list.filter(o => o.status === params.status)
  }
  return list
}

export function updateOrgVerification(id: number, data: { status: string; reviewNote?: string }): { message: string } {
  const list = loadFromStorage(STORAGE_KEYS.ORGS, INITIAL_ORGS)
  const idx = list.findIndex(o => o.id === id)
  if (idx !== -1) {
    list[idx].status = data.status
    if (data.status === 'VERIFIED') list[idx].verifiedAt = ts(0)
    saveToStorage(STORAGE_KEYS.ORGS, list)
    addAuditLog({ action: data.status === 'VERIFIED' ? 'VERIFY' : 'REJECT', entityType: 'ORGANIZATION', entityId: id, details: `${data.status} organization ${list[idx].name}` })
  }
  return { message: `Organization ${id} updated` }
}

export function getMyOrg(): (typeof INITIAL_ORGS)[0] {
  const list = loadFromStorage(STORAGE_KEYS.ORGS, INITIAL_ORGS)
  return list[0] || INITIAL_ORGS[0]
}

export function updateMyOrg(data: Record<string, unknown>): (typeof INITIAL_ORGS)[0] {
  const list = loadFromStorage(STORAGE_KEYS.ORGS, INITIAL_ORGS)
  if (list.length > 0) {
    list[0] = { ...list[0], ...data }
    saveToStorage(STORAGE_KEYS.ORGS, list)
    return list[0]
  }
  return INITIAL_ORGS[0]
}

// ── Audit Logs Store ──────────────────────────────────

export function getAuditLogs(params?: { q?: string; entityType?: string }): typeof INITIAL_AUDIT {
  let list = loadFromStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT)
  if (params?.entityType && params.entityType !== 'ALL') {
    list = list.filter(a => a.entityType === params.entityType)
  }
  if (params?.q) {
    const q = params.q.toLowerCase()
    list = list.filter(a => a.details.toLowerCase().includes(q) || a.userName.toLowerCase().includes(q) || a.action.toLowerCase().includes(q))
  }
  return list
}

function addAuditLog(entry: { action: string; entityType: string; entityId: number; details: string }): void {
  const list = loadFromStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT)
  const newEntry = {
    id: Date.now(),
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    userId: 1,
    userName: 'Dr. Eleanor Vance',
    userRole: 'USER',
    details: entry.details,
    ipAddress: '127.0.0.1',
    timestamp: ts(0),
  }
  list.unshift(newEntry)
  saveToStorage(STORAGE_KEYS.AUDIT, list)
}

// ── System Settings Store ─────────────────────────────

export function getSettings(): typeof INITIAL_SETTINGS {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
}

export function updateSettings(data: Record<string, string>): typeof INITIAL_SETTINGS {
  const current = getSettings()
  const updated = { ...current, ...data }
  saveToStorage(STORAGE_KEYS.SETTINGS, updated)
  return updated
}

// ── Dashboards ────────────────────────────────────────

export function getUserDashboard() {
  const batches = getMyBatches()
  const requests = getMyRequests()
  const transfers = getMyTransfers()

  const activeDonations = batches.filter(b => b.status === 'APPROVED').length
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length
  const completedTransfers = transfers.filter(t => t.status === 'RECEIPT_CONFIRMED' || t.status === 'DELIVERED').length
  const totalUnitsDonated = batches.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + b.quantity, 0)
  const expiringCount = batches.filter(b => b.status === 'APPROVED' && b.daysToExpiry <= 30).length

  return {
    activeDonations: activeDonations || 12,
    activeDonationsChange: 8,
    pendingRequests: pendingRequests || 3,
    pendingRequestsChange: -2,
    completedTransfers: completedTransfers || 47,
    completedTransfersChange: 15,
    totalUnitsDonated: totalUnitsDonated || 8420,
    totalUnitsDonatedChange: 12,
    expiringCount: expiringCount || 2,
    monthlyTrend: [
      { month: 'May', donated: 320, received: 180 },
      { month: 'Jun', donated: 450, received: 290 },
      { month: 'Jul', donated: 380, received: 410 },
      { month: 'Aug', donated: 520, received: 350 },
      { month: 'Sep', donated: 610, received: 480 },
      { month: 'Oct', donated: 490, received: 390 },
    ],
    recentBatches: batches.slice(0, 5).map(b => ({
      id: b.id,
      name: b.medicineName,
      lot: b.lotNumber,
      expiryDate: b.expiryDate,
      quantity: b.quantity,
      status: b.status,
      daysToExpiry: b.daysToExpiry,
    })),
    recentRequests: requests.slice(0, 4).map(r => ({
      id: r.id,
      medicineName: r.medicineName,
      requestedQty: r.requestedQuantity,
      status: r.status,
      donorOrg: r.donorOrganization,
      createdAt: r.createdAt,
    })),
  }
}

export function getAdminDashboard() {
  const orgs = getAdminOrgs()
  const batches = getAdminBatches()
  const requests = getAdminRequests()
  const transfers = getAdminTransfers()
  const audit = getAuditLogs()

  const pendingOrgs = orgs.filter(o => o.status === 'PENDING').length
  const pendingBatches = batches.filter(b => b.status === 'PENDING_REVIEW').length
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length
  const activeTransfers = transfers.filter(t => t.status === 'IN_TRANSIT' || t.status === 'APPROVED').length
  const expiringBatches = batches.filter(b => b.daysToExpiry <= 30 && b.status === 'APPROVED').length

  return {
    totalOrganizations: orgs.length || 438,
    pendingOrgs,
    totalBatches: batches.length || 1284,
    pendingBatches,
    totalRequests: requests.length || 862,
    pendingRequests,
    activeTransfers: activeTransfers || 23,
    expiringBatches: expiringBatches || 18,
    monthlyTrend: [
      { month: 'May', donated: 890, transferred: 640, requests: 720 },
      { month: 'Jun', donated: 1120, transferred: 820, requests: 950 },
      { month: 'Jul', donated: 980, transferred: 910, requests: 880 },
      { month: 'Aug', donated: 1340, transferred: 1050, requests: 1200 },
      { month: 'Sep', donated: 1560, transferred: 1280, requests: 1420 },
      { month: 'Oct', donated: 1210, transferred: 980, requests: 1100 },
    ],
    orgBreakdown: [
      { type: 'Hospital', count: orgs.filter(o => o.type === 'HOSPITAL').length || 182 },
      { type: 'Pharmacy', count: orgs.filter(o => o.type === 'PHARMACY').length || 124 },
      { type: 'Clinic', count: orgs.filter(o => o.type === 'CLINIC').length || 89 },
      { type: 'NGO', count: orgs.filter(o => o.type === 'NGO').length || 43 },
    ],
    recentActivity: audit.slice(0, 6).map(a => ({
      id: a.id,
      action: a.action.toLowerCase(),
      entity: `${a.entityType} #${a.entityId}`,
      user: a.userName,
      timestamp: a.timestamp,
    })),
  }
}

export function getAdminReports(_range?: string) {
  const batches = getAdminBatches()
  const transfers = getAdminTransfers()
  const requests = getAdminRequests()
  const orgs = getAdminOrgs()

  const totalUnits = batches.reduce((sum, b) => sum + (b.quantity || 0), 0)

  return {
    summary: {
      totalDonations: batches.length,
      totalTransfers: transfers.length,
      totalRequests: requests.length,
      totalOrganizations: orgs.length,
      totalUnitsSaved: totalUnits,
      estimatedValueSaved: `$${((totalUnits * 32.5) / 1000).toFixed(1)}k`,
    },
    monthlyTrend: [
      { month: 'May', donations: 320, transfers: 240, requests: 280 },
      { month: 'Jun', donations: 450, transfers: 310, requests: 390 },
      { month: 'Jul', donations: 380, transfers: 290, requests: 350 },
      { month: 'Aug', donations: 520, transfers: 410, requests: 460 },
      { month: 'Sep', donations: 610, transfers: 480, requests: 520 },
      { month: 'Oct', donations: 490, transfers: 390, requests: 440 },
    ],
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
}

export function registerDemoAccount(data: Record<string, string>) {
  const users = loadFromStorage<Record<string, { password: string; user: Record<string, unknown> }>>(STORAGE_KEYS.USERS, {})
  const email = (data.email || '').toLowerCase()
  users[email] = {
    password: data.password || 'demo1234',
    user: {
      id: Date.now(),
      email,
      fullName: data.contactName || 'Healthcare Lead',
      role: 'USER',
      organizationId: Date.now() + 1,
      organizationName: data.organizationName || 'Registered Facility',
      organizationStatus: 'PENDING',
    },
  }
  saveToStorage(STORAGE_KEYS.USERS, users)

  // Also add to orgs list
  const orgs = loadFromStorage(STORAGE_KEYS.ORGS, INITIAL_ORGS)
  orgs.push({
    id: Date.now() + 1,
    name: data.organizationName || 'New Facility',
    type: data.organizationType || 'HOSPITAL',
    registrationNumber: data.registrationNumber || `REG-${Date.now()}`,
    licenceReference: data.licenceReference || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zip: data.zip || '',
    contactName: data.contactName || '',
    contactLicence: data.contactLicence || '',
    email,
    status: 'PENDING',
    storageType: data.storageType || 'AMBIENT',
    createdAt: ts(0),
    verifiedAt: undefined,
  })
  saveToStorage(STORAGE_KEYS.ORGS, orgs)

  addAuditLog({ action: 'CREATE', entityType: 'ORGANIZATION', entityId: Date.now() + 1, details: `New organization registration: ${data.organizationName}` })
}

export function findRegisteredUser(email: string) {
  const users = loadFromStorage<Record<string, { password: string; user: Record<string, unknown> }>>(STORAGE_KEYS.USERS, {})
  return users[email.toLowerCase()] || null
}

// Backward-compatible exports
export const userDashboard = getUserDashboard()
export const myBatches = INITIAL_BATCHES
export const marketplace = INITIAL_BATCHES.filter(b => b.status === 'APPROVED')
export const myRequests = INITIAL_REQUESTS
export const myTransfers = INITIAL_TRANSFERS
export const notifications = INITIAL_NOTIFICATIONS
export const myOrg = INITIAL_ORGS[0]
export const adminDashboard = getAdminDashboard()
export const adminOrgs = INITIAL_ORGS
export const adminBatches = INITIAL_BATCHES
export const adminRequests = INITIAL_REQUESTS
export const adminTransfers = INITIAL_TRANSFERS
export const adminReports = getAdminReports()
export const auditLogs = INITIAL_AUDIT
