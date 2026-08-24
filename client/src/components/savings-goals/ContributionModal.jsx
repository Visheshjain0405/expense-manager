import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import accountService from '../../services/accountService'
import savingsGoalService from '../../services/savingsGoalService'

export default function ContributionModal({ isOpen, onClose, onSuccess, goal = null }) {
  const [accounts, setAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      amount: '',
      accountId: '',
      date: new Date().toISOString().substring(0, 10),
      notes: ''
    }
  })

  // Fetch accounts list on open
  useEffect(() => {
    const fetchAccounts = async () => {
      if (isOpen) {
        setLoadingAccounts(true)
        try {
          const response = await accountService.getAccounts()
          if (response.success) {
            setAccounts(response.accounts || [])
          }
        } catch (err) {
          console.error('Error fetching accounts for goal contribution:', err)
        } finally {
          setLoadingAccounts(false)
        }
      }
    }
    fetchAccounts()
  }, [isOpen])

  // Reset form when goal reference changes
  useEffect(() => {
    if (isOpen) {
      reset({
        amount: '',
        accountId: '',
        date: new Date().toISOString().substring(0, 10),
        notes: ''
      })
    }
  }, [isOpen, goal, reset])

  if (!isOpen || !goal) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      amount: parseFloat(data.amount),
      accountId: data.accountId,
      date: data.date,
      notes: data.notes
    }

    try {
      const response = await savingsGoalService.addContribution(goal.id, payload)
      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(`₹${payload.amount.toLocaleString('en-IN')} added to ${goal.name}.`)
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to log contribution.')
      }
    } catch (err) {
      setIsSaving(false)
      console.error('Error adding contribution:', err)
      const msg = err.response?.data?.message || 'Unable to connect to the server. Please try again.'
      setApiError(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl shadow-xl flex flex-col animate-zoom-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <div>
            <h3 className="text-base font-bold text-text-main">Add to Goal</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Goal: <span className="text-text-main font-bold">{goal.name}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {apiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-expense rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cont-amount" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Contribution Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sm font-bold text-text-secondary">
                ₹
              </span>
              <input
                id="cont-amount"
                type="number"
                placeholder="0.00"
                disabled={isSaving}
                {...register('amount', {
                  required: 'Please enter amount.',
                  min: { value: 0.01, message: 'Amount must be greater than 0.' }
                })}
                className={`w-full h-11 pl-8 pr-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.amount ? 'border-expense' : 'border-brand-border'
                }`}
              />
            </div>
            {errors.amount && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.amount.message}</span>
            )}
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cont-acc" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Source Account
            </label>
            <select
              id="cont-acc"
              disabled={isSaving || loadingAccounts}
              {...register('accountId', { required: 'Please select account.' })}
              className={`w-full h-11 px-3 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                errors.accountId ? 'border-expense' : 'border-brand-border'
              }`}
            >
              <option value="">
                {loadingAccounts ? 'Loading Accounts...' : 'Select Account'}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.accountId.message}</span>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cont-date" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Contribution Date
            </label>
            <input
              id="cont-date"
              type="date"
              disabled={isSaving}
              {...register('date', { required: 'Please select date.' })}
              className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cont-notes" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              id="cont-notes"
              placeholder="e.g. Monthly savings allocation"
              disabled={isSaving}
              rows={2}
              {...register('notes')}
              className="w-full p-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-brand-border text-text-main text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.15)] flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                'Add Contribution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
