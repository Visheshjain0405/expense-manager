import React from 'react'

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse select-none text-left pointer-events-none">
      {/* 4 Summary metric skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-6 h-28 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
              <div className="w-7 h-7 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-8 bg-slate-100 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main charts row skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px]">
          <div className="space-y-2 mb-6">
            <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
            <div className="h-3 w-32 bg-slate-150 rounded-md"></div>
          </div>
          <div className="h-56 bg-slate-50 border border-slate-100 rounded-xl"></div>
        </div>
        
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px]">
          <div className="space-y-2 mb-6">
            <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
            <div className="h-3 w-32 bg-slate-150 rounded-md"></div>
          </div>
          <div className="w-36 h-36 mx-auto rounded-full border-[10px] border-slate-100 flex items-center justify-center">
            <div className="h-4 w-12 bg-slate-250 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Ranked categories and daily spending skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px] space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-2"></div>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
                <div className="h-3 w-10 bg-slate-200 rounded-md"></div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full"></div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px]">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-6"></div>
          <div className="h-56 bg-slate-50 border border-slate-100 rounded-xl"></div>
        </div>
      </div>

      {/* Account metrics and insights skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px]">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-6"></div>
          <div className="h-56 bg-slate-50 border border-slate-100 rounded-xl"></div>
        </div>
        
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px] space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-4"></div>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-4 w-12 bg-slate-100 rounded-md"></div>
          ))}
        </div>

        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 h-[380px] space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded-md mb-2"></div>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="p-4 border border-slate-100 rounded-xl flex gap-3 h-20 bg-slate-50/50">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex-shrink-0"></div>
              <div className="space-y-1.5 w-full">
                <div className="h-3.5 w-24 bg-slate-200 rounded-md"></div>
                <div className="h-3 w-full bg-slate-200 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
