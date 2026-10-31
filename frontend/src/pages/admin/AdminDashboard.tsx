import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface AdminData {
  totalOrganizations: number
  pendingOrgs: number
  totalBatches: number
  pendingBatches: number
  totalRequests: number
  pendingRequests: number
  activeTransfers: number
  expiringBatches: number
  monthlyTrend: Array<{ month: string; donated: number; transferred: number; requests: number }>
  orgBreakdown: Array<{ type: string; count: number }>
  recentActivity: Array<{ id: number; action: string; entity: string; user: string; timestamp: string }>
}

const PIE_COLORS = ['#0f766e', '#15803d', '#b45309', '#7c3aed']

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.admin().then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Organizations', value: data?.totalOrganizations ?? 0, pending: data?.pendingOrgs ?? 0, icon: 'domain', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', link: '/admin/organizations' },
    { label: 'Medicine Batches', value: data?.totalBatches ?? 0, pending: data?.pendingBatches ?? 0, icon: 'inventory_2', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]', link: '/admin/medicines' },
    { label: 'Stock Requests', value: data?.totalRequests ?? 0, pending: data?.pendingRequests ?? 0, icon: 'fact_check', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]', link: '/admin/requests' },
    { label: 'Active Transfers', value: data?.activeTransfers ?? 0, pending: 0, icon: 'local_shipping', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', link: '/admin/transfers' },
    { label: 'Expiring Batches', value: data?.expiringBatches ?? 0, pending: 0, icon: 'alarm', color: 'text-[#B91C1C]', bg: 'bg-[#FEE2E2]', link: '/admin/expiry-alerts' },
  ]

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-[var(--color-outline-variant)] animate-pulse" />)}</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Enterprise Admin Dashboard</h1>
          <p className="text-body-sm text-[var(--color-outline)]">Regulatory oversight & compliance command center</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success"><span className="status-dot bg-[#15803D] animate-pulse mr-1" /> DSCSA: Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {cards.map(({ label, value, pending, icon, color, bg, link }) => (
          <Link to={link} key={label} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className={`text-headline-lg font-bold ${color}`}>{value.toLocaleString()}</div>
            <div className="text-label-sm text-[var(--color-outline)] mt-0.5">{label}</div>
            {pending > 0 && (
              <span className="badge badge-warning mt-2 text-[10px]">{pending} pending review</span>
            )}
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Monthly Network Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #CBD5E1' }} />
              <Bar dataKey="donated" fill="#0f766e" radius={[4, 4, 0, 0]} name="Donations" />
              <Bar dataKey="transferred" fill="#15803d" radius={[4, 4, 0, 0]} name="Transfers" />
              <Bar dataKey="requests" fill="#b45309" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Organization Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data?.orgBreakdown || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(data?.orgBreakdown || []).map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Org Verification Queue', count: data?.pendingOrgs ?? 0, icon: 'verified_user', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', link: '/admin/organizations', desc: 'Organizations awaiting credential verification' },
          { title: 'Batch Review Queue', count: data?.pendingBatches ?? 0, icon: 'inventory_2', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]', link: '/admin/medicines', desc: 'Medicine batches requiring pharmacist review' },
          { title: 'Request Approval Queue', count: data?.pendingRequests ?? 0, icon: 'fact_check', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]', link: '/admin/requests', desc: 'Stock requisitions pending admin decision' },
        ].map(({ title, count, icon, color, bg, link, desc }) => (
          <Link to={link} key={title} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
              <h3 className="text-headline-sm text-[var(--color-on-surface)]">{title}</h3>
              <p className="text-body-sm text-[var(--color-outline)] mt-0.5">{desc}</p>
              <span className={`badge ${count > 0 ? 'badge-warning' : 'badge-success'} mt-2`}>
                {count > 0 ? `${count} pending` : 'Queue clear'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-sm text-[var(--color-on-surface)]">Recent Activity Feed</h3>
          <Link to="/admin/audit-logs" className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
            Full Audit Log <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="space-y-2">
          {data?.recentActivity?.length ? data.recentActivity.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-container)]" />
              <div className="flex-1">
                <span className="text-body-sm"><strong>{a.user}</strong> {a.action} <span className="text-[var(--color-primary)] font-mono">{a.entity}</span></span>
              </div>
              <span className="text-label-sm text-[var(--color-outline)] whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</span>
            </div>
          )) : (
            <p className="text-body-sm text-[var(--color-outline)] text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
