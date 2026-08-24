import React from 'react'

export default function ReportSkeleton() {
  return (
    <div className="space-y-8 animate-pulse select-none text-left pointer-events-none">
      {/* Filters Skeleton */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 h-20 flex items-center gap-4">
        <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
        <div className="h-10 w-44 bg-slate-100 rounded-xl"></div>
      </div>

      {/* Summary Metrics Cards */}
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

      {/* Chart Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[340px]">
          <div className="h-4 w-32 bg-slate-200 rounded-md mb-6"></div>
          <div className="h-[200px] bg-slate-50 border border-slate-100 rounded-xl"></div>
        </div>
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[340px]">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-6"></div>
          <div className="h-[200px] bg-slate-50 border border-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
