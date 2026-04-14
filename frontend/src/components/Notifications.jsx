import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)

  const loadNotifications = async () => {
    try {
      setError(null)
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.notifications?.filter(n => !n.read).length || 0)
    } catch (e) {
      console.error('Failed to load notifications:', e)
      setError('Failed to load notifications')
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Close dropdown on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showDropdown])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment': return '💬'
      case 'post_status': return '📝'
      case 'ai_update': return '🤖'
      default: return '🔔'
    }
  }

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'comment':
        return `New comment on your post: "${notification.meta?.postTitle || 'Untitled'}"`
      case 'post_status':
        return `Your post "${notification.meta?.postTitle || 'Untitled'}" was ${notification.meta?.status || 'updated'}`
      case 'ai_update':
        return 'AI content generation completed'
      default:
        return notification.message
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm md:text-base">Notifications</h3>
          </div>
          
          {error ? (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm mb-2">⚠️ {error}</p>
              <button 
                onClick={loadNotifications}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => markAsRead(notification._id)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

