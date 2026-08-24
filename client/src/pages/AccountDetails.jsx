import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Info, Inbox, CheckCircle2, AlertCircle } from 'lucide-react'
import accountService from '../services/accountService'
import transactionService from '../services/transactionService'

// Custom Subcomponents
import TransactionTable from '../components/transactions/TransactionTable'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionPagination from '../components/transactions/TransactionPagination'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton'

// Modals
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import TransactionDetailsModal from '../components/transactions/TransactionDetailsModal'
import DeleteTransactionModal from '../components/transactions/DeleteTransactionModal'

export default function AccountDetails() {
  const { id } = useParams()

  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [error, setError] = useState(null)

  // URL search page parameters
  const [currentPage, setCurrentPage] = useState(1)

  // Modals display states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch detailed account info
  const fetchAccountInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await accountService.getAccountById(id)
      if (response.success) {
        setAccount(response.account || null)
      } else {
        setError(response.message || 'Unable to retrieve account details.')
      }
    } catch (err) {
      console.error('Error fetching account details:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Fetch transactions belonging to account
  const fetchAccountTransactions = useCallback(async () => {
    setLoadingTransactions(true)
    try {
      const response = await transactionService.getTransactions({
        accountId: id,
        page: currentPage,
        limit: 15,
        sort: 'newest'
      })
      if (response.success) {
        setTransactions(response.transactions || [])
        setPagination(response.pagination || {})
      }
    } catch (err) {
      console.error('Error fetching account transactions:', err)
    } finally {
      setLoadingTransactions(false)
    }
  }, [id, currentPage])

  useEffect(() => {
    fetchAccountInfo()
  }, [fetchAccountInfo])

  useEffect(() => {
    fetchAccountTransactions()
  }, [fetchAccountTransactions])

  // Toast notifications auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleSuccess = (msg) => {
    setToastMessage(msg)
    fetchAccountInfo()
    fetchAccountTransactions()
    setSelectedTransaction(null)
  }

  // Delete transaction action handler
  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return
    setIsDeleting(true)
    try {
      const response = await transactionService.deleteTransaction(selectedTransaction.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Transaction deleted successfully.')
      } else {
        setIsDeleting(false)
        alert(response.message || 'Unable to delete transaction.')
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting transaction:', err)
      alert('Unable to delete transaction. Please check server connections.')
    }
  }

  const handleView = (tx) => {
    setSelectedTransaction(tx)
    setIsDetailsOpen(true)
  }

  const handleEdit = (tx) => {
    setSelectedTransaction(tx)
    setIsAddModalOpen(true)
  }

  const handleDeletePrompt = (tx) => {
    setSelectedTransaction(tx)
    setIsDeleteOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none text-left">
        <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
        <div className="h-28 bg-brand-surface border border-brand-border rounded-2xl"></div>
        <div className="h-[400px] bg-brand-surface border border-brand-border rounded-2xl"></div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left select-none">
        <AlertCircle className="mx-auto text-expense mb-3" size={32} />
        <h3 className="text-sm font-bold text-text-main">Unable to load account</h3>
        <p className="text-xs text-text-secondary mt-1">{error || 'Account not found'}</p>
        <Link
          to="/accounts"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-brand-border hover:bg-slate-50 text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Accounts
        </Link>
      </div>
    )
  }

  const isNegative = account.currentBalance < 0

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back navigation */}
      <div>
        <Link
          to="/accounts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-main transition select-none"
        >
          <ArrowLeft size={14} />
          Back to Accounts
        </Link>
      </div>

      {/* Account Info Stats Board */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
            <span 
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: account.color }}
            />
            {account.name}
          </h2>
          <p className="text-xs text-text-secondary mt-1 uppercase font-bold tracking-wider">
            {account.type.replace('_', ' ')}
          </p>
        </div>

        {/* Dynamic balances grid */}
        <div className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-12 select-none border-t md:border-t-0 border-slate-50 pt-6 md:pt-0">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Current Balance
            </p>
            <h3 className={`text-xl font-extrabold tracking-tight mt-0.5 ${isNegative ? 'text-expense' : 'text-text-main'}`}>
              {isNegative ? '-' : ''}₹{Math.abs(account.currentBalance).toLocaleString('en-IN')}
            </h3>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Opening Balance
            </p>
            <h3 className="text-base font-bold text-text-main tracking-tight mt-0.5">
              ₹{account.openingBalance.toLocaleString('en-IN')}
            </h3>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary flex items-center gap-1">
              <ArrowUpCircle size={12} className="text-income" />
              Total Income
            </p>
            <h3 className="text-base font-bold text-income tracking-tight mt-0.5">
              +₹{account.totalIncome.toLocaleString('en-IN')}
            </h3>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary flex items-center gap-1">
              <ArrowDownCircle size={12} className="text-expense" />
              Total Expenses
            </p>
            <h3 className="text-base font-bold text-expense tracking-tight mt-0.5">
              -₹{account.totalExpenses.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Account Transactions Ledger list */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-text-main tracking-tight">Ledger Ledger</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Transactions recorded under this account ({account.transactionCount || 0}).
          </p>
        </div>

        {loadingTransactions ? (
          <TransactionsTableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
            <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
              <Inbox size={32} />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">No transactions</h3>
            <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
              No transactions have been logged under this account yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <TransactionTable
                transactions={transactions}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
              />
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {transactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                />
              ))}
            </div>

            {/* Pagination */}
            <TransactionPagination
              pagination={pagination}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals contexts */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        transactionToEdit={selectedTransaction}
        onSuccess={handleSuccess}
      />

      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedTransaction(null) }}
        transaction={selectedTransaction}
      />

      <DeleteTransactionModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedTransaction(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
