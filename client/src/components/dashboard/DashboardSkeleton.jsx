import React from 'react'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse text-left select-none pointer-events-none">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-6 border-b border-brand-border">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-6 h-36 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-3.5 w-24 bg-slate-150 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[400px] flex flex-col justify-between">
          <div className="h-6 w-36 bg-slate-200 rounded-md"></div>
          <div className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-xl my-4"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
        </div>
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[400px] flex flex-col justify-between">
          <div className="h-6 w-36 bg-slate-200 rounded-md"></div>
          <div className="w-32 h-32 rounded-full border-8 border-slate-100 my-auto mx-auto"></div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-4 bg-slate-100 rounded-md"></div>
            <div className="h-4 bg-slate-100 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
