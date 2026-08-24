import React, { useState } from 'react'
import * as Icons from 'lucide-react'

// Import MoreVertical, Edit2, Trash2 explicitly just in case
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'

export default function CategoryCard({ category, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Retrieve Lucide icon dynamically by string name
  const IconComponent = Icons[category.icon] || Icons.FolderOpen
  const isExpense = category.type === 'expense'

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between h-44 relative">
      <div className="flex justify-between items-start">
        {/* Category Icon */}
        <div 
          className="p-3.5 rounded-xl border flex items-center justify-center"
          style={{ 
            backgroundColor: `${category.color}15`, 
            borderColor: `${category.color}30`, 
            color: category.color 
          }}
        >
          <IconComponent size={20} />
        </div>

        {/* Dropdown Options Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition select-none cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-32 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in text-left">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(category) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Edit2 size={12} className="text-text-secondary" />
                  Edit
                </button>
                <hr className="border-brand-border my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(category) }}
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

      <div className="mt-4">
        <h4 className="text-base font-bold text-text-main tracking-tight truncate">
          {category.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
            isExpense
              ? 'bg-rose-50 text-expense border border-rose-100'
              : 'bg-emerald-50 text-income border border-emerald-100'
          }`}>
            {category.type}
          </span>
          <span className="text-[10px] text-text-secondary font-semibold">
            {category.transactionCount || 0} transactions
          </span>
        </div>
      </div>
    </div>
  )
}
