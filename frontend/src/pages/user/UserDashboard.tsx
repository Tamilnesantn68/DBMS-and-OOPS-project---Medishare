import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardApi } from '../../services/api'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  activeDonations: number
  activeDonationsChange: number
  pendingRequests: number
  pendingRequestsChange: number
  completedTransfers: number
  completedTransfersChange: number
  totalUnitsDonated: number
  totalUnitsDonatedChange: number
  recentBatches: Array<{ id: number; name: string; lot: string; expiryDate: string; quantity: number; status: string; daysToExpiry: number }>
  recentRequests: Array<{ id: number; medicineName: string; requestedQty: number; status: string; donorOrg: string; createdAt: string }>
  monthlyTrend: Array<{ month: string; donated: number; received: number }>
  expiringCount: number
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge-warning',
  PENDING_REVIEW: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  WITHDRAWN: 'badge-neutral',
  FULFILLED: 'badge-info',
  IN_TRANSIT: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.user().then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Active Donations', value: data?.activeDonations ?? 0, change: data?.activeDonationsChange ?? 0, icon: 'volunteer_activism', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
    { label: 'Pending Requests', value: data?.pendingRequests ?? 0, change: data?.pendingRequestsChange ?? 0, icon: 'fact_check', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]' },
    { label: 'Completed Transfers', value: data?.completedTransfers ?? 0, change: data?.completedTransfersChange ?? 0, icon: 'local_shipping', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]' },
    { label: 'Total Units Donated', value: data?.totalUnitsDonated ?? 0, change: data?.totalUnitsDonatedChange ?? 0, icon: 'medication', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Clinical Logistics Dashboard</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">
            Welcome back, <strong>{user?.fullName}</strong> · {user?.organizationName || 'Your Organization'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.expiringCount ? (
            <span className="badge badge-danger">
              <span className="material-symbols-outlined text-[14px]">alarm</span>
              {data.expiringCount} batches expiring within 30 days
            </span>
          ) : null}
          <Link to="/portal/donate" className="btn-primary">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Donate New Batch</span>
          </Link>
        </div>
      </div>

      {/* Org Status */}
      {user?.organizationStatus === 'PENDING' && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#B45309] text-xl mt-0.5">pending</span>
          <div>
            <h4 className="text-label-md text-[var(--color-on-surface)]">Organization Verification In Progress</h4>
            <p className="text-body-sm text-[var(--color-on-surface-variant)]">Your credentials are under review. Some features may be restricted until verification is complete (typically 4-6 business hours).</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>
              {change !== undefined && (
                <span className={`text-label-sm ${change >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'} flex items-center gap-0.5`}>
                  <span className="material-symbols-outlined text-[14px]">{change >= 0 ? 'trending_up' : 'trending_down'}</span>
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className={`text-headline-lg font-bold ${color}`}>{value.toLocaleString()}</div>
              <div className="text-label-sm text-[var(--color-outline)] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #CBD5E1' }} />
              <Bar dataKey="donated" fill="#0f766e" radius={[4, 4, 0, 0]} name="Donated" />
              <Bar dataKey="received" fill="#62df7d" radius={[4, 4, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-headline-sm text-[var(--color-on-surface)]">Recent Requests</h3>
            <Link to="/portal/requests" className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentRequests?.length ? data.recentRequests.map(r => (
              <div key={r.id} className="p-3 bg-[#F8FAFC] rounded-lg border border-[var(--color-outline-variant)]">
                <div className="flex justify-between items-start">
                  <span className="text-label-md text-[var(--color-on-surface)]">{r.medicineName}</span>
                  <span className={`badge ${STATUS_BADGE[r.status] || 'badge-neutral'}`}>{r.status.replace('_', ' ')}</span>
                </div>
                <p className="text-body-sm text-[var(--color-outline)] mt-1">{r.requestedQty} units from {r.donorOrg}</p>
              </div>
            )) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-3xl text-[var(--color-outline-variant)]">fact_check</span>
                <p className="text-body-sm text-[var(--color-outline)] mt-2">No requests yet</p>
                <Link to="/portal/marketplace" className="text-label-sm text-[var(--color-primary)] hover:underline mt-1 block">Browse Marketplace</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Batches Table */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-outline-variant)] flex items-center justify-between">
          <h3 className="text-headline-sm text-[var(--color-on-surface)]">My Active Medicine Batches</h3>
          <Link to="/portal/donations" className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Lot #</th>
                <th>Expiry Date</th>
                <th>Qty (Units)</th>
                <th>Status</th>
                <th>Days Remaining</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentBatches?.length ? data.recentBatches.map(b => (
                <tr key={b.id}>
                  <td className="font-semibold">{b.name}</td>
                  <td className="text-code-sm">{b.lot}</td>
                  <td>{new Date(b.expiryDate).toLocaleDateString()}</td>
                  <td>{b.quantity}</td>
                  <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>{b.status.replace('_', ' ')}</span></td>
                  <td>
                    <span className={b.daysToExpiry < 30 ? 'text-[var(--color-danger)] font-semibold' : 'text-[var(--color-success)] font-semibold'}>
                      {b.daysToExpiry}d
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--color-outline)]">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-[var(--color-outline-variant)]">inventory_2</span>
                    No active batches. <Link to="/portal/donate" className="text-[var(--color-primary)] hover:underline">Donate your first batch</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
