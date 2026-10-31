import { useState, useEffect } from 'react'
import { notificationApi } from '../../services/api'
import toast from 'react-hot-toast'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  BATCH_APPROVED: { icon: 'check_circle', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]' },
  BATCH_REJECTED: { icon: 'cancel', color: 'text-[#B91C1C]', bg: 'bg-[#FEE2E2]' },
  REQUEST_APPROVED: { icon: 'task_alt', color: 'text-[#15803D]', bg: 'bg-[#DCFCE7]' },
  REQUEST_REJECTED: { icon: 'do_not_disturb', color: 'text-[#B91C1C]', bg: 'bg-[#FEE2E2]' },
  TRANSFER_UPDATE: { icon: 'local_shipping', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
  EXPIRY_ALERT: { icon: 'alarm', color: 'text-[#B45309]', bg: 'bg-[#FEF3C7]' },
  GENERAL: { icon: 'notifications', color: 'text-[var(--color-outline)]', bg: 'bg-[var(--color-surface-container)]' },
}

export default function UserNotifications() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    notificationApi.getAll().then(r => setNotifs(r.data)).catch(() => setNotifs([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch { toast.error('Failed to mark as read') }
  }

  const unreadCount = notifs.filter(n => !n.isRead).length

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Notifications</h1>
          <p className="text-body-sm text-[var(--color-outline)] mt-0.5">
            {unreadCount > 0 ? <span className="text-[var(--color-primary)] font-semibold">{unreadCount} unread</span> : 'All notifications read'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={async () => {
              for (const n of notifs.filter(n => !n.isRead)) await notificationApi.markRead(n.id)
              fetch()
              toast.success('All marked as read')
            }}
            className="btn-secondary text-label-sm"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white border border-[var(--color-outline-variant)] rounded-xl animate-pulse" />)}</div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[var(--color-outline-variant)]">
          <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)]">notifications_off</span>
          <p className="text-headline-sm text-[var(--color-on-surface)] mt-3">No notifications</p>
          <p className="text-body-md text-[var(--color-outline)] mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.isRead ? 'bg-white border-[var(--color-outline-variant)]' : 'bg-[var(--color-primary)]/3 border-[var(--color-primary)]/30'}`}>
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-label-md ${n.isRead ? 'text-[var(--color-on-surface-variant)]' : 'text-[var(--color-on-surface)]'}`}>{n.title}</h4>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1" />}
                  </div>
                  <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-label-sm text-[var(--color-outline)]">{new Date(n.createdAt).toLocaleString()}</span>
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-label-sm text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm">done</span> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
