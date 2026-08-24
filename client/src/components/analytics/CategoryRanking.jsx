import React from 'react'

export default function CategoryRanking({ data = [] }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Top Spending Categories</h3>
        <p className="text-xs text-text-secondary mt-0.5">Ranked by expense amount.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No spending logs.
          </div>
        ) : (
          data.map((cat, idx) => (
            <div key={cat.categoryId} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-text-main flex items-center gap-1.5">
                  <span className="text-text-secondary font-medium">{idx + 1}.</span>
                  {cat.name}
                </span>
                <span className="text-text-secondary">
                  ₹{cat.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-text-secondary/80 font-normal">
                    ({cat.percentage}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: cat.color || '#64748B',
                    width: `${cat.percentage}%`
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
