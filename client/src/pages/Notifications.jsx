import { useState, useEffect } from 'react'
import api from '../utils/api'
import { HiBell, HiCheckCircle } from 'react-icons/hi'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/admin/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/admin/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-gs-card rounded-xl"/>)}</div></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in" id="notifications-page">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gs-text-muted text-sm">{unreadCount} unread</p></div>
        <HiBell className="w-6 h-6 text-gs-teal" />
      </div>
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`gs-card !p-4 flex items-start space-x-3 ${!n.isRead ? 'border-gs-teal/30 bg-gs-teal/5' : ''}`}>
              <span className="text-xl mt-0.5">{n.type === 'claim' ? '🚨' : n.type === 'policy' ? '🛡️' : '⚠️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gs-text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <button onClick={() => markAsRead(n.id)} className="text-gs-teal shrink-0"><HiCheckCircle className="w-5 h-5" /></button>}
            </div>
          ))}
        </div>
      ) : (
        <div className="gs-card text-center py-12"><HiBell className="w-12 h-12 text-gs-text-muted mx-auto mb-3" /><p className="text-gs-text-muted">No notifications yet</p></div>
      )}
    </div>
  )
}
