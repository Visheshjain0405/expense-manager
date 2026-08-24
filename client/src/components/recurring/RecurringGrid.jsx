import React from 'react'
import RecurringCard from './RecurringCard'

export default function RecurringGrid({ schedules = [], onEdit, onDelete, onPause, onResume }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {schedules.map((schedule) => (
        <RecurringCard
          key={schedule.id}
          schedule={schedule}
          onEdit={onEdit}
          onDelete={onDelete}
          onPause={onPause}
          onResume={onResume}
        />
      ))}
    </div>
  )
}
