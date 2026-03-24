import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiBell } from 'react-icons/hi'
import api from '../utils/api'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/admin/notifications')
      setNotifications(res.data.notifications?.slice(0, 5) || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      // Silently fail
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/admin/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setShowDropdown(!showDropdown); navigate('/notifications') }}
        className="relative p-2 text-gs-text-muted hover:text-gs-text transition-colors"
        id="notification-bell"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gs-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
