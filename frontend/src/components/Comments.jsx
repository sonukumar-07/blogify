import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { useToast } from './Toast'
import { useConfirm } from './ConfirmDialog'

export default function Comments({ postId }) {
  const { user } = useAuth()
  const toast = useToast()
  const { showConfirm } = useConfirm()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReplies, setShowReplies] = useState({}) // Track which comments have replies visible
  
  const MAX_REPLY_DEPTH = 5 // Maximum nesting level for replies

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/comments/${postId}`)
      setComments(data.comments)
    } catch (e) {
      console.error('Failed to load comments:', e)
    }
  }

  useEffect(() => {
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const addNewComment = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.showWarning('Please log in to comment')
      return
    }
    if (!newComment.trim()) {
      toast.showWarning('Please enter a comment')
      return
    }
    
    setLoading(true)
    try {
      await api.post('/comments', {
        postId,
        content: newComment.trim()
      })
      setNewComment('')
      toast.showSuccess('Comment posted successfully!')
      await loadComments()
    } catch (e) {
      console.error('Failed to add comment:', e)
      const errorMsg = e.response?.data?.errors 
        ? e.response.data.errors.map(err => err.msg).join(', ')
        : (e.response?.data?.message || e.message)
      toast.showError('Failed to post comment: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const addReply = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.showWarning('Please log in to reply')
      return
    }
    if (!replyContent.trim()) {
      toast.showWarning('Please enter a reply')
      return
    }
    
    setLoading(true)
    try {
      const commentData = {
        postId,
        content: replyContent.trim(),
        parent: replyTo
      }
      
      await api.post('/comments', commentData)
      setReplyContent('')
      setReplyTo(null)
      toast.showSuccess('Reply posted successfully!')
      await loadComments()
      // Auto-expand replies for the parent comment
      setShowReplies(prev => ({ ...prev, [replyTo]: true }))
    } catch (e) {
      console.error('Failed to add reply:', e)
      toast.showError('Failed to post reply: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment._id)
    setEditContent(comment.content)
    setReplyTo(null) // Close any open reply forms
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const updateComment = async (commentId) => {
    if (!editContent.trim()) {
      toast.showWarning('Comment cannot be empty')
      return
    }
    
    setLoading(true)
    try {
      await api.put(`/comments/${commentId}`, { content: editContent.trim() })
      setEditingId(null)
      setEditContent('')
      toast.showSuccess('Comment updated successfully!')
      await loadComments()
    } catch (e) {
      console.error('Failed to update comment:', e)
      toast.showError('Failed to update comment: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (commentId) => {
    const confirmed = await showConfirm({
      title: 'Delete Comment?',
      message: 'Are you sure you want to delete this comment?\nThis action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'red',
      icon: '🗑️'
    })
    
    if (!confirmed) {
      return
    }
    
    setLoading(true)
    try {
      await api.delete(`/comments/${commentId}`)
      toast.showSuccess('Comment deleted successfully!')
      await loadComments()
    } catch (e) {
      console.error('Failed to delete comment:', e)
      toast.showError('Failed to delete comment: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const toggleReaction = async (commentId, action) => {
    if (!user) {
      toast.showWarning('Please log in to react to comments')
      return
    }
    try {
      await api.post(`/comments/${commentId}/react`, { action })
      await loadComments()
    } catch (e) {
      console.error('Reaction failed:', e)
      toast.showError('Failed to update reaction')
    }
  }

  const toggleRepliesVisibility = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const renderComment = (comment, depth = 0, parentId = null) => {
    const isLiked = comment.likes?.some(id => id === user?.id) || false
    const isDisliked = comment.dislikes?.some(id => id === user?.id) || false
    const isAuthor = user && comment.author?._id === user.id
    const canReply = user && !isAuthor && depth < MAX_REPLY_DEPTH // Limit reply depth
    
    // Count replies for this comment
    const replyCount = comment.replies?.length || 0
    const repliesVisible = showReplies[comment._id] || false

    return (
      <div key={comment._id} className={`${depth > 0 ? 'ml-4 md:ml-8 mt-3 border-l-2 border-blue-200 pl-3 md:pl-4' : 'mt-4'}`}>
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-900">{comment.author?.name || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            {isAuthor && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-medium">You</span>}
          </div>
          
          {editingId === comment._id ? (
            <form onSubmit={(e) => { e.preventDefault(); updateComment(comment._id); }} className="space-y-2 mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-blue-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={loading || !editContent.trim()}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Saving...' : '✓ Save'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm md:text-base text-gray-800 mb-3">{comment.content}</p>
              
              <div className="flex gap-1.5 md:gap-2 flex-wrap items-center">
                {user && (
                  <>
                    <button
                      onClick={() => toggleReaction(comment._id, 'like')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${isLiked ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-gray-200'}`}
                    >
                      👍 {comment.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => toggleReaction(comment._id, 'dislike')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${isDisliked ? 'bg-red-100 text-red-600 font-semibold' : 'hover:bg-gray-200'}`}
                    >
                      👎 {comment.dislikes?.length || 0}
                    </button>
                  </>
                )}
                
                {canReply && (
                  <button
                    onClick={() => { setReplyTo(replyTo === comment._id ? null : comment._id); setEditingId(null); }}
                    className="text-xs px-2 py-1 rounded hover:bg-blue-50 text-blue-600 font-medium"
                  >
                    💬 Reply
                  </button>
                )}
                
                {isAuthor && (
                  <>
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs px-2 py-1 rounded hover:bg-green-50 text-green-600 font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600 font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
                
                {replyCount > 0 && (
                  <button
                    onClick={() => toggleRepliesVisibility(comment._id)}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-200 text-gray-700 font-medium ml-auto"
                  >
                    {repliesVisible ? '▼' : '▶'} {repliesVisible ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reply Form */}
        {replyTo === comment._id && (
          <form onSubmit={addReply} className="mt-3 bg-white border-2 border-blue-200 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2">
              Replying to <span className="font-medium text-blue-600">{comment.author?.name || 'Anonymous'}</span>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author?.name || 'Anonymous'}...`}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={loading || !replyContent.trim()}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Posting...' : '📨 Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => { setReplyTo(null); setReplyContent(''); }}
                className="px-4 py-1.5 bg-gray-200 text-xs rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Render nested replies (collapsible) */}
        {repliesVisible && comment.replies?.map(reply => renderComment(reply, depth + 1, comment._id))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">💬 Comments ({comments.length})</h3>
      
      {user ? (
        <form onSubmit={addNewComment} className="mb-4 md:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 rounded-lg border border-blue-200">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Share your thoughts
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
            rows="3"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm md:text-base"
          >
            {loading ? '⏳ Posting...' : '📝 Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-sm md:text-base text-gray-600">🔒 Please log in to comment.</p>
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💭</div>
            <p className="text-gray-500 font-medium">No comments yet.</p>
            <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
