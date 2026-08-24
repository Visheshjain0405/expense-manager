import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { dailySpendingData } from '../../utils/mockDashboardData'

export default function DailySpendingChart() {
  const formatYAxis = (value) => {
    if (value >= 1000) return `₹${value / 1000}k`
    return `₹${value}`
  }

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-brand-surface border border-brand-border px-3 py-2 rounded-xl shadow-lg text-left text-xs">
          <p className="font-semibold text-text-secondary">{data.name}</p>
          <p className="font-extrabold text-expense mt-0.5">₹{data.amount.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[320px]">
      <div className="mb-6">
        <h3 className="font-bold text-text-main text-base">
          Daily Spending
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Expense velocities throughout the month.
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailySpendingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748B"
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip content={customTooltip} cursor={{ fill: '#F8FAFC' }} />
            <Bar
              dataKey="amount"
              fill="#DC2626"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
