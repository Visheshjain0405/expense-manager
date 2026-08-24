import React from 'react'
import { Folder, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function CategorySummary({ categories = [] }) {
  const total = categories.length
  const expenses = categories.filter((c) => c.type === 'expense').length
  const incomes = categories.filter((c) => c.type === 'income').length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left select-none">
      {/* Total Categories */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <Folder size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Categories
          </p>
          <h3 className="text-2xl font-extrabold text-text-main mt-0.5">
            {total}
          </h3>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-rose-50 text-expense border border-rose-100 rounded-xl">
          <ArrowDownCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Expense Categories
          </p>
          <h3 className="text-2xl font-extrabold text-text-main mt-0.5">
            {expenses}
          </h3>
        </div>
      </div>

      {/* Income Categories */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-income border border-emerald-100 rounded-xl">
          <ArrowUpCircle size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Income Categories
          </p>
          <h3 className="text-2xl font-extrabold text-text-main mt-0.5">
            {incomes}
          </h3>
        </div>
      </div>
    </div>
  )
}
