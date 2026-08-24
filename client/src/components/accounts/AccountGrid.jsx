import React from 'react'
import AccountCard from './AccountCard'

export default function AccountGrid({ accounts = [], onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {accounts.map((acc) => (
        <AccountCard
          key={acc.id}
          account={acc}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
