import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function IncomeExpenseChart({ data = [] }) {
  const formatYAxis = (value) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
    return `₹${value}`
  }

  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString()}`, undefined]
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedMonth: formatMonth(item.month)
  }))

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Income vs Expenses</h3>
        <p className="text-xs text-text-secondary mt-0.5">Monthly overview trends.</p>
      </div>

      <div className="flex-1 w-full text-xs font-semibold select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="formattedMonth" 
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
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingTop: '15px' }}
            />
            <Area 
              type="monotone" 
              name="Income"
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              name="Expense"
              dataKey="expense" 
              stroke="#EF4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
            <Area 
              type="monotone" 
              name="Savings"
              dataKey="savings" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSavings)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
