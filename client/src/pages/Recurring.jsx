import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import recurringTransactionService from '../services/recurringTransactionService'

// Custom Subcomponents
import RecurringSummary from '../components/recurring/RecurringSummary'
import RecurringGrid from '../components/recurring/RecurringGrid'
import UpcomingRecurring from '../components/recurring/UpcomingRecurring'
import RecurringSkeleton from '../components/recurring/RecurringSkeleton'

// Modals
import RecurringModal from '../components/recurring/RecurringModal'
import DeleteRecurringModal from '../components/recurring/DeleteRecurringModal'

export default function Recurring() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchRecurringData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await recurringTransactionService.getRecurringTransactions()
      if (response.success) {
        setSchedules(response.recurringTransactions || [])
      } else {
        setError('Unable to load recurring schedules.')
      }
    } catch (err) {
      console.error('Error fetching recurring data:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecurringData()
  }, [fetchRecurringData])

  // Toast automatic dismiss
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
    fetchRecurringData()
  }

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (schedule) => {
    setSelectedSchedule(schedule)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSchedule) return
    setIsDeleting(true)
    try {
      const response = await recurringTransactionService.deleteRecurringTransaction(selectedSchedule.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Recurring template deleted. Transactions are preserved.')
        setSelectedSchedule(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete template.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting recurring schedule:', err)
      const msg = err.response?.data?.message || 'Unable to delete template.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  // Trigger pause API call
  const handlePause = async (id) => {
    try {
      const response = await recurringTransactionService.pauseRecurringTransaction(id)
      if (response.success) {
        handleSuccess('Recurring schedule paused.')
      }
    } catch (err) {
      console.error('Error pausing recurring schedule:', err)
      setToastError('Unable to pause schedule.')
    }
  }

  // Trigger resume API call
  const handleResume = async (id) => {
    try {
      const response = await recurringTransactionService.resumeRecurringTransaction(id)
      if (response.success) {
        handleSuccess('Recurring schedule resumed.')
      }
    } catch (err) {
      console.error('Error resuming recurring schedule:', err)
      setToastError('Unable to resume schedule.')
    }
  }

  const handleOpenAddModal = () => {
    setSelectedSchedule(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast Success */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toast Failure */}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-rose-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <AlertCircle size={18} />
          <span>{toastError}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
            Recurring Transactions
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your recurring income, bills and subscriptions.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Add Recurring
        </button>
      </div>

      {loading ? (
        <RecurringSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load schedules</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchRecurringData}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No schedules yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            Create recurring templates to automatically track monthly rent, EMIs, or subscription logs.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Recurring
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary metrics display */}
          <RecurringSummary recurringTransactions={schedules} />

          {/* Grids and upcoming due cards lists */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <RecurringGrid
                schedules={schedules}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
                onPause={handlePause}
                onResume={handleResume}
              />
            </div>

            <div className="lg:col-span-4">
              <UpcomingRecurring schedules={schedules} />
            </div>
          </div>
        </div>
      )}

      {/* Modals controls */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        scheduleToEdit={selectedSchedule}
      />

      <DeleteRecurringModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedSchedule(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
