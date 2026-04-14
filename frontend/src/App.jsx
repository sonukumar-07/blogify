import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import PostEditor from './pages/PostEditor'
import PostView from './pages/PostView'
import { AuthProvider, useAuth } from './context/AuthContext'
import Notifications from './components/Notifications'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { ConfirmDialogProvider } from './components/ConfirmDialog'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600 flex-shrink-0">
          Blogify
        </Link>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-blue-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
            Home
          </Link>
          
          {user ? (
            <>
              <Link to="/editor" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
                <span className="hidden lg:inline">✍️ </span>Write
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
                <span className="hidden lg:inline">📊 </span>Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
                  <span className="hidden lg:inline">⚙️ </span>Admin
                </Link>
              )}
              <Notifications />
              <div className="flex items-center gap-2 lg:gap-3">
                <div 
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-md"
                  title={user.name}
                >
                  {(() => {
                    const nameParts = user.name?.split(' ').filter(Boolean) || [];
                    if (nameParts.length >= 2) {
                      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                    } else if (nameParts.length === 1) {
                      return nameParts[0].substring(0, 2).toUpperCase();
                    }
                    return 'U';
                  })()}
                </div>
                <button 
                  onClick={logout}
                  className="text-xs lg:text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t shadow-lg">
          <div className="p-4 space-y-3">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-blue-650 transition-colors"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/editor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  ✍️ Write
                </Link>
                <Link 
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  📊 Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    ⚙️ Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 py-2 border-t">
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md"
                  >
                    {(() => {
                      const nameParts = user.name?.split(' ').filter(Boolean) || [];
                      if (nameParts.length >= 2) {
                        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                      } else if (nameParts.length === 1) {
                        return nameParts[0].substring(0, 2).toUpperCase();
                      }
                      return 'U';
                    })()}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-800 transition-colors border-t"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmDialogProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/admin" element={<PrivateRoute roles={["admin"]}><Admin /></PrivateRoute>} />
                  <Route path="/editor" element={<PrivateRoute><PostEditor /></PrivateRoute>} />
                  <Route path="/post/:slug" element={<PostView />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </ConfirmDialogProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}


