import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MoreVertical, Edit2, Play, Pause, Trash2, PlusCircle, ArrowRight, Shield } from 'lucide-react'

export default function GoalCard({ goal, onEdit, onDelete, onPause, onResume, onAddMoney }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const {
    id,
    name,
    targetAmount = 0,
    currentAmount = 0,
    remainingAmount = 0,
    progressPercentage = 0,
    deadline,
    icon = 'Shield',
    color = '#2563EB',
    status = 'active'
  } = goal

  const IconComponent = Icons[icon] || Shield

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-emerald-500' // completed
    if (progressPercentage >= 80) return 'bg-blue-500'    // strong progress
    if (progressPercentage >= 50) return 'bg-teal-500'    // positive
    return 'bg-slate-400'                                 // normal
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-50 text-income border border-emerald-100">
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
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-blue-50 text-primary border border-blue-100">
            Active
          </span>
        )
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'None'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-56 relative text-left">
      {/* Header details */}
      <div className="flex justify-between items-start select-none">
        <div 
          onClick={() => navigate(`/savings-goals/${id}`)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
        >
          <div
            className="p-3.5 rounded-xl border flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${color}15`,
              borderColor: `${color}30`,
              color: color
            }}
          >
            <IconComponent size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-text-main tracking-tight truncate group-hover:text-primary transition">
              {name}
            </h4>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Goal Target
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
                    <>
                      <button
                        onClick={() => { setMenuOpen(false); onAddMoney(goal) }}
                        className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                      >
                        <PlusCircle size={12} className="text-text-secondary" />
                        Add Money
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); onPause(id) }}
                        className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                      >
                        <Pause size={12} className="text-text-secondary" />
                        Pause
                      </button>
                    </>
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
                    onClick={() => { setMenuOpen(false); onEdit(goal) }}
                    className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Edit2 size={12} className="text-text-secondary" />
                    Edit
                  </button>
                  <hr className="border-brand-border my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(goal) }}
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

      {/* Progress & Values */}
      <div className="mt-4 select-none">
        <div className="flex justify-between items-baseline text-xs font-bold text-text-secondary">
          <span className="text-text-main text-sm font-extrabold">
            ₹{currentAmount.toLocaleString('en-IN')}
            <span className="text-text-secondary text-xs font-normal"> of ₹{targetAmount.toLocaleString('en-IN')}</span>
          </span>
          <span>{progressPercentage}%</span>
        </div>
        
        {/* Progress track bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
      </div>

      {/* Footer Info Details */}
      <div className="border-t border-slate-50/50 pt-2.5 mt-4 flex justify-between items-center select-none text-[10px] font-bold tracking-wider text-text-secondary uppercase">
        <span className="truncate max-w-[50%]">Remaining: ₹{remainingAmount.toLocaleString('en-IN')}</span>
        <span>Due: {formatDate(deadline)}</span>
      </div>
    </div>
  )
}
