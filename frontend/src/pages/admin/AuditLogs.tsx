import { useState, useEffect } from 'react'
import { auditApi } from '../../services/api'

interface AuditLog {
  id: number; action: string; entityType: string; entityId: number
  userId: number; userName: string; userRole: string; details: string
  ipAddress: string; timestamp: string
}

const ACTION_CONFIG: Record<string, { icon: string; color: string }> = {
  CREATE: { icon: 'add_circle', color: 'text-[#15803D]' },
  UPDATE: { icon: 'edit', color: 'text-[#B45309]' },
  DELETE: { icon: 'delete', color: 'text-[#B91C1C]' },
  VERIFY: { icon: 'verified', color: 'text-[var(--color-primary)]' },
  REJECT: { icon: 'cancel', color: 'text-[#B91C1C]' },
  APPROVE: { icon: 'task_alt', color: 'text-[#15803D]' },
  LOGIN: { icon: 'login', color: 'text-[var(--color-primary)]' },
  LOGOUT: { icon: 'logout', color: 'text-[var(--color-outline)]' },
  DISPATCH: { icon: 'local_shipping', color: 'text-[var(--color-primary)]' },
  CONFIRM_RECEIPT: { icon: 'verified', color: 'text-[#15803D]' },
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search) params.q = search
    if (entityFilter !== 'ALL') params.entityType = entityFilter
    auditApi.getAll(params)
      .then(r => setLogs(r.data)).catch(() => setLogs([])).finally(() => setLoading(false))
  }, [search, entityFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-md text-[var(--color-on-surface)]">Audit Ledger</h1>
        <p className="text-body-sm text-[var(--color-outline)] mt-0.5">Cryptographically sealed immutable audit trail for all platform operations. FDA 21 CFR Part 11 compliant.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-grow min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-outline)]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input className="form-input pl-9 h-10" placeholder="Search by user, action, entity..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select h-10 min-w-[160px]" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option value="ALL">All Entities</option>
          <option value="ORGANIZATION">Organizations</option>
          <option value="BATCH">Batches</option>
          <option value="REQUEST">Requests</option>
          <option value="TRANSFER">Transfers</option>
          <option value="USER">Users</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-outline-variant)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-[var(--color-surface-container)] rounded animate-pulse" />)}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">receipt_long</span>
            <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No audit entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>User</th><th>Details</th><th>IP</th></tr></thead>
              <tbody>
                {logs.map(l => {
                  const cfg = ACTION_CONFIG[l.action] || { icon: 'info', color: 'text-[var(--color-outline)]' }
                  return (
                    <tr key={l.id}>
                      <td className="text-code-sm text-[var(--color-outline)] whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`flex items-center gap-1.5 ${cfg.color}`}>
                          <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                          <span className="text-label-md">{l.action}</span>
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral text-[10px] font-mono">{l.entityType}</span>
                        <span className="text-code-sm text-[var(--color-outline)] ml-1">#{l.entityId}</span>
                      </td>
                      <td>
                        <div className="text-body-sm font-medium">{l.userName}</div>
                        <div className="text-label-sm text-[var(--color-outline)]">{l.userRole}</div>
                      </td>
                      <td className="text-body-sm text-[var(--color-on-surface-variant)] max-w-xs truncate">{l.details}</td>
                      <td className="text-code-sm text-[var(--color-outline)]">{l.ipAddress}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
