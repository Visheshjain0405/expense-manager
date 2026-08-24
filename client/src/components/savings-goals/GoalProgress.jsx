import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function GoalProgress({ goal = {} }) {
  const {
    name,
    targetAmount = 0,
    currentAmount = 0,
    remainingAmount = 0,
    progressPercentage = 0,
    color = '#2563EB',
    status
  } = goal

  const isCompleted = status === 'completed' || progressPercentage >= 100

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between min-h-[300px] select-none">
      <div>
        <h3 className="font-bold text-text-main text-base uppercase tracking-wider text-[10px] text-text-secondary">
          Goal Completion Target
        </h3>
        <h2 className="text-2xl font-black text-text-main mt-1 tracking-tight truncate">
          {name}
        </h2>
      </div>

      <div className="my-6 space-y-4">
        {/* Numbers display */}
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-3xl font-black text-text-main tracking-tight">
              ₹{currentAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-text-secondary font-semibold ml-1">
              saved of ₹{targetAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-xl font-extrabold text-primary">
            {progressPercentage}%
          </span>
        </div>

        {/* Large Track Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: color,
              width: `${Math.min(100, progressPercentage)}%`
            }}
          />
        </div>
      </div>

      {/* Summary Footer information */}
      <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-xs font-bold text-text-secondary">
        {isCompleted ? (
          <span className="flex items-center gap-1 text-income font-extrabold">
            <CheckCircle2 size={16} />
            Goal achieved!
          </span>
        ) : (
          <span>₹{remainingAmount.toLocaleString('en-IN')} remaining</span>
        )}
        <span className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-md uppercase font-black">
          {status}
        </span>
      </div>
    </div>
  )
}
