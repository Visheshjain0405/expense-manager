import React from 'react'
import { AlertCircle, CheckCircle, Info, Landmark, Lightbulb } from 'lucide-react'

export default function FinancialInsights({ insights = [] }) {
  const getIcon = (type, severity) => {
    switch (type) {
      case 'savings':
        return severity === 'success' ? (
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
        ) : (
          <AlertCircle className="text-amber-500 flex-shrink-0" size={18} />
        )
      case 'category':
        return <Landmark className="text-blue-500 flex-shrink-0" size={18} />
      case 'spending':
      case 'largest_expense':
      default:
        return <Lightbulb className="text-amber-500 flex-shrink-0" size={18} />
    }
  }

  const getCardBg = (severity) => {
    switch (severity) {
      case 'success':
        return 'bg-emerald-50/40 border-emerald-100/50'
      case 'warning':
        return 'bg-rose-50/30 border-rose-100/50'
      case 'info':
      default:
        return 'bg-slate-50 border-brand-border'
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col min-h-[380px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Financial Insights</h3>
        <p className="text-xs text-text-secondary mt-0.5">Automated spending and saving analysis.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {insights.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No insights available for this period. Try adding more transactions.
          </div>
        ) : (
          insights.map((ins, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-xl flex items-start gap-3 transition ${getCardBg(ins.severity)}`}
            >
              {getIcon(ins.type, ins.severity)}
              <div>
                <h4 className="text-xs font-bold text-text-main leading-none">
                  {ins.title}
                </h4>
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                  {ins.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
