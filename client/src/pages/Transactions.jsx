import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import transactionService from '../services/transactionService'

// Custom Sub-components
import TransactionSummary from '../components/transactions/TransactionSummary'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionTable from '../components/transactions/TransactionTable'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionPagination from '../components/transactions/TransactionPagination'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton'

// Modals
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import TransactionDetailsModal from '../components/transactions/TransactionDetailsModal'
import DeleteTransactionModal from '../components/transactions/DeleteTransactionModal'

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({})
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal display states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Active object references
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Map filters from URL search params
  const filters = {
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    paymentMethod: searchParams.get('paymentMethod') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20
  }

  // Update query state params inside URL search parameters
  const updateFilters = useCallback((newFilters) => {
    const updated = { ...filters, ...newFilters }
    const params = {}

    // Clean empty values to keep URL readable
    Object.keys(updated).forEach((key) => {
      const val = updated[key]
      if (val !== undefined && val !== null && val !== '') {
        params[key] = String(val)
      }
    })

    setSearchParams(params)
  }, [filters, setSearchParams])

  // Clear all filters back to default empty state parameters
  const handleClearFilters = () => {
    setSearchParams({})
  }

  // Fetch transactions based on current URL filter properties
  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await transactionService.getTransactions(filters)
      if (response.success) {
        setTransactions(response.transactions || [])
        setSummary(response.summary || {})
        setPagination(response.pagination || {})
      } else {
        setError(response.message || 'Unable to retrieve transactions.')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Unable to connect to the server. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [searchParams]) // Reload when URL parameters modify

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Success operation triggers
  const handleSuccess = (msg) => {
    setToastMessage(msg)
    fetchTransactions()
    setSelectedTransaction(null)
  }

  // Auto-dismiss toast alert
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Trigger delete operation
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

  // Row selection actions
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

  const handleOpenAddModal = () => {
    setSelectedTransaction(null)
    setIsAddModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
            Transactions
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            View and manage all your income and expenses.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Add Transaction
        </button>
      </div>

      {/* Summary Section */}
      {!loading && !error && <TransactionSummary summary={summary} />}

      {/* Filter Control Section */}
      <TransactionFilters
        filters={filters}
        onChange={updateFilters}
        onClear={handleClearFilters}
      />

      {/* Sorting dropdown bar */}
      <div className="flex items-center justify-between select-none">
        <span className="text-xs text-text-secondary font-medium">
          Sort configuration:
        </span>
        <select
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
          className="h-10 px-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      {/* Query Load states / Tables display / Stacks lists */}
      {loading ? (
        <TransactionsTableSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load transactions</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">
            {Object.keys(searchParams.entries()).length > 0 || searchParams.toString() !== ''
              ? 'No transactions found'
              : 'No transactions yet'}
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            {Object.keys(searchParams.entries()).length > 0 || searchParams.toString() !== ''
              ? 'Try changing your filters or add your first transaction.'
              : 'Start tracking your finances by adding your first income or expense.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Transaction
          </button>
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

          {/* Mobile Stacks View */}
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

          {/* Pagination Controls */}
          <TransactionPagination
            pagination={pagination}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </div>
      )}

      {/* Modal Overlays */}
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
