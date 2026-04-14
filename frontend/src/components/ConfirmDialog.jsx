import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmDialogContext = createContext(null)

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setDialog(null)
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {dialog && <ConfirmDialogModal {...dialog} />}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider')
  }
  return context
}

function ConfirmDialogModal({ 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmColor = 'red',
  icon = '⚠️',
  onConfirm, 
  onCancel 
}) {
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Icon */}
        <div className="flex items-center justify-center pt-8 pb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">{icon}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${colorClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Add custom CSS for animations
const style = document.createElement('style')
style.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scale-in {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
`
document.head.appendChild(style)







