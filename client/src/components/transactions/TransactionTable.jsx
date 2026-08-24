import React from 'react'
import TransactionRow from './TransactionRow'

export default function TransactionTable({ transactions, onView, onEdit, onDelete }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-brand-border">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Account
              </th>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="relative px-6 py-4.5 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border bg-brand-surface">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
