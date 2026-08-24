import React from 'react'
import { PlusCircle, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function DashboardHeader({ onOpenModal }) {
  const { user } = useAuth()

  // Dynamic greeting based on current local hours
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Good morning'
    if (hours < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none text-left">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight flex items-center gap-2">
          {getGreeting()}, {user?.name || 'Vishesh'} 👋
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Here's your financial overview for August 2026.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Month Selector dropdown placeholder */}
        <div className="relative inline-block text-left">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main hover:bg-slate-50 transition cursor-pointer select-none">
            <Calendar size={16} className="text-text-secondary" />
            August 2026
            <span className="text-xs text-text-secondary">▼</span>
          </button>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer select-none"
        >
          <PlusCircle size={16} />
          Add Transaction
        </button>
      </div>
    </div>
  )
}
