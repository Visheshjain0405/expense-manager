import React from 'react'
import { X, Calendar, Wallet, FileText, Tag, Layers, MessageSquare } from 'lucide-react'

export default function TransactionDetailsModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null

  const isExpense = transaction.type === 'expense'

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-zoom-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <h3 className="text-base font-bold text-text-main">Transaction Details</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Big Amount & Type Tag */}
          <div className="text-center pb-2 border-b border-slate-50">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider mb-2.5 ${
                isExpense
                  ? 'bg-rose-50 text-expense border border-rose-100'
                  : 'bg-emerald-50 text-income border border-emerald-100'
              }`}
            >
              {transaction.type}
            </span>
            <h2 className={`text-3xl font-extrabold tracking-tight ${isExpense ? 'text-expense' : 'text-income'}`}>
              {isExpense ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div className="flex gap-3">
              <MessageSquare size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Description</p>
                <p className="text-sm font-bold text-text-main mt-0.5">{transaction.description}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3">
              <Calendar size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Date</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{formatDate(transaction.date)}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex gap-3">
              <Tag size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Category</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">
                  {transaction.categoryId?.name || 'Other'}
                </p>
              </div>
            </div>

            {/* Account */}
            <div className="flex gap-3">
              <Wallet size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Account</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">
                  {transaction.accountId?.name || 'Other'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="flex gap-3">
                <FileText size={16} className="text-text-secondary mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Notes</p>
                  <p className="text-sm text-text-secondary mt-0.5 leading-relaxed whitespace-pre-wrap">
                    {transaction.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
