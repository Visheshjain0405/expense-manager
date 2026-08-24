import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function NetWorthChart({ data = [] }) {
  const formatYAxis = (value) => {
    const isNegative = value < 0
    const absVal = Math.abs(value)
    if (absVal >= 100000) return `${isNegative ? '-' : ''}₹${(absVal / 100000).toFixed(1)}L`
    if (absVal >= 1000) return `${isNegative ? '-' : ''}₹${(absVal / 1000).toFixed(0)}k`
    return `${isNegative ? '-' : ''}₹${absVal}`
  }

  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString('en-IN')}`, 'Net Worth']
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date)
  }))

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[360px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Net Worth Over Time</h3>
        <p className="text-xs text-text-secondary mt-0.5">Historical growth snapshot tracking.</p>
      </div>

      <div className="flex-1 w-full text-xs font-semibold select-none">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No historical net worth snapshots yet. Snapshot runner runs daily.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                stroke="#64748B" 
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                axisLine={false} 
                tickLine={false} 
                stroke="#64748B" 
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#3B82F6" 
                strokeWidth={2.5}
                dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
