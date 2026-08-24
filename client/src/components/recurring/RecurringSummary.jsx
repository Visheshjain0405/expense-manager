import React from 'react'
import { Calendar, PlayCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

export default function RecurringSummary({ recurringTransactions = [] }) {
  const activeSchedules = recurringTransactions.filter((t) => t.status === 'active')

  const calculateMonthlyProjected = (type) => {
    return activeSchedules
      .filter((t) => t.type === type)
      .reduce((sum, t) => {
        let multiplier = 1
        if (t.frequency === 'daily') {
          multiplier = 30 / t.interval
        } else if (t.frequency === 'weekly') {
          multiplier = 4.33 / t.interval
        } else if (t.frequency === 'monthly') {
          multiplier = 1 / t.interval
        } else if (t.frequency === 'yearly') {
          multiplier = 1 / (12 * t.interval)
        }
        return sum + t.amount * multiplier
      }, 0)
  }

  const monthlyIncome = calculateMonthlyProjected('income')
  const monthlyExpenses = calculateMonthlyProjected('expense')

  // Find next due amount
  const sortedActive = [...activeSchedules].sort(
    (a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)
  )
  const nextDueAmount = sortedActive[0]?.amount || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left select-none">
      {/* Active schedules count */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <PlayCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Active Schedules
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            {activeSchedules.length} active
          </h3>
        </div>
      </div>

      {/* Monthly projected income */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-income border border-emerald-100 rounded-xl">
          <ArrowUpCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Projected Income
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{Math.round(monthlyIncome).toLocaleString('en-IN')}/mo
          </h3>
        </div>
      </div>

      {/* Monthly projected expenses */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-rose-50 text-expense border border-rose-100 rounded-xl">
          <ArrowDownCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Projected Bills
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{Math.round(monthlyExpenses).toLocaleString('en-IN')}/mo
          </h3>
        </div>
      </div>

      {/* Next Due amount */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl">
          <Calendar size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Next Due Bill
          </p>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5 text-text-main">
            ₹{nextDueAmount.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>
    </div>
  )
}
