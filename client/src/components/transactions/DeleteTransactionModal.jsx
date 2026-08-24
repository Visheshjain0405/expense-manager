import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DeleteTransactionModal({ isOpen, onClose, onConfirm, isDeleting = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-sm rounded-2xl shadow-xl flex flex-col p-6 animate-zoom-in text-center select-none">
        {/* Warning Icon */}
        <div className="mx-auto w-12 h-12 bg-rose-50 text-expense border border-rose-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-base font-bold text-text-main">Delete transaction?</h3>
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
          This action cannot be undone. All database records associated with this log will be permanently lost.
        </p>

        {/* Action Controls */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-expense hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(220,38,38,0.15)] flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
