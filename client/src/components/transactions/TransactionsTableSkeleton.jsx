import React from 'react'

export default function TransactionsTableSkeleton() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] animate-pulse text-left select-none pointer-events-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-brand-border">
          <thead className="bg-slate-50/50">
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                </th>
              ))}
              <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border bg-brand-surface">
            {[...Array(10)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="px-6 py-4.5"><div className="h-4 w-12 bg-slate-200 rounded-md"></div></td>
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
                  </div>
                </td>
                <td className="px-6 py-4.5"><div className="h-4 w-16 bg-slate-200 rounded-md"></div></td>
                <td className="px-6 py-4.5"><div className="h-4 w-20 bg-slate-200 rounded-md"></div></td>
                <td className="px-6 py-4.5"><div className="h-6 w-16 bg-slate-100 rounded-lg"></div></td>
                <td className="px-6 py-4.5"><div className="h-4 w-16 bg-slate-200 rounded-md"></div></td>
                <td className="px-6 py-4.5 text-right"><div className="h-4 w-4 bg-slate-150 rounded-md inline-block"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
