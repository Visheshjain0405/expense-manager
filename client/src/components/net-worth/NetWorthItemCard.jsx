import React, { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react'

export default function NetWorthItemCard({ item, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    id,
    name,
    type = 'asset',
    category,
    value = 0,
    valuationDate,
    notes
  } = item

  const isAsset = type === 'asset'

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getCategoryLabel = () => {
    return category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-40 relative text-left">
      {/* Header Details */}
      <div className="flex justify-between items-start select-none">
        <div className="min-w-0">
          <h4 className="text-base font-bold text-text-main tracking-tight truncate">
            {name}
          </h4>
          <span className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
            isAsset 
              ? 'bg-emerald-50 text-income border border-emerald-100' 
              : 'bg-rose-50 text-expense border border-rose-100'
          }`}>
            {type} &middot; {getCategoryLabel()}
          </span>
        </div>

        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition select-none cursor-pointer"
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
                  onClick={() => { setMenuOpen(false); onEdit(item) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Edit2 size={12} className="text-text-secondary" />
                  Edit
                </button>
                <hr className="border-brand-border my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(item) }}
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

      {/* Ratios Amount */}
      <div className="mt-2.5 select-none">
        <span className={`text-xl font-extrabold tracking-tight ${isAsset ? 'text-text-main' : 'text-expense font-black'}`}>
          ₹{value.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Valuation Date Footer */}
      <div className="border-t border-slate-50/50 pt-2 mt-3 select-none flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
        <Calendar size={12} />
        <span>Valued &middot; {formatDate(valuationDate)}</span>
      </div>
    </div>
  )
}
