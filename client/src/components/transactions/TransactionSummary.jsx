import React from 'react'
import { TrendingUp, TrendingDown, Scale, Hash } from 'lucide-react'

export default function TransactionSummary({ summary = {} }) {
  const { totalIncome = 0, totalExpenses = 0, netBalance = 0, totalCount = 0 } = summary

  const formatCurrency = (val) => {
    return '₹' + Math.abs(val).toLocaleString('en-IN')
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none text-left">
      {/* Total Income */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-income/30 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
            Total Income
          </span>
          <div className="p-2 rounded-xl bg-emerald-50/50 text-income">
            <TrendingUp size={18} />
          </div>
        </div>
        <h3 className="text-3xl font-extrabold text-text-main mb-1">
          {formatCurrency(totalIncome)}
        </h3>
        <span className="text-xs text-text-secondary">Current filter matched</span>
      </div>

      {/* Total Expenses */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-expense/30 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
            Total Expenses
          </span>
          <div className="p-2 rounded-xl bg-rose-50/50 text-expense">
            <TrendingDown size={18} />
          </div>
        </div>
        <h3 className="text-3xl font-extrabold text-text-main mb-1">
          {formatCurrency(totalExpenses)}
        </h3>
        <span className="text-xs text-text-secondary">Current filter matched</span>
      </div>

      {/* Net Balance */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-primary/30 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
            Net Balance
          </span>
          <div className="p-2 rounded-xl bg-blue-50/50 text-primary">
            <Scale size={18} />
          </div>
        </div>
        <h3 className={`text-3xl font-extrabold mb-1 ${netBalance < 0 ? 'text-expense' : 'text-text-main'}`}>
          {netBalance < 0 ? '-' : ''}{formatCurrency(netBalance)}
        </h3>
        <span className="text-xs text-text-secondary">Aggregated balance</span>
      </div>

      {/* Transaction Count */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-amber-500/30 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
            Transaction Count
          </span>
          <div className="p-2 rounded-xl bg-amber-50/50 text-warning">
            <Hash size={18} />
          </div>
        </div>
        <h3 className="text-3xl font-extrabold text-text-main mb-1">
          {totalCount}
        </h3>
        <span className="text-xs text-text-secondary">Logged logs</span>
      </div>
    </div>
  )
}
