import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function DailySpendingChart({ data = [] }) {
  const formatYAxis = (value) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
    return `₹${value}`
  }

  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString('en-IN')}`, 'Spent']
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date)
  }))

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Daily Spending</h3>
        <p className="text-xs text-text-secondary mt-0.5">Daily expense tracking.</p>
      </div>

      <div className="flex-1 w-full text-xs font-semibold select-none">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No daily expense logs found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar 
                dataKey="expense" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
