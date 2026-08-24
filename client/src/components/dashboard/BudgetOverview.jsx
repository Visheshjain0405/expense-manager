import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AlertTriangle, Inbox } from 'lucide-react'
import budgetService from '../../services/budgetService'

export default function BudgetOverview() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopBudgets = async () => {
      try {
        const response = await budgetService.getBudgets()
        if (response.success) {
          setBudgets(response.budgets || [])
        }
      } catch (err) {
        console.error('Error loading dashboard budgets preview:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopBudgets()
  }, [])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between h-[320px]">
      <div className="flex justify-between items-start select-none">
        <div>
          <h3 className="font-bold text-text-main text-base">
            Budget Overview
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Compare monthly limits.
          </p>
        </div>
        <Link
          to="/budgets"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
        >
          View budgets
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Budgets List Content */}
      <div className="flex-1 flex flex-col justify-center mt-4">
        {loading ? (
          <div className="space-y-4 animate-pulse pointer-events-none select-none">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
                  <div className="h-3 w-12 bg-slate-200 rounded-md"></div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-secondary flex flex-col items-center justify-center gap-1 select-none">
            <Inbox size={20} className="text-slate-400" />
            <span>No active budgets found.</span>
            <Link to="/budgets" className="text-primary font-bold hover:underline mt-1">
              Create Budget
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.slice(0, 3).map((b) => {
              const isExceeded = b.status === 'exceeded'

              let barColor = 'bg-primary'
              let textColor = 'text-primary'

              if (isExceeded) {
                barColor = 'bg-expense'
                textColor = 'text-expense'
              } else if (b.status === 'warning') {
                barColor = 'bg-warning'
                textColor = 'text-warning'
              }

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold select-none">
                    <span className="text-text-main flex items-center gap-1.5">
                      {b.category?.name || 'Category'}
                      {isExceeded && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-expense border border-rose-100 rounded-md text-[9px] font-extrabold uppercase">
                          <AlertTriangle size={8} />
                          Exceeded
                        </span>
                      )}
                    </span>
                    <span className="text-text-secondary">
                      ₹{b.spent.toLocaleString()} / <span className="text-text-main">₹{b.amount.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative select-none">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-secondary select-none">
                    <span>{b.percentageUsed}% utilized</span>
                    <span className={`font-bold ${textColor}`}>
                      {isExceeded
                        ? `₹${Math.abs(b.remaining).toLocaleString()} over`
                        : `₹${b.remaining.toLocaleString()} left`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
