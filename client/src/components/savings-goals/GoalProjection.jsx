import React from 'react'
import { Calendar, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

export default function GoalProjection({ goal = {} }) {
  const {
    deadline,
    remainingAmount = 0,
    daysRemaining = 0,
    monthsRemaining = 0,
    requiredMonthlySaving = 0,
    statusInsight = 'No Deadline',
    status
  } = goal

  const isCompleted = status === 'completed' || remainingAmount === 0

  if (isCompleted) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between min-h-[300px] select-none">
        <div>
          <h3 className="font-bold text-text-main text-base flex items-center gap-2">
            <CheckCircle2 size={18} className="text-income" />
            Goal Achieved
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Measurement projections.</p>
        </div>
        <div className="p-4 bg-emerald-50 text-income border border-emerald-100 rounded-xl text-xs font-semibold leading-relaxed my-auto">
          Congratulations! You have completed saving for this financial target. Reopen it if you want to save more.
        </div>
      </div>
    )
  }

  if (!deadline) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between min-h-[300px] select-none">
        <div>
          <h3 className="font-bold text-text-main text-base flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Goal Projections
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Deadline target forecasts.</p>
        </div>
        <div className="p-4 bg-slate-50 border border-brand-border rounded-xl text-xs font-semibold text-text-secondary leading-relaxed my-auto">
          No deadline configured. Set a due date under edit settings to calculate monthly savings paces and track statuses.
        </div>
      </div>
    )
  }

  const isBehind = statusInsight === 'Behind'

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between min-h-[300px] select-none">
      <div>
        <h3 className="font-bold text-text-main text-base flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Goal Projections
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">Projection pace logs.</p>
      </div>

      <div className="space-y-4 my-auto py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 border border-brand-border rounded-xl">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Remaining</span>
            <p className="text-sm font-bold text-text-main mt-0.5">{monthsRemaining} mos</p>
          </div>
          <div className="p-3 bg-slate-50 border border-brand-border rounded-xl">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Pace Status</span>
            <p className={`text-sm font-bold mt-0.5 ${isBehind ? 'text-expense' : 'text-income'}`}>
              {statusInsight}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex gap-2.5 items-start ${
          isBehind 
            ? 'bg-rose-50 text-expense border-rose-100' 
            : 'bg-emerald-50 text-income border-emerald-100'
        }`}>
          {isBehind ? <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />}
          <div>
            <span>
              {isBehind 
                ? `You need to save ₹${requiredMonthlySaving.toLocaleString('en-IN')}/month to reach this goal on time.`
                : `Awesome! You are on track to achieve this goal by ${new Date(deadline).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`
              }
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
        <span>Required Saving</span>
        <span className="text-text-main font-black">₹{requiredMonthlySaving.toLocaleString('en-IN')}/mo</span>
      </div>
    </div>
  )
}
