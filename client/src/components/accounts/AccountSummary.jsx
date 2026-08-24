import React from 'react'
import { Wallet, Landmark, CreditCard, Layers } from 'lucide-react'

export default function AccountSummary({ accounts = [] }) {
  // Total Balance
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)

  // Cash
  const cashBalance = accounts
    .filter((acc) => acc.type === 'cash')
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  // Bank Accounts
  const bankBalance = accounts
    .filter((acc) => ['bank', 'debit_card', 'upi'].includes(acc.type))
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  // Cards / Wallets
  const cardWalletBalance = accounts
    .filter((acc) => ['credit_card', 'wallet'].includes(acc.type))
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left select-none">
      {/* Total Balance */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <Layers size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Total Balance
          </p>
          <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${totalBalance < 0 ? 'text-expense' : 'text-text-main'}`}>
            {totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Cash */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-text-secondary border border-slate-200 rounded-xl">
          <Wallet size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Cash
          </p>
          <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${cashBalance < 0 ? 'text-expense' : 'text-text-main'}`}>
            {cashBalance < 0 ? '-' : ''}₹{Math.abs(cashBalance).toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
          <Landmark size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Bank Accounts
          </p>
          <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${bankBalance < 0 ? 'text-expense' : 'text-text-main'}`}>
            {bankBalance < 0 ? '-' : ''}₹{Math.abs(bankBalance).toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Cards / Wallets */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-4">
        <div className="p-3 bg-rose-50 text-expense border border-rose-100 rounded-xl">
          <CreditCard size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Cards / Wallets
          </p>
          <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${cardWalletBalance < 0 ? 'text-expense' : 'text-text-main'}`}>
            {cardWalletBalance < 0 ? '-' : ''}₹{Math.abs(cardWalletBalance).toLocaleString('en-IN')}
          </h3>
        </div>
      </div>
    </div>
  )
}
