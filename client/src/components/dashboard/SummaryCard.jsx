import React from 'react'

export default function SummaryCard({ title, value, change, subText, icon: Icon, colorProfile }) {
  // Map color profiles
  const profileClasses = {
    income: {
      color: 'text-income',
      bg: 'bg-emerald-50/50',
      border: 'hover:border-income/30'
    },
    expense: {
      color: 'text-expense',
      bg: 'bg-rose-50/50',
      border: 'hover:border-expense/30'
    },
    balance: {
      color: 'text-primary',
      bg: 'bg-blue-50/50',
      border: 'hover:border-primary/30'
    },
    savingsRate: {
      color: 'text-warning',
      bg: 'bg-amber-50/50',
      border: 'hover:border-warning/30'
    }
  }

  const activeProfile = profileClasses[colorProfile] || profileClasses.balance

  return (
    <div className={`bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md transition-all duration-200 text-left ${activeProfile.border}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold tracking-wider text-text-secondary uppercase select-none">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${activeProfile.bg} ${activeProfile.color}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <h3 className="text-3xl font-extrabold text-text-main mb-1.5 tracking-tight">
        {value}
      </h3>

      <div className="flex items-center gap-1.5 text-xs select-none">
        {change && (
          <span className={`font-bold ${activeProfile.color}`}>
            {change}
          </span>
        )}
        <span className="text-text-secondary">{subText}</span>
      </div>
    </div>
  )
}
