import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { MoreVertical, Edit2, Play, Pause, Trash2 } from 'lucide-react'

export default function RecurringCard({ schedule, onEdit, onDelete, onPause, onResume }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    id,
    description,
    amount = 0,
    type = 'expense',
    frequency,
    interval = 1,
    nextDueDate,
    status = 'active',
    category = {},
    account = {}
  } = schedule

  const IconComponent = Icons[category.icon] || Icons.FolderOpen
  const isExpense = type === 'expense'

  const formatFrequency = () => {
    if (interval === 1) {
      if (frequency === 'daily') return 'Every day'
      if (frequency === 'weekly') return 'Every week'
      if (frequency === 'monthly') return 'Every month'
      if (frequency === 'yearly') return 'Every year'
    }
    return `Every ${interval} ${frequency}s`
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 text-text-secondary border border-slate-200">
            Completed
          </span>
        )
      case 'paused':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-50 text-warning border border-amber-100">
            Paused
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-rose-50 text-expense border border-rose-100">
            Cancelled
          </span>
        )
      case 'active':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-50 text-income border border-emerald-100">
            Active
          </span>
        )
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-48 relative text-left">
      {/* Header details */}
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
              {description}
            </h4>
            <p className="text-[10px] text-text-secondary font-semibold truncate">
              {category.name || 'Category'} &middot; {account.name || 'Account'}
            </p>
          </div>
        </div>

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
                  {status === 'active' ? (
                    <button
                      onClick={() => { setMenuOpen(false); onPause(id) }}
                      className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                    >
                      <Pause size={12} className="text-text-secondary" />
                      Pause
                    </button>
                  ) : status === 'paused' ? (
                    <button
                      onClick={() => { setMenuOpen(false); onResume(id) }}
                      className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                    >
                      <Play size={12} className="text-text-secondary" />
                      Resume
                    </button>
                  ) : null}
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(schedule) }}
                    className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Edit2 size={12} className="text-text-secondary" />
                    Edit
                  </button>
                  <hr className="border-brand-border my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(schedule) }}
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

      {/* Ratios and Intervals Display */}
      <div className="mt-4 select-none flex justify-between items-baseline">
        <span className={`text-xl font-black tracking-tight ${isExpense ? 'text-expense' : 'text-income'}`}>
          {isExpense ? '-' : '+'}₹{amount.toLocaleString('en-IN')}
        </span>
        <span className="text-xs font-bold text-text-secondary bg-slate-50 border border-slate-100/50 px-2 py-1 rounded-md">
          {formatFrequency()}
        </span>
      </div>

      {/* Footer Info details */}
      <div className="border-t border-slate-50/50 pt-2.5 mt-3.5 flex justify-between items-center select-none text-[10px] font-bold tracking-wider text-text-secondary uppercase">
        <span>Next Due</span>
        <span className="text-text-main font-semibold">
          {formatDate(nextDueDate)}
        </span>
      </div>
    </div>
  )
}
