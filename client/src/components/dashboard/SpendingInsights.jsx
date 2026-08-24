import React from 'react'
import { Pizza, CreditCard, Sparkles, TrendingUp } from 'lucide-react'
import { spendingInsights } from '../../utils/mockDashboardData'

export default function SpendingInsights() {
  const { highestCategory, largestExpense, averageDaily } = spendingInsights

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between h-[320px]">
      <div>
        <h3 className="font-bold text-text-main text-base flex items-center gap-2 select-none">
          <Sparkles size={18} className="text-primary" />
          Spending Insights
        </h3>
        <p className="text-xs text-text-secondary mt-0.5 select-none">
          AI generated spending summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 my-auto py-2">
        {/* Highest Category */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl flex-shrink-0">
            <Pizza size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Top Category
            </p>
            <p className="text-sm font-extrabold text-text-main mt-0.5">
              {highestCategory.category} &middot; {highestCategory.value}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {highestCategory.percent}
            </p>
          </div>
        </div>

        {/* Largest Single Expense */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Largest Expense
            </p>
            <p className="text-sm font-extrabold text-text-main mt-0.5">
              {largestExpense.title} &middot; {largestExpense.value}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              Logged on {largestExpense.date}
            </p>
          </div>
        </div>

        {/* Average Daily Spend */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl flex-shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Daily Average
            </p>
            <p className="text-sm font-extrabold text-text-main mt-0.5">
              {averageDaily.value}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {averageDaily.subtext}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
