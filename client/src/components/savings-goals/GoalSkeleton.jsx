import React from 'react'

export default function GoalSkeleton() {
  return (
    <div className="space-y-8 animate-pulse select-none text-left pointer-events-none">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-6 h-24 flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-205 rounded-md"></div>
              <div className="h-6 w-16 bg-slate-205 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards grids Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-6 h-56 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4.5 w-24 bg-slate-200 rounded-md"></div>
                  <div className="h-3.5 w-16 bg-slate-150 rounded-md"></div>
                </div>
              </div>
              <div className="w-12 h-5 bg-slate-100 rounded-md"></div>
            </div>
            
            <div className="space-y-2.5">
              <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full"></div>
            </div>

            <div className="border-t border-slate-50 pt-2 flex justify-between">
              <div className="h-3.5 w-16 bg-slate-150 rounded-md"></div>
              <div className="h-3.5 w-14 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
