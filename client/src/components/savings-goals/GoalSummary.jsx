import React from 'react'
import { Target, ShieldCheck, Heart, Percent } from 'lucide-react'

export default function GoalSummary({ summary = {} }) {
  const {
    totalGoals = 0,
    activeGoals = 0,
    totalSavedAmount = 0,
    overallProgress = 0
  } = summary

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left select-none animate-fade-in">
      {/* Total Goals */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <Target size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Goals
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            {totalGoals} created
          </h3>
        </div>
      </div>

      {/* Active Goals */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-amber-50 text-warning border border-amber-100 rounded-xl">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Active Targets
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            {activeGoals} active
          </h3>
        </div>
      </div>

      {/* Total Saved */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-income border border-emerald-100 rounded-xl">
          <Heart size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Reserved
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{totalSavedAmount.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl">
          <Percent size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Overall Completion
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            {overallProgress}% avg
          </h3>
        </div>
      </div>
    </div>
  )
}
