import React from 'react'

export default function LiabilitiesBreakdown({ accounts = [], items = [] }) {
  const getCategorizedLiabilities = () => {
    const list = {}
    
    // Negative accounts balances (e.g. credit cards absolute outstanding)
    const creditCardTotal = accounts.filter((a) => a.currentBalance < 0).reduce((sum, a) => sum + Math.abs(a.currentBalance), 0)
    if (creditCardTotal > 0) {
      list['Credit Cards Outstanding'] = { name: 'Credit Cards Outstanding', amount: creditCardTotal, color: '#EF4444' }
    }

    // Manual net worth item liabilities (loans, personal debts)
    items
      .filter((i) => i.type === 'liability')
      .forEach((item) => {
        const friendlyName = item.category
          .replace('_', ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
        
        if (!list[friendlyName]) {
          list[friendlyName] = {
            name: friendlyName,
            amount: 0,
            color: '#EF4444'
          }
        }
        list[friendlyName].amount += item.value
      })

    const total = Object.values(list).reduce((sum, i) => sum + i.amount, 0)
    return Object.values(list)
      .map((i) => ({
        ...i,
        percentage: total > 0 ? parseFloat(((i.amount / total) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  const liabilitiesList = getCategorizedLiabilities()

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[340px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Liabilities Distribution</h3>
        <p className="text-xs text-text-secondary mt-0.5">What you owe.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {liabilitiesList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No liabilities found. Negative credit balances will automatically appear here.
          </div>
        ) : (
          liabilitiesList.map((liability, idx) => (
            <div key={idx} className="space-y-1.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold select-none">
                <span className="text-text-main flex items-center gap-1.5">
                  <span className="text-text-secondary font-medium">{idx + 1}.</span>
                  {liability.name}
                </span>
                <span className="text-text-secondary">
                  ₹{liability.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-text-secondary/80 font-normal">
                    ({liability.percentage}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden select-none">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: liability.color,
                    width: `${liability.percentage}%`
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
