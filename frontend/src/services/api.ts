import axios, { AxiosResponse } from 'axios'
import * as mock from './mockData'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medishare_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medishare_token')
      window.location.href = '/signin'
    }
    return Promise.reject(err)
  }
)

// ─── Demo Mode Helper ─────────────────────────────────
// When a demo user is logged in and backend is unreachable,
// return mock data instead of failing.
function isDemoMode(): boolean {
  return !!localStorage.getItem('medishare_demo_user')
}

function mockResponse<T>(data: T): Promise<AxiosResponse<T>> {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK (Demo)',
    headers: {},
    config: {} as never,
  })
}

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
}

// ─── Organizations ─────────────────────────────────────
export const orgApi = {
  getMyOrg: () => isDemoMode() ? mockResponse(mock.myOrg) : api.get('/organizations/me'),
  updateMyOrg: (data: unknown) => isDemoMode() ? mockResponse({ ...mock.myOrg, ...data as object }) : api.put('/organizations/me', data),
  // Admin
  getAll: (params?: unknown) => isDemoMode() ? mockResponse(mock.adminOrgs) : api.get('/admin/organizations', { params }),
  getById: (id: number) => isDemoMode() ? mockResponse(mock.adminOrgs.find(o => o.id === id) || mock.adminOrgs[0]) : api.get(`/admin/organizations/${id}`),
  updateVerification: (id: number, data: unknown) => isDemoMode() ? mockResponse({ message: 'Updated (demo)' }) : api.patch(`/admin/organizations/${id}/verification`, data),
}

// ─── Medicine Batches ───────────────────────────────────
export const batchApi = {
  create: (data: unknown) => isDemoMode() ? mockResponse({ id: 99, ...(data as object), status: 'PENDING_REVIEW' }) : api.post('/batches', data),
  getMy: (_params?: unknown) => isDemoMode() ? mockResponse(mock.myBatches) : api.get('/batches/my', { params: _params }),
  getById: (id: number) => isDemoMode() ? mockResponse(mock.myBatches.find(b => b.id === id) || mock.myBatches[0]) : api.get(`/batches/${id}`),
  update: (id: number, data: unknown) => isDemoMode() ? mockResponse({ message: 'Updated (demo)' }) : api.put(`/batches/${id}`, data),
  withdraw: (id: number) => isDemoMode() ? mockResponse({ message: `Batch ${id} withdrawn (demo)` }) : api.patch(`/batches/${id}/withdraw`),
  // Admin
  getPending: (_params?: unknown) => isDemoMode() ? mockResponse(mock.adminBatches.filter(b => b.status === 'PENDING_REVIEW')) : api.get('/admin/batches/pending', { params: _params }),
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.adminBatches) : api.get('/admin/batches', { params: _params }),
  review: (id: number, data: unknown) => isDemoMode() ? mockResponse({ message: `Batch ${id} reviewed (demo)` }) : api.patch(`/admin/batches/${id}/review`, data),
}

// ─── Marketplace ────────────────────────────────────────
export const marketplaceApi = {
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.marketplace) : api.get('/marketplace', { params: _params }),
  getById: (id: number) => isDemoMode() ? mockResponse(mock.marketplace.find(m => m.id === id) || mock.marketplace[0]) : api.get(`/marketplace/${id}`),
}

// ─── Requests ───────────────────────────────────────────
export const requestApi = {
  create: (data: unknown) => isDemoMode() ? mockResponse({ id: 99, ...(data as object), status: 'PENDING' }) : api.post('/requests', data),
  getMy: (_params?: unknown) => isDemoMode() ? mockResponse(mock.myRequests) : api.get('/requests/my', { params: _params }),
  getById: (id: number) => isDemoMode() ? mockResponse(mock.myRequests.find(r => r.id === id) || mock.myRequests[0]) : api.get(`/requests/${id}`),
  cancel: (id: number) => isDemoMode() ? mockResponse({ message: `Request ${id} cancelled (demo)` }) : api.patch(`/requests/${id}/cancel`),
  // Admin
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.adminRequests) : api.get('/admin/requests', { params: _params }),
  approve: (id: number, data?: unknown) => isDemoMode() ? mockResponse({ message: `Request ${id} approved (demo)` }) : api.patch(`/admin/requests/${id}/approve`, data),
  reject: (id: number, data: unknown) => isDemoMode() ? mockResponse({ message: `Request ${id} rejected (demo)` }) : api.patch(`/admin/requests/${id}/reject`, data),
}

// ─── Transfers ──────────────────────────────────────────
export const transferApi = {
  getMy: (_params?: unknown) => isDemoMode() ? mockResponse(mock.myTransfers) : api.get('/transfers/my', { params: _params }),
  getById: (id: number) => isDemoMode() ? mockResponse(mock.myTransfers.find(t => t.id === id) || mock.myTransfers[0]) : api.get(`/transfers/${id}`),
  dispatch: (id: number) => isDemoMode() ? mockResponse({ message: `Transfer ${id} dispatched (demo)` }) : api.post(`/transfers/${id}/dispatch`),
  confirmReceipt: (id: number, data: unknown) => isDemoMode() ? mockResponse({ message: `Transfer ${id} receipt confirmed (demo)` }) : api.post(`/transfers/${id}/confirm-receipt`, data),
  // Admin
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.adminTransfers) : api.get('/admin/transfers', { params: _params }),
}

// ─── Notifications ──────────────────────────────────────
export const notificationApi = {
  getAll: () => isDemoMode() ? mockResponse(mock.notifications) : api.get('/notifications'),
  markRead: (id: number) => isDemoMode() ? mockResponse({ message: `Notification ${id} marked read (demo)` }) : api.patch(`/notifications/${id}/read`),
}

// ─── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  user: () => isDemoMode() ? mockResponse(mock.userDashboard) : api.get('/dashboard/user'),
  admin: () => isDemoMode() ? mockResponse(mock.adminDashboard) : api.get('/dashboard/admin'),
}

// ─── Reports ────────────────────────────────────────────
export const reportApi = {
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.adminReports) : api.get('/admin/reports', { params: _params }),
  exportCsv: (params?: unknown) => api.get('/admin/reports/export.csv', { params, responseType: 'blob' }),
}

// ─── Audit Logs ─────────────────────────────────────────
export const auditApi = {
  getAll: (_params?: unknown) => isDemoMode() ? mockResponse(mock.auditLogs) : api.get('/admin/audit-logs', { params: _params }),
}

// ─── Contact ─────────────────────────────────────────────
export const contactApi = {
  send: (data: unknown) => isDemoMode() ? mockResponse({ message: 'Message sent (demo)' }) : api.post('/contact', data),
}

export default api
