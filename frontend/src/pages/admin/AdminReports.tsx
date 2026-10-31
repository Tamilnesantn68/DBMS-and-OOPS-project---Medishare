import { useState, useEffect } from 'react'
import { reportApi } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

interface ReportData {
  summary: { totalDonations: number; totalTransfers: number; totalRequests: number; totalOrganizations: number; totalUnitsSaved: number; estimatedValueSaved: string }
  monthlyTrend: Array<{ month: string; donations: number; transfers: number; requests: number }>
  topMedicines: Array<{ name: string; quantity: number }>
  topDonors: Array<{ name: string; batches: number; units: number }>
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    reportApi.getAll(dateRange !== 'ALL' ? { range: dateRange } : undefined)
      .then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [dateRange])

  const exportCsv = async () => {
    try {
      const res = await reportApi.exportCsv({ range: dateRange })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `medishare-report-${Date.now()}.csv`; a.click()
      toast.success('Report exported')
    } catch { toast.error('Export failed') }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-[var(--color-outline-variant)] animate-pulse" />)}</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Analytics & Reports</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Network-wide redistribution analytics and compliance reporting.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="form-select h-10 min-w-[150px]" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="ALL">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button onClick={exportCsv} className="btn-secondary">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Donations', value: data?.summary.totalDonations ?? 0, icon: 'volunteer_activism', color: 'text-[var(--color-primary)]' },
          { label: 'Transfers', value: data?.summary.totalTransfers ?? 0, icon: 'local_shipping', color: 'text-[#15803D]' },
          { label: 'Requests', value: data?.summary.totalRequests ?? 0, icon: 'fact_check', color: 'text-[#B45309]' },
          { label: 'Units Saved', value: data?.summary.totalUnitsSaved ?? 0, icon: 'medication', color: 'text-[var(--color-primary)]' },
          { label: 'Est. Value Saved', value: data?.summary.estimatedValueSaved ?? '$0', icon: 'payments', color: 'text-[#15803D]' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-4">
            <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
            <div className={`text-headline-md font-bold ${color} mt-2`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-label-sm text-[var(--color-outline)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="donations" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Donations" />
              <Line type="monotone" dataKey="transfers" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} name="Transfers" />
              <Line type="monotone" dataKey="requests" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
          <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Top Medicines by Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.topMedicines || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="quantity" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Donors */}
      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] p-5">
        <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Top Contributing Organizations</h3>
        <table className="data-table">
          <thead><tr><th>Rank</th><th>Organization</th><th>Batches Donated</th><th>Total Units</th></tr></thead>
          <tbody>
            {(data?.topDonors || []).map((d, i) => (
              <tr key={d.name}>
                <td><span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-label-sm font-bold ${i < 3 ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-surface-container)] text-[var(--color-outline)]'}`}>{i + 1}</span></td>
                <td className="font-semibold">{d.name}</td>
                <td>{d.batches}</td>
                <td className="font-semibold text-[var(--color-primary)]">{d.units.toLocaleString()}</td>
              </tr>
            ))}
            {(!data?.topDonors || data.topDonors.length === 0) && (
              <tr><td colSpan={4} className="text-center py-8 text-[var(--color-outline)]">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
