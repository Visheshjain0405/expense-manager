import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import accountService from '../services/accountService'

// Custom Subcomponents
import AccountSummary from '../components/accounts/AccountSummary'
import AccountGrid from '../components/accounts/AccountGrid'
import AccountSkeleton from '../components/accounts/AccountSkeleton'

// Modals
import AccountModal from '../components/accounts/AccountModal'
import DeleteAccountModal from '../components/accounts/DeleteAccountModal'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await accountService.getAccounts()
      if (response.success) {
        setAccounts(response.accounts || [])
      } else {
        setError(response.message || 'Unable to retrieve accounts.')
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError('Unable to connect to the server. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => {
        setToastError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastError])

  const handleSuccess = (msg) => {
    setToastMessage(msg)
    fetchAccounts()
  }

  const handleEdit = (acc) => {
    setSelectedAccount(acc)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (acc) => {
    setSelectedAccount(acc)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return
    setIsDeleting(true)
    try {
      const response = await accountService.deleteAccount(selectedAccount.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Account deleted successfully.')
        setSelectedAccount(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete account.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting account:', err)
      const msg = err.response?.data?.message || 'Unable to delete account. Check connection.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  const handleOpenAddModal = () => {
    setSelectedAccount(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast Alert Success popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toast Alert Failure popup */}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-rose-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <AlertCircle size={18} />
          <span>{toastError}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
            Accounts
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your bank accounts, cash, cards and wallets.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Add Account
        </button>
      </div>

      {/* Summary stats Section */}
      {!loading && !error && <AccountSummary accounts={accounts} />}

      {/* Grid states and cards lists */}
      {loading ? (
        <AccountSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load accounts</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchAccounts}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No accounts yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            Create an account to start tracking where your money is held or paid from.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Account
          </button>
        </div>
      ) : (
        <AccountGrid
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Account Modal controls */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        accountToEdit={selectedAccount}
      />

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedAccount(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
