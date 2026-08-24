import React, { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { incomeExpenseData } from '../../utils/mockDashboardData'

const filterTabs = ['7D', '30D', '6M', '1Y']

export default function IncomeExpenseChart() {
  const [activeTab, setActiveTab] = useState('30D')

  const chartData = incomeExpenseData[activeTab] || incomeExpenseData['30D']

  const formatYAxis = (value) => {
    if (value >= 1000) return `₹${value / 1000}k`
    return `₹${value}`
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-lg text-left text-xs space-y-1.5">
          <p className="font-bold text-text-main mb-1">{label}</p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 font-medium text-text-secondary">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-bold text-text-main">
                ₹{item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[400px]">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 select-none">
        <div>
          <h3 className="font-bold text-text-main text-base">
            Income vs Expenses
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Compare monthly earnings and spend ratios.
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex bg-slate-50 border border-brand-border p-1 rounded-xl self-start sm:self-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full min-h-0 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
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
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ top: -10, right: 10 }}
            />
            <Area
              type="monotone"
              name="Income"
              dataKey="Income"
              stroke="#16A34A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              name="Expenses"
              dataKey="Expenses"
              stroke="#DC2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
