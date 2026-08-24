import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    category = {},
    amount = 0,
    spent = 0,
    remaining = 0,
    percentageUsed = 0,
    status = 'healthy',
    startDate,
    endDate
  } = budget

  const IconComponent = Icons[category.icon] || Icons.FolderOpen
  const isExceeded = status === 'exceeded'

  const getStatusBadge = () => {
    switch (status) {
      case 'exceeded':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-rose-50 text-expense border border-rose-100">
            Exceeded
          </span>
        )
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-50 text-warning border border-amber-100">
            Warning
          </span>
        )
      case 'healthy':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-50 text-income border border-emerald-100">
            Healthy
          </span>
        )
    }
  }

  const getProgressBarColor = () => {
    switch (status) {
      case 'exceeded':
        return 'bg-expense'
      case 'warning':
        return 'bg-warning'
      case 'healthy':
      default:
        return 'bg-primary'
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-48 relative text-left">
      {/* Header Info */}
      <div className="flex justify-between items-start select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-3.5 rounded-xl border flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${category.color || '#64748B'}15`,
              borderColor: `${category.color || '#64748B'}30`,
              color: category.color || '#64748B'
            }}
          >
            <IconComponent size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-text-main tracking-tight truncate">
              {category.name || 'Category'}
            </h4>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
              {formatDate(startDate)}
            </p>
          </div>
        </div>

        {/* Option action and status badges */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
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
                    onClick={() => { setMenuOpen(false); onEdit(budget) }}
                    className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Edit2 size={12} className="text-text-secondary" />
                    Edit
                  </button>
                  <hr className="border-brand-border my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(budget) }}
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

      {/* Ratios Info details */}
      <div className="mt-4 select-none flex justify-between items-baseline text-sm">
        <span className="font-extrabold text-text-main">
          ₹{spent.toLocaleString('en-IN')}{' '}
          <span className="text-xs text-text-secondary font-normal">
            / ₹{amount.toLocaleString('en-IN')}
          </span>
        </span>
        <span className="text-xs font-bold text-text-secondary">
          {percentageUsed}% used
        </span>
      </div>

      {/* Progress Bar meter */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2.5 overflow-hidden select-none">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()}`}
          style={{ width: `${Math.min(100, percentageUsed)}%` }}
        />
      </div>

      {/* Footer statistics */}
      <div className="border-t border-slate-50/50 pt-2.5 mt-3.5 flex justify-between items-center select-none text-[10px] font-bold tracking-wider text-text-secondary uppercase">
        <span>
          {isExceeded ? 'Exceeded by' : 'Remaining'}
        </span>
        <span className={isExceeded ? 'text-expense font-extrabold' : 'text-text-main font-semibold'}>
          ₹{Math.abs(remaining).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}
