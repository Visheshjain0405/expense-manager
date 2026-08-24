import React from 'react'

export default function ReportFilters({ period, startDate, endDate, onChange }) {
  const handlePeriodChange = (e) => {
    const value = e.target.value
    const now = new Date()
    let startStr = ''
    let endStr = ''

    if (value === 'this_month') {
      startStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)
    } else if (value === 'last_month') {
      startStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().substring(0, 10)
    } else if (value === 'last_3_months') {
      startStr = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)
    } else if (value === 'last_6_months') {
      startStr = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)
    } else if (value === 'this_year') {
      startStr = new Date(now.getFullYear(), 0, 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear(), 12, 0).toISOString().substring(0, 10)
    } else if (value === 'last_year') {
      startStr = new Date(now.getFullYear() - 1, 0, 1).toISOString().substring(0, 10)
      endStr = new Date(now.getFullYear() - 1, 12, 0).toISOString().substring(0, 10)
    } else {
      // custom
      startStr = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
      endStr = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)
    }

    onChange({ period: value, startDate: startStr, endDate: endStr })
  }

  const handleDateChange = (key, val) => {
    onChange({ period: 'custom', startDate: key === 'startDate' ? val : startDate, endDate: key === 'endDate' ? val : endDate })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-5 text-left select-none animate-fade-in">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label htmlFor="rep-per" className="text-xs font-bold text-text-main uppercase tracking-wider">
          Report Period
        </label>
        <select
          id="rep-per"
          value={period}
          onChange={handlePeriodChange}
          className="h-11 px-3 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
          <option value="this_year">This Year</option>
          <option value="last_year">Last Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {period === 'custom' && (
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rep-start" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Start Date
            </label>
            <input
              id="rep-start"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rep-end" className="text-xs font-bold text-text-main uppercase tracking-wider">
              End Date
            </label>
            <input
              id="rep-end"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>
      )}
    </div>
  )
}
