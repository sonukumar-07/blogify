import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const showError = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const showWarning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
  const showInfo = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const { id, message, type } = toast

  const typeStyles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/50',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50'
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div
      className={`${typeStyles[type]} text-white px-6 py-4 rounded-lg pointer-events-auto transform transition-all duration-300 animate-slide-in-right min-w-[320px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Add custom CSS for animation
const style = document.createElement('style')
style.textContent = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`
document.head.appendChild(style)







