import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle, Calendar } from 'lucide-react'
import categoryService from '../../services/categoryService'
import accountService from '../../services/accountService'
import recurringTransactionService from '../../services/recurringTransactionService'

export default function RecurringModal({ isOpen, onClose, onSuccess, scheduleToEdit = null }) {
  const [type, setType] = useState('expense')
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Dynamic accounts and categories
  const [categoriesList, setCategoriesList] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [accountsList, setAccountsList] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      amount: '',
      description: '',
      notes: '',
      frequency: 'monthly',
      interval: 1,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      occurrencesRemaining: '',
      categoryId: '',
      accountId: '',
      autoCreate: true
    }
  })

  // Watch parameters for nextDueDate preview
  const watchStartDate = watch('startDate')
  const watchFrequency = watch('frequency')
  const watchInterval = watch('interval')

  // Reset or set forms on open/edit changes
  useEffect(() => {
    if (isOpen) {
      if (scheduleToEdit) {
        setType(scheduleToEdit.type)
        reset({
          amount: scheduleToEdit.amount,
          description: scheduleToEdit.description,
          notes: scheduleToEdit.notes || '',
          frequency: scheduleToEdit.frequency,
          interval: scheduleToEdit.interval,
          startDate: new Date(scheduleToEdit.startDate).toISOString().substring(0, 10),
          endDate: scheduleToEdit.endDate ? new Date(scheduleToEdit.endDate).toISOString().substring(0, 10) : '',
          occurrencesRemaining: scheduleToEdit.occurrencesRemaining || '',
          categoryId: scheduleToEdit.category?.id || scheduleToEdit.category || '',
          accountId: scheduleToEdit.account?.id || scheduleToEdit.account || '',
          autoCreate: scheduleToEdit.autoCreate ?? true
        })
      } else {
        setType('expense')
        reset({
          amount: '',
          description: '',
          notes: '',
          frequency: 'monthly',
          interval: 1,
          startDate: new Date().toISOString().substring(0, 10),
          endDate: '',
          occurrencesRemaining: '',
          categoryId: '',
          accountId: '',
          autoCreate: true
        })
      }
    }
  }, [isOpen, scheduleToEdit, reset])

  // Fetch categories matching type
  useEffect(() => {
    const fetchRecurringCategories = async () => {
      if (isOpen) {
        setLoadingCategories(true)
        try {
          const response = await categoryService.getCategories({ type })
          if (response.success) {
            setCategoriesList(response.categories || [])
          }
        } catch (err) {
          console.error('Error loading recurring categories:', err)
        } finally {
          setLoadingCategories(false)
        }
      }
    }
    fetchRecurringCategories()
  }, [isOpen, type])

  // Fetch accounts list
  useEffect(() => {
    const fetchRecurringAccounts = async () => {
      if (isOpen) {
        setLoadingAccounts(true)
        try {
          const response = await accountService.getAccounts()
          if (response.success) {
            setAccountsList(response.accounts || [])
          }
        } catch (err) {
          console.error('Error loading accounts:', err)
        } finally {
          setLoadingAccounts(false)
        }
      }
    }
    fetchRecurringAccounts()
  }, [isOpen])

  // Type change resets category option
  useEffect(() => {
    if (!scheduleToEdit) {
      setValue('categoryId', '')
    }
  }, [type, setValue, scheduleToEdit])

  // Calculate preview due date
  const getNextDuePreview = () => {
    if (!watchStartDate || isNaN(Date.parse(watchStartDate))) return ''
    const start = new Date(watchStartDate)
    const interval = parseInt(watchInterval || 1)
    
    // For preview, next due is start date. Next after next calculation:
    const next = new Date(start)
    if (watchFrequency === 'daily') next.setDate(next.getDate() + interval)
    else if (watchFrequency === 'weekly') next.setDate(next.getDate() + interval * 7)
    else if (watchFrequency === 'monthly') next.setMonth(next.getMonth() + interval)
    else if (watchFrequency === 'yearly') next.setFullYear(next.getFullYear() + interval)

    return next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      type,
      amount: parseFloat(data.amount),
      description: data.description,
      notes: data.notes,
      frequency: data.frequency,
      interval: parseInt(data.interval || 1),
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      occurrencesRemaining: data.occurrencesRemaining ? parseInt(data.occurrencesRemaining) : undefined,
      categoryId: data.categoryId,
      accountId: data.accountId,
      autoCreate: data.autoCreate
    }

    try {
      let response
      if (scheduleToEdit) {
        response = await recurringTransactionService.updateRecurringTransaction(scheduleToEdit.id, payload)
      } else {
        response = await recurringTransactionService.createRecurringTransaction(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          scheduleToEdit
            ? 'Recurring schedule updated successfully.'
            : 'Recurring schedule created successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save schedule.')
      }
    } catch (error) {
      setIsSaving(false)
      console.error('Error saving recurring schedule:', error)
      const msg = error.response?.data?.message || 'Unable to connect to the server. Please try again.'
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
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-zoom-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <div>
            <h3 className="text-base font-bold text-text-main">
              {scheduleToEdit ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Set up automated template transactions.
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {apiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-expense rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Toggle Type */}
          <div className="flex bg-slate-50 border border-brand-border p-1 rounded-xl select-none">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount & Description Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-amount" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-sm font-bold text-text-secondary">
                  ₹
                </span>
                <input
                  id="rec-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSaving}
                  {...register('amount', {
                    required: 'Please enter amount.',
                    min: { value: 0.01, message: 'Amount must be greater than 0.' }
                  })}
                  className={`w-full h-11 pl-8 pr-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                    errors.amount ? 'border-expense' : 'border-brand-border'
                  }`}
                />
              </div>
              {errors.amount && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.amount.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-desc" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Description
              </label>
              <input
                id="rec-desc"
                type="text"
                placeholder="e.g. Rent, Netflix"
                disabled={isSaving}
                {...register('description', {
                  required: 'Please enter description.',
                  minLength: { value: 2, message: 'Description must be at least 2 characters.' }
                })}
                className={`w-full h-11 px-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.description ? 'border-expense' : 'border-brand-border'
                }`}
              />
              {errors.description && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.description.message}</span>
              )}
            </div>
          </div>

          {/* Category & Account Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-category" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Category
              </label>
              <select
                id="rec-category"
                disabled={isSaving || loadingCategories}
                {...register('categoryId', { required: 'Please select category.' })}
                className={`w-full h-11 px-3 bg-brand-surface border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.categoryId ? 'border-expense' : 'border-brand-border'
                }`}
              >
                <option value="">
                  {loadingCategories ? 'Loading Categories...' : 'Select Category'}
                </option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.categoryId.message}</span>
              )}
            </div>

            {/* Account */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-account" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Account
              </label>
              <select
                id="rec-account"
                disabled={isSaving || loadingAccounts}
                {...register('accountId', { required: 'Please select account.' })}
                className={`w-full h-11 px-3 bg-brand-surface border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.accountId ? 'border-expense' : 'border-brand-border'
                }`}
              >
                <option value="">
                  {loadingAccounts ? 'Loading Accounts...' : 'Select Account'}
                </option>
                {accountsList.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.accountId.message}</span>
              )}
            </div>
          </div>

          {/* Frequency & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frequency Selection */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-freq" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Frequency
              </label>
              <select
                id="rec-freq"
                disabled={isSaving}
                {...register('frequency', { required: true })}
                className="w-full h-11 px-3 bg-brand-surface border border-brand-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-primary transition"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Interval */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-interval" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Repeat Every
              </label>
              <div className="relative">
                <input
                  id="rec-interval"
                  type="number"
                  disabled={isSaving}
                  {...register('interval', {
                    required: true,
                    min: { value: 1, message: 'Interval must be at least 1.' }
                  })}
                  className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
                />
              </div>
              {errors.interval && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.interval.message}</span>
              )}
            </div>
          </div>

          {/* Start Date & End Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-start" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Start Date
              </label>
              <input
                id="rec-start"
                type="date"
                disabled={isSaving}
                {...register('startDate', { required: 'Please enter start date.' })}
                className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
              />
              {errors.startDate && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.startDate.message}</span>
              )}
            </div>

            {/* End Date (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-end" className="text-xs font-bold text-text-main uppercase tracking-wider">
                End Date (Optional)
              </label>
              <input
                id="rec-end"
                type="date"
                disabled={isSaving}
                {...register('endDate')}
                className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Max Occurrences Limit (Optional) & Auto Create Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* occurrencesRemaining */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-occur" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Occurrences Limit (Optional)
              </label>
              <input
                id="rec-occur"
                type="number"
                placeholder="e.g. 12"
                disabled={isSaving}
                {...register('occurrencesRemaining', {
                  min: { value: 1, message: 'Must be at least 1.' }
                })}
                className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Auto Create Checkbox */}
            <div className="flex items-center gap-2 mt-4 select-none">
              <input
                id="rec-auto"
                type="checkbox"
                disabled={isSaving}
                {...register('autoCreate')}
                className="w-4.5 h-4.5 accent-primary border border-brand-border rounded-md cursor-pointer"
              />
              <label htmlFor="rec-auto" className="text-xs font-semibold text-text-main cursor-pointer">
                Auto-generate transactions
              </label>
            </div>
          </div>

          {/* Notes Optional details */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rec-notes" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              id="rec-notes"
              placeholder="Add subscription codes, account credentials..."
              disabled={isSaving}
              rows={2}
              {...register('notes')}
              className="w-full p-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Next Occurrence Preview Info Box */}
          {getNextDuePreview() && (
            <div className="p-4 bg-slate-50 border border-brand-border rounded-xl flex items-center gap-2.5 text-xs text-text-secondary font-semibold select-none">
              <Calendar size={16} className="text-primary flex-shrink-0" />
              <span>
                Next Transaction: <span className="text-text-main font-bold">{watchStartDate ? new Date(watchStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>. Followed by: <span className="text-text-main font-bold">{getNextDuePreview()}</span>.
              </span>
            </div>
          )}

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
                  <span>{scheduleToEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                scheduleToEdit ? 'Update Schedule' : 'Create Schedule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
