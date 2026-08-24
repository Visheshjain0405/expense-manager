import React, { useState } from 'react'

export default function AnalyticsHeader({ period, startDate, endDate, onChange }) {
  const [showCustom, setShowCustom] = useState(period === 'custom')

  const handlePeriodChange = (e) => {
    const val = e.target.value
    if (val === 'custom') {
      setShowCustom(true)
      onChange({ period: 'custom' })
    } else {
      setShowCustom(false)
      // Resolve start and end dates based on standard period presets
      const today = new Date()
      let startStr = ''
      let endStr = today.toISOString().substring(0, 10)

      if (val === 'this_month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        startStr = firstDay.toISOString().substring(0, 10)
      } else if (val === 'last_month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
        startStr = firstDay.toISOString().substring(0, 10)
        endStr = lastDay.toISOString().substring(0, 10)
      } else if (val === 'last_3_months') {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1)
        startStr = firstDay.toISOString().substring(0, 10)
      } else if (val === 'last_6_months') {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 5, 1)
        startStr = firstDay.toISOString().substring(0, 10)
      } else if (val === 'last_12_months') {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 11, 1)
        startStr = firstDay.toISOString().substring(0, 10)
      }

      onChange({
        period: val,
        startDate: startStr,
        endDate: endStr
      })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none text-left">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          Financial Analytics
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Understand your spending, income, and savings.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto w-full sm:w-auto">
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onChange({ period: 'custom', startDate: e.target.value, endDate })}
              className="h-11 px-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-primary transition"
            />
            <span className="text-text-secondary text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onChange({ period: 'custom', startDate, endDate: e.target.value })}
              className="h-11 px-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-primary transition"
            />
          </div>
        )}

        <select
          value={period}
          onChange={handlePeriodChange}
          className="h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-xs font-bold text-text-main focus:outline-none focus:border-primary transition cursor-pointer"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
          <option value="last_12_months">Last 12 Months</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
    </div>
  )
}
