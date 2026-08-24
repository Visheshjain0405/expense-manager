import React from 'react'
import GoalCard from './GoalCard'

export default function GoalGrid({ goals = [], onEdit, onDelete, onPause, onResume, onAddMoney }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
          onPause={onPause}
          onResume={onResume}
          onAddMoney={onAddMoney}
        />
      ))}
    </div>
  )
}
