import React from 'react'
import BudgetCard from './BudgetCard'

export default function BudgetGrid({ budgets = [], onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((b) => (
        <BudgetCard
          key={b.id}
          budget={b}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
