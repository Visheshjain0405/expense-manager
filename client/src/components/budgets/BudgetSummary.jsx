import React from 'react'
import { Landmark, ArrowUpCircle, ArrowDownCircle, Percent } from 'lucide-react'

export default function BudgetSummary({ summary = {} }) {
  const {
    totalBudget = 0,
    totalSpent = 0,
    totalRemaining = 0,
    overallPercentageUsed = 0
  } = summary

  const isExceeded = totalRemaining < 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left select-none">
      {/* Total Budget Limit */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <Landmark size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Budget
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{totalBudget.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Actual Spent */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-rose-50 text-expense border border-rose-100 rounded-xl">
          <ArrowDownCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Spent
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{totalSpent.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className={`p-3 border rounded-xl ${isExceeded ? 'bg-rose-50 text-expense border-rose-100' : 'bg-emerald-50 text-income border-emerald-100'}`}>
          <ArrowUpCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Remaining
          </p>
          <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${isExceeded ? 'text-expense font-black' : 'text-text-main'}`}>
            {isExceeded ? '-' : ''}₹{Math.abs(totalRemaining).toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Overall Usage Ratio */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl">
          <Percent size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Overall Usage
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            {overallPercentageUsed}%
          </h3>
        </div>
      </div>
    </div>
  )
}
