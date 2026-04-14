import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const searchPosts = async () => {
    try {
      const { data } = await api.get('/search', { params: { q: query } })
      setResults(data.results || [])
      setShowResults(true)
    } catch (e) {
      console.error('Search failed:', e)
    }
  }

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        searchPosts()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setShowResults(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Close dropdown on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowResults(false)
        setQuery('')
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showResults])

  const handleResultClick = (slug) => {
    navigate(`/post/${slug}`)
    setQuery('')
    setShowResults(false)
  }

  return (
    <div className="relative mb-4 md:mb-6" ref={searchRef}>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
        />
        <button
          onClick={() => query && searchPosts()}
          className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-80 md:max-h-96 overflow-y-auto">
          {results.map((post) => (
            <div
              key={post.slug}
              onClick={() => handleResultClick(post.slug)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <h4 className="font-medium text-gray-900 text-sm md:text-base">{post.title}</h4>
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{post.summary}</p>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 p-3">
          <p className="text-xs md:text-sm text-gray-500">No posts found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
