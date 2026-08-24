import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react'

export default function TransactionRow({ transaction, onView, onEdit, onDelete }) {
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
      month: 'short'
    })
  }

  return (
    <tr className="border-b border-brand-border hover:bg-slate-50/50 transition">
      {/* Date */}
      <td className="px-6 py-4.5 whitespace-nowrap text-xs font-semibold text-text-secondary">
        {formatDate(transaction.date)}
      </td>

      {/* Description */}
      <td className="px-6 py-4.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg border flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: `${categoryColor}15`, 
              borderColor: `${categoryColor}30`, 
              color: categoryColor 
            }}
          >
            <IconComponent size={16} />
          </div>
          <span className="text-sm font-bold text-text-main">
            {transaction.description}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4.5 whitespace-nowrap text-xs font-semibold text-text-secondary">
        {categoryName}
      </td>

      {/* Account */}
      <td className="px-6 py-4.5 whitespace-nowrap text-xs font-semibold text-text-secondary">
        {accountName}
      </td>

      {/* Type */}
      <td className="px-6 py-4.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
            isExpense
              ? 'bg-rose-50 text-expense border border-rose-100'
              : 'bg-emerald-50 text-income border border-emerald-100'
          }`}
        >
          {transaction.type}
        </span>
      </td>

      {/* Amount */}
      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-extrabold tracking-tight">
        <span className={isExpense ? 'text-expense' : 'text-income'}>
          {isExpense ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
        </span>
      </td>

      {/* Actions (Three dot menu dropdown) */}
      <td className="px-6 py-4.5 whitespace-nowrap text-right relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 text-text-secondary hover:text-text-main rounded-md hover:bg-slate-100 transition cursor-pointer select-none"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-6 mt-1 w-32 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in text-left">
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
      </td>
    </tr>
  )
}
