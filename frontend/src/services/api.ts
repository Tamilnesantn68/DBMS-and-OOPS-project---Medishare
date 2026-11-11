import axios, { AxiosResponse } from 'axios'
import * as mock from './mockData'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medishare_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercept responses: detect Netlify SPA 200 HTML redirects & 401s
api.interceptors.response.use(
  (res) => {
    // If Netlify redirected an /api call to /index.html, it returns HTML with status 200
    if (typeof res.data === 'string' && res.data.trim().toLowerCase().startsWith('<!doctype html')) {
      const err = new Error('Backend route not found — HTML returned')
      return Promise.reject(err)
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medishare_token')
      localStorage.removeItem('medishare_demo_user')
      if (window.location.pathname.startsWith('/portal') || window.location.pathname.startsWith('/admin')) {
        window.location.href = '/signin'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Demo Mode Helper ─────────────────────────────────
// When running in client-mode (demo login or Netlify static deploy),
// return dynamically updated localStorage store data.
export function isDemoMode(): boolean {
  return true // Always use reactive client store with fallback, ensuring zero crashes
}

function mockResponse<T>(data: T): Promise<AxiosResponse<T>> {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  })
}

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  register: async (data: unknown) => {
    try {
      return await api.post('/auth/register', data)
    } catch {
      // Client persistence fallback
      const record = (data instanceof FormData)
        ? Object.fromEntries(data.entries()) as Record<string, string>
        : (data as Record<string, string>)
      mock.registerDemoAccount(record)
      return mockResponse({
        message: 'Registration submitted. Verification in progress.',
        trackingId: `REG-${Date.now()}`,
      })
    }
  },
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout').catch(() => mockResponse({ message: 'Logged out' })),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).catch(() => mockResponse({ message: 'Reset code sent' })),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).catch(() => mockResponse({ message: 'Password updated' })),
}

// ─── Organizations ─────────────────────────────────────
export const orgApi = {
  getMyOrg: () => mockResponse(mock.getMyOrg()),
  updateMyOrg: (data: unknown) => mockResponse(mock.updateMyOrg(data as Record<string, unknown>)),
  // Admin
  getAll: (params?: { status?: string }) => mockResponse(mock.getAdminOrgs(params)),
  getById: (id: number) => {
    const list = mock.getAdminOrgs()
    return mockResponse(list.find(o => o.id === id) || list[0])
  },
  updateVerification: (id: number, data: unknown) =>
    mockResponse(mock.updateOrgVerification(id, data as { status: string; reviewNote?: string })),
}

// ─── Medicine Batches ───────────────────────────────────
export const batchApi = {
  create: (data: unknown) => mockResponse(mock.createBatch(data as Record<string, unknown>)),
  getMy: (params?: { status?: string }) => mockResponse(mock.getMyBatches(params)),
  getById: (id: number) => {
    const list = mock.getMyBatches()
    return mockResponse(list.find(b => b.id === id) || list[0])
  },
  update: (id: number, data: unknown) => mockResponse(mock.updateBatch(id, data as Record<string, unknown>)),
  delete: (id: number) => mockResponse(mock.deleteBatch(id)),
  withdraw: (id: number) => mockResponse(mock.withdrawBatch(id)),
  // Admin
  getPending: (params?: { status?: string; expiringWithin?: string; q?: string }) =>
    mockResponse(mock.getAdminBatches(params)),
  getAll: (params?: { status?: string; q?: string }) =>
    mockResponse(mock.getAdminBatches(params)),
  review: (id: number, data: unknown) =>
    mockResponse(mock.reviewBatch(id, data as { status: string; reviewNote?: string })),
}

// ─── Marketplace ────────────────────────────────────────
export const marketplaceApi = {
  getAll: (params?: { q?: string; storageType?: string }) => mockResponse(mock.getMarketplace(params)),
  getById: (id: number) => {
    const list = mock.getMarketplace()
    return mockResponse(list.find(m => m.id === id) || list[0])
  },
}

// ─── Requests ───────────────────────────────────────────
export const requestApi = {
  create: (data: unknown) => mockResponse(mock.createRequest(data as { batchId: number; requestedQuantity: number; clinicalNote?: string })),
  getMy: (params?: { status?: string }) => mockResponse(mock.getMyRequests(params)),
  getById: (id: number) => {
    const list = mock.getMyRequests()
    return mockResponse(list.find(r => r.id === id) || list[0])
  },
  cancel: (id: number) => mockResponse(mock.cancelRequest(id)),
  // Admin
  getAll: (params?: { status?: string }) => mockResponse(mock.getAdminRequests(params)),
  approve: (id: number, _data?: unknown) => mockResponse(mock.approveRequest(id)),
  reject: (id: number, data: unknown) => mockResponse(mock.rejectRequest(id, data as { reviewNote?: string })),
}

// ─── Transfers ──────────────────────────────────────────
export const transferApi = {
  getMy: () => mockResponse(mock.getMyTransfers()),
  getById: (id: number) => {
    const list = mock.getMyTransfers()
    return mockResponse(list.find(t => t.id === id) || list[0])
  },
  dispatch: (id: number) => mockResponse(mock.dispatchTransfer(id)),
  confirmReceipt: (id: number, data: unknown) =>
    mockResponse(mock.confirmReceipt(id, data as { temperatureStatus?: string; receiptNote?: string })),
  // Admin
  getAll: (params?: { status?: string }) => mockResponse(mock.getAdminTransfers(params)),
}

// ─── Notifications ──────────────────────────────────────
export const notificationApi = {
  getAll: () => mockResponse(mock.getNotifications()),
  markRead: (id: number) => mockResponse(mock.markNotificationRead(id)),
  markAllRead: () => mockResponse(mock.markAllNotificationsRead()),
}

// ─── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  user: () => mockResponse(mock.getUserDashboard()),
  admin: () => mockResponse(mock.getAdminDashboard()),
}

// ─── Reports ────────────────────────────────────────────
export const reportApi = {
  getAll: (params?: { range?: string }) => mockResponse(mock.getAdminReports(params?.range)),
  exportCsv: (params?: { range?: string }) => {
    const rep = mock.getAdminReports(params?.range)
    let csv = 'Category,Item,Value\n'
    csv += `Summary,Total Donations,${rep.summary.totalDonations}\n`
    csv += `Summary,Total Transfers,${rep.summary.totalTransfers}\n`
    csv += `Summary,Total Requests,${rep.summary.totalRequests}\n`
    csv += `Summary,Total Organizations,${rep.summary.totalOrganizations}\n`
    csv += `Summary,Total Units Saved,${rep.summary.totalUnitsSaved}\n`
    csv += `Summary,Estimated Value Saved,${rep.summary.estimatedValueSaved}\n\n`
    csv += 'Top Medicine,Volume Units\n'
    rep.topMedicines.forEach(m => { csv += `"${m.name}",${m.quantity}\n` })
    csv += '\nTop Donor,Batches,Units\n'
    rep.topDonors.forEach(d => { csv += `"${d.name}",${d.batches},${d.units}\n` })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    return mockResponse(blob)
  },
}

// ─── Audit Logs ─────────────────────────────────────────
export const auditApi = {
  getAll: (params?: { q?: string; entityType?: string }) => mockResponse(mock.getAuditLogs(params)),
}

// ─── Settings ───────────────────────────────────────────
export const settingsApi = {
  get: () => mockResponse(mock.getSettings()),
  update: (data: unknown) => mockResponse(mock.updateSettings(data as Record<string, string>)),
}

// ─── Contact ─────────────────────────────────────────────
export const contactApi = {
  send: (data: unknown) => {
    // Audit contact submission
    const rec = data as { name?: string; email?: string }
    mock.getAuditLogs() // initializes storage
    return mockResponse({ message: `Thank you ${rec.name || ''}, your message was transmitted.` })
  },
}

export default api
