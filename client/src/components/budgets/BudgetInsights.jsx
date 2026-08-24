import React from 'react'
import { Info, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react'

export default function BudgetInsights({ budgets = [], summary = {} }) {
  const { totalRemaining = 0 } = summary

  const getInsights = () => {
    const list = []

    // 1. Overall remaining caps
    if (budgets.length > 0) {
      if (totalRemaining >= 0) {
        list.push({
          type: 'summary',
          severity: 'success',
          title: 'Total Capital Surplus',
          message: `You have ₹${totalRemaining.toLocaleString('en-IN')} remaining across all budgets.`
        })
      } else {
        list.push({
          type: 'summary',
          severity: 'danger',
          title: 'Total Overspend Warning',
          message: `You have overspent by ₹${Math.abs(totalRemaining).toLocaleString('en-IN')} across your set limits.`
        })
      }
    }

    // 2. Count limits within budget
    const healthyCount = budgets.filter((b) => b.status === 'healthy').length
    if (healthyCount > 0) {
      list.push({
        type: 'healthy_count',
        severity: 'info',
        title: 'Spending Discipline',
        message: `${healthyCount} categories are currently within budget.`
      })
    }

    // 3. Highlight warning/exceeded budgets specifically
    budgets.forEach((b) => {
      if (b.status === 'exceeded') {
        list.push({
          type: 'exceeded_item',
          severity: 'danger',
          title: `${b.category.name} Exceeded`,
          message: `${b.category.name} has exceeded its monthly budget by ₹${Math.abs(b.remaining).toLocaleString('en-IN')}.`
        })
      } else if (b.status === 'warning') {
        list.push({
          type: 'warning_item',
          severity: 'warning',
          title: `${b.category.name} Cap Threshold`,
          message: `${b.category.name} budget is ${b.percentageUsed}% used.`
        })
      }
    })

    return list
  }

  const insights = getInsights()

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'danger':
        return 'bg-rose-50 border-rose-100 text-expense'
      case 'warning':
        return 'bg-amber-50 border-amber-100 text-warning'
      case 'success':
        return 'bg-emerald-50 border-emerald-100 text-income'
      case 'info':
      default:
        return 'bg-slate-50 border-brand-border text-text-secondary'
    }
  }

  const getIcon = (severity) => {
    switch (severity) {
      case 'danger':
        return <AlertTriangle size={18} className="text-expense flex-shrink-0" />
      case 'warning':
        return <AlertTriangle size={18} className="text-warning flex-shrink-0" />
      case 'success':
        return <CheckCircle size={18} className="text-income flex-shrink-0" />
      case 'info':
      default:
        return <Lightbulb size={18} className="text-slate-500 flex-shrink-0" />
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col min-h-[300px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Budget Insights</h3>
        <p className="text-xs text-text-secondary mt-0.5">Automated limit tracking analysis.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {insights.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary select-none">
            No insights available. Add a budget to generate tracking insights.
          </div>
        ) : (
          insights.map((ins, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-xl flex items-start gap-3 transition ${getSeverityStyles(ins.severity)}`}
            >
              {getIcon(ins.severity)}
              <div>
                <h4 className="text-xs font-bold text-text-main leading-none">
                  {ins.title}
                </h4>
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed font-semibold">
                  {ins.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
