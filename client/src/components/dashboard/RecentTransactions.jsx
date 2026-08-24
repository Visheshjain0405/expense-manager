import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowRight, PlusCircle, Inbox, Loader2 } from 'lucide-react'
import transactionService from '../../services/transactionService'

export default function RecentTransactions({ refreshTrigger, onOpenModal }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await transactionService.getTransactions({
          page: 1,
          limit: 6,
          sort: 'newest'
        })
        if (data.success) {
          setTransactions(data.transactions || [])
        } else {
          setError(data.message || 'Unable to retrieve transactions.')
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Unable to connect to the server. Please try again in a moment.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [refreshTrigger])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="text-xs text-text-secondary mt-2 font-semibold">Loading transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col items-center justify-center h-[500px] text-center select-none">
        <Icons.AlertCircle className="text-expense mb-2" size={28} />
        <p className="text-sm font-bold text-text-main">Unable to load transactions</p>
        <p className="text-xs text-text-secondary mt-1 max-w-xs">{error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col items-center justify-center h-[500px] text-center select-none">
        <div className="p-3 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-4 inline-block">
          <Inbox size={24} />
        </div>
        <h4 className="text-sm font-bold text-text-main">No transactions yet</h4>
        <p className="text-xs text-text-secondary mt-1 max-w-[200px] leading-relaxed">
          Start tracking your finances by adding your first transaction.
        </p>
        <button
          onClick={onOpenModal}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.15)]"
        >
          <PlusCircle size={14} />
          Add Transaction
        </button>
      </div>
    )
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left flex flex-col h-[500px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-text-main text-base">Recent Transactions</h3>
          <p className="text-xs text-text-secondary mt-0.5">Your latest financial logs.</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 transition select-none"
        >
          View all transactions
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {transactions.map((tx) => {
          const isExpense = tx.type === 'expense'
          const categoryName = tx.categoryId?.name || 'Other'
          const categoryIcon = tx.categoryId?.icon || 'FolderOpen'
          const categoryColor = tx.categoryId?.color || '#64748B'

          const IconComponent = Icons[categoryIcon] || Icons.FolderOpen

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 border border-transparent hover:border-brand-border rounded-xl transition duration-150 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Category Icon */}
                <div 
                  className="p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${categoryColor}15`, 
                    borderColor: `${categoryColor}30`, 
                    color: categoryColor 
                  }}
                >
                  <IconComponent size={18} />
                </div>
                
                {/* Info Text */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-main truncate">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary font-medium">
                    <span>{categoryName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="text-right flex-shrink-0 pl-4">
                <span
                  className={`text-sm font-extrabold tracking-tight ${
                    isExpense ? 'text-expense' : 'text-income'
                  }`}
                >
                  {isExpense ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-text-secondary mt-0.5 select-none">
                  {formatDate(tx.date)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
