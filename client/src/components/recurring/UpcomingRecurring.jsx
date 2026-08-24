import React from 'react'
import { Calendar, AlertCircle } from 'lucide-react'

export default function UpcomingRecurring({ schedules = [] }) {
  const activeSchedules = schedules.filter((s) => s.status === 'active')
  const sortedUpcoming = [...activeSchedules]
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, 5)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col min-h-[300px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Upcoming</h3>
        <p className="text-xs text-text-secondary mt-0.5">Schedules due next.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-none">
        {sortedUpcoming.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No upcoming recurring bills.
          </div>
        ) : (
          sortedUpcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-brand-border hover:border-slate-200 rounded-xl hover:bg-slate-50/30 transition duration-150 animate-fade-in"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-main truncate">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-text-secondary">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.category?.color || '#64748B' }}
                  />
                  <span>{item.category?.name || 'Other'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar size={10} />
                    {formatDate(item.nextDueDate)}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-4 font-black">
                <span className={item.type === 'expense' ? 'text-expense' : 'text-income'}>
                  {item.type === 'expense' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
