import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Percent,
  PlusCircle,
  Inbox
} from 'lucide-react'

export default function DashboardSkeleton() {
  const cards = [
    {
      title: 'Total Income',
      value: '₹45,000',
      change: '↑ 12.5%',
      subText: 'vs last month',
      color: 'text-income',
      bg: 'bg-emerald-50/50',
      icon: TrendingUp,
    },
    {
      title: 'Total Expenses',
      value: '₹22,350',
      change: '↓ 4.2%',
      subText: 'vs last month',
      color: 'text-expense',
      bg: 'bg-rose-50/50',
      icon: TrendingDown,
    },
    {
      title: 'Current Balance',
      value: '₹22,650',
      change: 'Stable',
      subText: 'Across all accounts',
      color: 'text-primary',
      bg: 'bg-blue-50/50',
      icon: Scale,
    },
    {
      title: 'Savings Rate',
      value: '50.3%',
      change: '↑ 2.1%',
      subText: 'Target: 40%',
      color: 'text-warning',
      bg: 'bg-amber-50/50',
      icon: Percent,
    },
  ]

  return (
    <div className="space-y-8">
      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-1">
                {card.value}
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`font-semibold ${card.color}`}>{card.change}</span>
                <span className="text-text-secondary">{card.subText}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State Main View */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6">
          <Inbox size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-main mb-2">
          No transactions yet
        </h3>
        <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
          Start tracking your finances by adding your first income, expense, or savings activity.
        </p>
        <button className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.25)] select-none">
          <PlusCircle size={18} />
          Add Transaction
        </button>
      </div>
    </div>
  )
}
