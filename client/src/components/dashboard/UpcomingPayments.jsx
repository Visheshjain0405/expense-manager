import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Inbox } from 'lucide-react'
import recurringTransactionService from '../../services/recurringTransactionService'

export default function UpcomingPayments() {
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await recurringTransactionService.getRecurringTransactions({ status: 'active' })
        if (response.success) {
          const list = response.recurringTransactions || []
          // Sort nextDueDate ascending
          const sorted = list.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
          setUpcoming(sorted.slice(0, 3))
        }
      } catch (err) {
        console.error('Error fetching dashboard upcoming payments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between h-[320px]">
      <div className="flex justify-between items-start select-none">
        <div>
          <h3 className="font-bold text-text-main text-base">
            Upcoming Payments
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Schedules due next.
          </p>
        </div>
        <Link
          to="/recurring"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center mt-4">
        {loading ? (
          <div className="space-y-4 animate-pulse pointer-events-none select-none">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-20 bg-slate-200 rounded-md"></div>
                  <div className="h-3 w-14 bg-slate-150 rounded-md"></div>
                </div>
                <div className="h-4 w-12 bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-secondary flex flex-col items-center justify-center gap-1 select-none">
            <Inbox size={20} className="text-slate-400" />
            <span>No upcoming payments.</span>
            <Link to="/recurring" className="text-primary font-bold hover:underline mt-1">
              Add Recurring
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {upcoming.map((item) => (
              <Link
                key={item.id}
                to="/recurring"
                className="flex justify-between items-center py-2 px-2.5 border border-transparent hover:border-brand-border hover:bg-slate-50/50 rounded-xl transition text-sm font-semibold group/item"
              >
                <div className="min-w-0">
                  <p className="text-text-main truncate group-hover/item:text-primary transition">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-text-secondary font-medium mt-0.5 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(item.nextDueDate)}
                  </p>
                </div>
                <span className={item.type === 'expense' ? 'text-expense font-bold' : 'text-income font-bold'}>
                  {item.type === 'expense' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
