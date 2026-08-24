import React from 'react'
import { Calendar, Trash2, ArrowUpRight } from 'lucide-react'

export default function ContributionHistory({ contributions = [], onDelete }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col min-h-[300px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Contribution History</h3>
        <p className="text-xs text-text-secondary mt-0.5">Logs of saved funds allocations.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {contributions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary select-none">
            No contributions made toward this goal yet.
          </div>
        ) : (
          contributions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 border border-brand-border hover:border-slate-200 rounded-xl hover:bg-slate-50/20 transition duration-150 animate-fade-in"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-income rounded-lg border border-emerald-100 flex-shrink-0 select-none">
                  <ArrowUpRight size={16} />
                </div>
                <div className="min-w-0 select-none">
                  <p className="text-sm font-bold text-text-main truncate">
                    {item.notes || 'Allocation deposit'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-text-secondary">
                    <span>Source: {item.accountName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-350" />
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={10} />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-4 flex-shrink-0">
                <span className="font-black text-income text-sm select-none">
                  +₹{item.amount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-text-secondary hover:text-expense hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  aria-label="Delete contribution log"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
