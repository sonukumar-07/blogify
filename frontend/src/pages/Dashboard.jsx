import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Notifications from '../components/Notifications'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { showConfirm } = useConfirm()

  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ totalViews: 0, totalLikes: 0, totalComments: 0 })
  const [deletingPostId, setDeletingPostId] = useState(null)

  const loadDashboardData = async () => {
    try {
      const postsRes = await api.get('/users/me/posts')
      const userPosts = postsRes.data.posts

      setPosts(userPosts)

      const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0)
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)

      setStats({ totalViews, totalLikes, totalComments })
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
      toast.showError('Failed to load dashboard data')
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEdit = (post) => {
    navigate('/editor', { state: { post } })
  }

  const handleDelete = async (post) => {
    const confirmed = await showConfirm({
      title: 'Delete Post?',
      message: `Are you sure you want to delete "${post.title}"?`,
      confirmText: 'Delete',
      confirmColor: 'red'
    })

    if (!confirmed) return

    setDeletingPostId(post._id)
    try {
      await api.delete(`/posts/${post.slug}`)
      toast.showSuccess('Post deleted successfully!')
      loadDashboardData()
    } catch (e) {
      toast.showError('Delete failed')
    } finally {
      setDeletingPostId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name || 'User'} 👋
        </h1>
        <button onClick={logout} className="text-red-600">Logout</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          👁️ Views: {stats.totalViews}
        </div>
        <div className="bg-white p-4 rounded shadow">
          👍 Likes: {stats.totalLikes}
        </div>
        <div className="bg-white p-4 rounded shadow">
          💬 Comments: {stats.totalComments}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/editor" className="bg-blue-600 text-white px-4 py-2 rounded">
          ✍️ New Post
        </Link>
        <Link to="/" className="bg-gray-200 px-4 py-2 rounded">
          Browse
        </Link>
      </div>

      {/* Posts */}
      <div className="bg-white rounded shadow">
        <h2 className="p-4 border-b font-semibold">Your Posts</h2>

        {posts.length === 0 ? (
          <p className="p-4 text-gray-500">No posts yet</p>
        ) : (
          posts.map(post => (
            <div key={post._id} className="p-4 border-b">

              <div className="flex gap-4">

                {/* ✅ IMAGE FIX */}
                {post.coverImageUrl && (
                  <img
                    src={post.coverImageUrl}
                    alt="cover"
                    className="w-32 h-24 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <Link to={`/post/${post.slug}`} className="font-bold text-lg">
                    {post.title}
                  </Link>

                  <p className="text-sm text-gray-600">
                    {post.summary}
                  </p>

                  <div className="text-xs text-gray-500 mt-2">
                    {post.views} views • {post.likes?.length || 0} likes
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>

                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(post)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    {deletingPostId === post._id ? '...' : 'Delete'}
                  </button>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  )
}