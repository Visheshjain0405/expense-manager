import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { expenseBreakdownData } from '../../utils/mockDashboardData'

export default function ExpenseBreakdown() {
  const totalExpenses = expenseBreakdownData.reduce((acc, curr) => acc + curr.value, 0)

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1)
      return (
        <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-lg text-left text-xs">
          <p className="font-bold text-text-main mb-1">{data.name}</p>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">Amount:</span>
            <span className="font-bold text-text-main">₹{data.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">Percent:</span>
            <span className="font-bold text-text-main">{percentage}%</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[400px]">
      <div>
        <h3 className="font-bold text-text-main text-base">
          Expense Breakdown
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          By category distributions.
        </p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-0">
        {/* Donut Chart with center label */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={customTooltip} />
              <Pie
                data={expenseBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {expenseBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Central Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-[22px] font-extrabold text-text-main tracking-tight leading-none">
              ₹{totalExpenses.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-1.5">
              Total Expenses
            </span>
          </div>
        </div>

        {/* Categories Legend Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
          {expenseBreakdownData.map((category, idx) => {
            const percentage = ((category.value / totalExpenses) * 100).toFixed(1)
            return (
              <div key={idx} className="flex items-start gap-2">
                <span
                  className="w-3 h-3 rounded-md mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-text-main truncate">
                    {category.name}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    ₹{category.value.toLocaleString()} ({percentage}%)
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
