import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'

const friendlyTypes = {
  cash: 'Cash',
  bank: 'Bank Account',
  upi: 'UPI',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  wallet: 'Wallet',
  investment: 'Investment',
  other: 'Other'
}

export default function AccountCard({ account, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const IconComponent = Icons[account.icon] || Icons.Landmark
  const isNegative = account.currentBalance < 0

  const handleCardClick = (e) => {
    // If user clicks the three dots or dropdown buttons, don't navigate
    if (e.target.closest('.no-nav')) return
    navigate(`/accounts/${account.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between h-48 relative cursor-pointer group"
    >
      <div className="flex justify-between items-start no-nav">
        {/* Account Icon */}
        <div 
          className="p-3.5 rounded-xl border flex items-center justify-center"
          style={{ 
            backgroundColor: `${account.color}15`, 
            borderColor: `${account.color}30`, 
            color: account.color 
          }}
        >
          <IconComponent size={20} />
        </div>

        {/* Action Options Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev) }}
            className="p-1.5 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition select-none cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
              />
              <div className="absolute right-0 mt-1 w-32 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in text-left">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(account) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Edit2 size={12} className="text-text-secondary" />
                  Edit
                </button>
                <hr className="border-brand-border my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(account) }}
                  className="w-full px-4 py-2 text-xs font-semibold text-expense hover:bg-rose-50 flex items-center gap-2 cursor-pointer select-none"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-2.5">
        <h4 className="text-base font-bold text-text-main tracking-tight truncate group-hover:text-primary transition duration-150">
          {account.name}
        </h4>
        <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
          {friendlyTypes[account.type] || 'Account'}
        </p>
      </div>

      <div className="border-t border-slate-50/50 pt-2.5 flex justify-between items-end">
        <div>
          <span className={`text-lg font-black tracking-tight ${isNegative ? 'text-expense' : 'text-text-main'}`}>
            {isNegative ? '-' : ''}₹{Math.abs(account.currentBalance).toLocaleString('en-IN')}
          </span>
          <p className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">
            Current Balance
          </p>
        </div>

        <span className="text-[10px] text-text-secondary font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-100/50">
          {account.transactionCount || 0} transactions
        </span>
      </div>
    </div>
  )
}
