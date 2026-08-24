import React from 'react'

export default function AssetsBreakdown({ accounts = [], items = [] }) {
  const getCategorizedAssets = () => {
    const list = {}
    
    // Positive accounts balances
    const bankTotal = accounts.filter((a) => a.currentBalance > 0).reduce((sum, a) => sum + a.currentBalance, 0)
    if (bankTotal > 0) {
      list['Bank & Cash Accounts'] = { name: 'Bank & Cash Accounts', amount: bankTotal, color: '#3B82F6' }
    }

    // Manual net worth item assets
    items
      .filter((i) => i.type === 'asset')
      .forEach((item) => {
        const friendlyName = item.category
          .replace('_', ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
        
        if (!list[friendlyName]) {
          list[friendlyName] = {
            name: friendlyName,
            amount: 0,
            color: '#10B981'
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

  const assetsList = getCategorizedAssets()
  const totalAssets = assetsList.reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[340px]">
      <div className="mb-4 select-none">
        <h3 className="font-bold text-text-main text-base">Assets Distribution</h3>
        <p className="text-xs text-text-secondary mt-0.5">Where your money is held.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {assetsList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            No assets found. Positive account balances will automatically appear here.
          </div>
        ) : (
          assetsList.map((asset, idx) => (
            <div key={idx} className="space-y-1.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold select-none">
                <span className="text-text-main flex items-center gap-1.5">
                  <span className="text-text-secondary font-medium">{idx + 1}.</span>
                  {asset.name}
                </span>
                <span className="text-text-secondary">
                  ₹{asset.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-text-secondary/80 font-normal">
                    ({asset.percentage}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden select-none">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: asset.color,
                    width: `${asset.percentage}%`
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
