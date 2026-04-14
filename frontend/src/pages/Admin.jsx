import { useEffect, useState } from 'react'
import api from '../lib/api'
import Notifications from '../components/Notifications'
import { useToast } from '../components/Toast'

export default function Admin() {
  const toast = useToast()
  const [pending, setPending] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAdminData = async () => {
    try {
      setError(null)
      const [pendingRes, postsRes, commentsRes] = await Promise.all([
        api.get('/posts', { params: { status: 'pending', limit: 50 } }),
        api.get('/posts', { params: { limit: 1000 } }),
        api.get('/comments', { params: { limit: 1000 } })
      ])
      
      setPending(pendingRes.data.data)
      
      // Calculate stats
      const totalPosts = postsRes.data.total || 0
      const totalComments = commentsRes.data.comments?.length || 0
      const totalUsers = new Set(postsRes.data.data.map(p => p.author?._id)).size
      
      setStats({ totalUsers, totalPosts, totalComments })
    } catch (e) {
      console.error('Failed to load admin data:', e)
      const errorMsg = e.response?.data?.message || 'Failed to load admin data'
      setError(errorMsg)
      toast.showError(errorMsg)
    }
  }

  useEffect(() => {
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setStatus = async (slug, status) => {
    setLoading(true)
    try {
      await api.put(`/posts/${slug}/status`, { status })
      setPending(p => p.filter(x => x.slug !== slug))
      toast.showSuccess(`Post ${status === 'published' ? 'approved' : 'rejected'} successfully!`)
    } catch (e) {
      console.error('Failed to update post status:', e)
      toast.showError('Failed to update post status: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <Notifications />
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl md:text-2xl">👥</span>
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl md:text-2xl">📝</span>
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-xl md:text-2xl">💬</span>
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold">Moderation Queue ({pending.length})</h2>
        </div>
        
        {pending.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No posts pending moderation.</p>
          </div>
        ) : (
          <div className="divide-y">
            {pending.map(post => (
              <div key={post.slug} className="p-4 md:p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.summary || 'No summary available'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                      <span>By {post.author?.name}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.readingTimeMinutes} min read</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => setStatus(post.slug, 'published')}
                      disabled={loading}
                      className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs md:text-sm flex-1 sm:flex-initial"
                    >
                      ✓ Approve
                    </button>
                    <button 
                      onClick={() => setStatus(post.slug, 'rejected')}
                      disabled={loading}
                      className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs md:text-sm flex-1 sm:flex-initial"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


