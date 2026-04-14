import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import Comments from '../components/Comments'
import SearchBar from '../components/SearchBar'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import DOMPurify from 'dompurify'

export default function PostView() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { showConfirm } = useConfirm()
  const [post, setPost] = useState(null)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { 
    let isMounted = true;
    
    const loadPost = async () => { 
      try {
        const { data } = await api.get(`/posts/${slug}`)
        if (!isMounted) return
        
        setPost(data.post)
        setLiked(data.post.likes?.some(id => id === user?.id) || false)
        setDisliked(data.post.dislikes?.some(id => id === user?.id) || false)
        
        // Track view with userId for unique view counting
        if (user) {
          api.post(`/posts/${slug}/views`, { userId: user.id }).catch(err => console.error('View tracking failed:', err))
        } else {
          api.post(`/posts/${slug}/views`).catch(err => console.error('View tracking failed:', err))
        }
      } catch (e) {
        console.error('Failed to load post:', e)
        if (!isMounted) return
        
        if (e.response?.status === 404) {
          toast.showError('Post not found')
          setTimeout(() => navigate('/'), 2000)
        } else {
          toast.showError('Failed to load post. Please try again.')
        }
      }
    };
    
    loadPost();
    
    return () => {
      isMounted = false
    }
  }, [slug, user?.id, toast, navigate])

  const handleReaction = async (action) => {
    if (!user) {
      toast.showWarning('Please log in to react to posts')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post(`/posts/${slug}/react`, { action })
      
      // Update post data with the response from server
      setPost(data.post)
      
      // Update local state based on server response
      setLiked(data.post.likes?.some(id => id === user.id) || false)
      setDisliked(data.post.dislikes?.some(id => id === user.id) || false)
    } catch (e) {
      console.error('Reaction failed:', e)
      toast.showError('Failed to update reaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate('/editor', { state: { post } })
  }

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Post?',
      message: `Are you sure you want to delete "${post?.title}"?\nThis action cannot be undone and will also delete all comments.`,
      confirmText: 'Delete Post',
      cancelText: 'Cancel',
      confirmColor: 'red',
      icon: '🗑️'
    })

    if (!confirmed) {
      return
    }

    setDeleting(true)
    try {
      await api.delete(`/posts/${slug}`)
      toast.showSuccess('Post deleted successfully!')
      setTimeout(() => navigate('/'), 1000)
    } catch (e) {
      console.error('Delete failed:', e)
      toast.showError('Failed to delete post: ' + (e.response?.data?.message || e.message))
      setDeleting(false)
    }
  }

  // Check if current user is the author
  const isAuthor = user && post && post.author?._id === user.id
  const isAdmin = user && user.role === 'admin'
  const canModify = isAuthor || isAdmin

  if (!post) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <SearchBar />
      <article className="bg-white rounded-lg shadow p-4 md:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold flex-1">{post.title}</h1>
          
          {/* Edit and Delete buttons - Only visible to author */}
          {canModify && (
            <div className="flex flex-wrap gap-2">
              {isAuthor && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                  Your Post
                </span>
              )}
              <button
                onClick={handleEdit}
                disabled={deleting}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
                title="Edit this post"
              >
                ✏️ <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
                title="Delete this post"
              >
                {deleting ? '⏳' : '🗑️'} <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-4">
          <span>By {post.author?.name}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{post.readingTimeMinutes} min read</span>
          <span>•</span>
          <span>{post.views} views</span>
        </div>
        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post.title} className="w-full h-48 md:h-64 object-cover rounded mb-5" />
        )}
        <div className="prose prose-sm md:prose max-w-none mb-0 [&>*:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
        
        {user && (
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
            <button 
              onClick={() => handleReaction('like')} 
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${liked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              👍 {post.likes?.length || 0}
            </button>
            <button 
              onClick={() => handleReaction('dislike')} 
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${disliked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              👎 {post.dislikes?.length || 0}
            </button>
          </div>
        )}
      </article>
      
      <Comments postId={post._id} />
    </div>
  )
}


