import React from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function AccountDistribution({ data = [] }) {
  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString()}`, 'Balance']
  }

  const formatYAxis = (value) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
    return `₹${value}`
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Money by Account</h3>
        <p className="text-xs text-text-secondary mt-0.5">Asset distribution across accounts.</p>
      </div>

      <div className="flex-1 w-full text-xs font-semibold select-none">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No accounts found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <XAxis type="number" tickFormatter={formatYAxis} axisLine={false} tickLine={false} stroke="#64748B" />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                stroke="#64748B"
                width={80}
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
              <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
