import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function ExpenseCategoryChart({ data = [] }) {
  const totalExpense = data.reduce((sum, item) => sum + item.amount, 0)

  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString('en-IN')}`, 'Spent']
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px] relative">
      <div className="mb-2 select-none">
        <h3 className="font-bold text-text-main text-base">Expense by Category</h3>
        <p className="text-xs text-text-secondary mt-0.5">Distribution breakdown.</p>
      </div>

      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-text-secondary">
            No expense data found.
          </div>
        ) : (
          <>
            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none pt-12">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-text-secondary">
                Total Expenses
              </span>
              <span className="text-xl font-black text-text-main mt-0.5">
                ₹{totalExpense.toLocaleString('en-IN')}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="55%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={formatTooltip}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  )
}
