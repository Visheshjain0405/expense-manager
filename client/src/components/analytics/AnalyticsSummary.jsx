import React from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Scale, Percent } from 'lucide-react'

export default function AnalyticsSummary({ overview = {} }) {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    netSavings = 0,
    savingsRate = 0,
    incomeChangePercent = 0,
    expenseChangePercent = 0,
    savingsChangePercent = 0
  } = overview

  const renderPercentageBadge = (val, isExpense = false) => {
    if (val === 0) return null
    const isPositive = val > 0
    // Expenses increase is bad, decreases is good. Income increase is good.
    const isGoodChange = isExpense ? !isPositive : isPositive

    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
        isGoodChange 
          ? 'bg-emerald-50 text-income border border-emerald-100' 
          : 'bg-rose-50 text-expense border border-rose-100'
      }`}>
        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {Math.abs(val)}%
      </span>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left select-none">
      {/* Income */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-28">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Income
          </span>
          <div className="p-1.5 bg-emerald-50 text-income rounded-lg border border-emerald-100">
            <TrendingUp size={14} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h3 className="text-xl font-black tracking-tight text-text-main">
            ₹{totalIncome.toLocaleString('en-IN')}
          </h3>
          {renderPercentageBadge(incomeChangePercent)}
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-28">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Expenses
          </span>
          <div className="p-1.5 bg-rose-50 text-expense rounded-lg border border-rose-100">
            <TrendingDown size={14} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h3 className="text-xl font-black tracking-tight text-text-main">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </h3>
          {renderPercentageBadge(expenseChangePercent, true)}
        </div>
      </div>

      {/* Savings */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-28">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Net Savings
          </span>
          <div className="p-1.5 bg-blue-50 text-primary rounded-lg border border-blue-100">
            <Scale size={14} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h3 className={`text-xl font-black tracking-tight ${netSavings < 0 ? 'text-expense' : 'text-text-main'}`}>
            {netSavings < 0 ? '-' : ''}₹{Math.abs(netSavings).toLocaleString('en-IN')}
          </h3>
          {renderPercentageBadge(savingsChangePercent)}
        </div>
      </div>

      {/* Savings Rate */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-28">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Savings Rate
          </span>
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
            <Percent size={14} />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-black tracking-tight text-text-main">
            {savingsRate}%
          </h3>
        </div>
      </div>
    </div>
  )
}
