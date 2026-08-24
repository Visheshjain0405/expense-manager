import React from 'react'
import { Calendar } from 'lucide-react'

export default function TopExpenses({ expenses = [] }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Largest Expenses</h3>
        <p className="text-xs text-text-secondary mt-0.5">Top individual transactions.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-none">
        {expenses.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No expense records found.
          </div>
        ) : (
          expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 border border-brand-border hover:border-slate-200 rounded-xl hover:bg-slate-50/30 transition duration-150"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-main truncate">
                  {exp.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-text-secondary">
                  <span 
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: exp.color }}
                  />
                  <span>{exp.category}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar size={10} />
                    {formatDate(exp.date)}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-4">
                <span className="text-sm font-black text-expense">
                  -₹{exp.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
