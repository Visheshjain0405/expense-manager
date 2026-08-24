import React from 'react'
import { ArrowUpRight, ArrowDownRight, Layers, Coins, CreditCard, RefreshCw } from 'lucide-react'

export default function NetWorthSummary({ overview = {} }) {
  const {
    totalAssets = 0,
    totalLiabilities = 0,
    netWorth = 0,
    change = 0,
    changePercentage = 0
  } = overview

  const isNetWorthNegative = netWorth < 0
  const isChangePositive = change > 0

  return (
    <div className="space-y-6 select-none text-left">
      {/* 1. Main Net Worth Card */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-text-secondary">
            Current Net Worth
          </span>
          <h2 className={`text-4xl font-black mt-2 tracking-tight ${isNetWorthNegative ? 'text-expense font-black' : 'text-text-main'}`}>
            {isNetWorthNegative ? '-' : ''}₹{Math.abs(netWorth).toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-text-secondary mt-1 font-semibold leading-relaxed">
            Assets minus Liabilities
          </p>
        </div>

        {/* Change Indicators */}
        {change !== 0 && (
          <div className="flex items-center gap-3.5 self-start md:self-auto">
            <div className={`p-4 rounded-2xl border flex items-center justify-center ${
              isChangePositive 
                ? 'bg-emerald-50 text-income border-emerald-100' 
                : 'bg-rose-50 text-expense border-rose-100'
            }`}>
              {isChangePositive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
            <div>
              <p className={`text-base font-extrabold ${isChangePositive ? 'text-income' : 'text-expense'}`}>
                {isChangePositive ? '+' : ''}₹{change.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">
                {isChangePositive ? '+' : ''}{changePercentage}% this month
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Secondary Breakdown Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Assets */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
            <Coins size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Total Assets
            </p>
            <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
              ₹{totalAssets.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-expense border border-rose-100 rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Total Liabilities
            </p>
            <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
              ₹{totalLiabilities.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
