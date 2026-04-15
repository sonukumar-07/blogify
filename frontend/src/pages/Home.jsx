import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import SearchBar from '../components/SearchBar'
import Notifications from '../components/Notifications'
import { useToast } from '../components/Toast'

export default function Home() {
  const { user } = useAuth()
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [postsRes, categoriesRes] = await Promise.all([
        api.get('/posts', { 
          params: { 
            status: 'published', 
            limit: 12,
            category: selectedCategory || undefined
          } 
        }),
        api.get('/categories')
      ])
      
      setPosts(postsRes.data.data)
      setCategories(categoriesRes.data.categories)
    } catch (e) {
      console.error('Failed to load data:', e)
      const errorMsg = e.response?.data?.message || 'Failed to load posts. Please try again.'
      setError(errorMsg)
      toast.showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 md:p-8 text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Blogify – The Future of Blogging Platform</h1>
        <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6">Create, share, and discover amazing stories</p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
          {user ? (
            <Link 
              to="/editor" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              ✍️ Write New Post
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              🚀 Get Started
            </Link>
          )}
          <Link 
            to="/dashboard" 
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-sm md:text-base"
          >
            📊 Dashboard
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <SearchBar />
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                selectedCategory === category.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {error && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-red-500 text-lg mb-4">⚠️ {error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No posts found</p>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory('')}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link 
              key={post.slug} 
              to={`/post/${post.slug}`} 
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow group flex flex-col h-full overflow-hidden"
            >
              {post.coverImageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <img 
                    src={post.coverImageUrl} 
                    alt={post.title}
                    className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                  {post.category && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {post.category}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  {post.summary || 'No summary available'}
                </p>
                
                <div className="space-y-1.5 mt-auto pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-gray-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="truncate max-w-[120px] sm:max-w-none">By {post.author?.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👁️ {post.views || 0}</span>
                      <span>👍 {post.likes?.length || 0}</span>
                    </div>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


