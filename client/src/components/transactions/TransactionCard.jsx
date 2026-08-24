import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react'

export default function TransactionCard({ transaction, onView, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isExpense = transaction.type === 'expense'

  // Retrieve populated category & account details
  const categoryName = transaction.categoryId?.name || 'Other'
  const categoryIcon = transaction.categoryId?.icon || 'FolderOpen'
  const categoryColor = transaction.categoryId?.color || '#64748B'
  const accountName = transaction.accountId?.name || 'Other'

  // Load Lucide Icon dynamically
  const IconComponent = Icons[categoryIcon] || Icons.FolderOpen

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col gap-3.5 relative text-left">
      <div className="flex items-start justify-between">
        {/* Category & Description details */}
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: `${categoryColor}15`, 
              borderColor: `${categoryColor}30`, 
              color: categoryColor 
            }}
          >
            <IconComponent size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-main truncate">
              {transaction.description}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5 font-semibold">
              {categoryName} &middot; {accountName}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right pl-3 flex-shrink-0">
          <span className={`text-sm font-extrabold tracking-tight ${isExpense ? 'text-expense' : 'text-income'}`}>
            {isExpense ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-text-secondary mt-0.5">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
        <span
          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
            isExpense
              ? 'bg-rose-50 text-expense border border-rose-100'
              : 'bg-emerald-50 text-income border border-emerald-100'
          }`}
        >
          {transaction.type}
        </span>

        {/* Option action dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 text-text-secondary hover:text-text-main rounded-lg hover:bg-slate-50 transition cursor-pointer select-none"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 bottom-8 w-32 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in text-left">
                <button
                  onClick={() => { setMenuOpen(false); onView(transaction) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Eye size={12} className="text-text-secondary" />
                  View
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(transaction) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Edit2 size={12} className="text-text-secondary" />
                  Edit
                </button>
                <hr className="border-brand-border my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(transaction) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-expense hover:bg-rose-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
