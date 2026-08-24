import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import transactionService from '../../services/transactionService'
import categoryService from '../../services/categoryService'
import accountService from '../../services/accountService'

export default function AddTransactionModal({ isOpen, onClose, onSuccess, transactionToEdit = null }) {
  const [type, setType] = useState('expense') // 'income' or 'expense'
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)
  
  // Dynamic categories list loaded from Category API
  const [categoriesList, setCategoriesList] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Dynamic accounts list loaded from Account API
  const [accountsList, setAccountsList] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      amount: '',
      date: new Date().toISOString().substring(0, 10), // default to today's date
      categoryId: '',
      accountId: '',
      description: '',
      notes: ''
    }
  })

  // Whenever modal opens or transactionToEdit changes, update form
  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type)
        reset({
          amount: Math.abs(transactionToEdit.amount),
          date: new Date(transactionToEdit.date).toISOString().substring(0, 10),
          categoryId: transactionToEdit.categoryId?.id || transactionToEdit.categoryId || '',
          accountId: transactionToEdit.accountId?.id || transactionToEdit.accountId || '',
          description: transactionToEdit.description,
          notes: transactionToEdit.notes || ''
        })
      } else {
        setType('expense')
        reset({
          amount: '',
          date: new Date().toISOString().substring(0, 10),
          categoryId: '',
          accountId: '',
          description: '',
          notes: ''
        })
      }
    }
  }, [isOpen, transactionToEdit, reset])

  // Fetch categories list dynamically matching type selections
  useEffect(() => {
    const fetchModalCategories = async () => {
      if (isOpen) {
        setLoadingCategories(true)
        try {
          const response = await categoryService.getCategories({ type })
          if (response.success) {
            setCategoriesList(response.categories || [])
          }
        } catch (error) {
          console.error('Error fetching modal categories list:', error)
        } finally {
          setLoadingCategories(false)
        }
      }
    }

    fetchModalCategories()
  }, [isOpen, type])

  // Fetch accounts list dynamically
  useEffect(() => {
    const fetchModalAccounts = async () => {
      if (isOpen) {
        setLoadingAccounts(true)
        try {
          const response = await accountService.getAccounts()
          if (response.success) {
            setAccountsList(response.accounts || [])
          }
        } catch (error) {
          console.error('Error fetching modal accounts list:', error)
        } finally {
          setLoadingAccounts(false)
        }
      }
    }

    fetchModalAccounts()
  }, [isOpen])

  // Whenever type changes (in create mode only), reset the category selection so the user doesn't submit a category belonging to the other list.
  useEffect(() => {
    if (!transactionToEdit) {
      setValue('categoryId', '')
    }
  }, [type, setValue, transactionToEdit])

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      type,
      amount: parseFloat(data.amount),
      date: data.date,
      categoryId: data.categoryId,
      accountId: data.accountId,
      description: data.description,
      notes: data.notes
    }

    try {
      let response
      if (transactionToEdit) {
        response = await transactionService.updateTransaction(transactionToEdit.id, payload)
      } else {
        response = await transactionService.createTransaction(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          transactionToEdit
            ? 'Transaction updated successfully.'
            : type === 'expense'
            ? 'Expense added successfully.'
            : 'Income added successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save transaction. Please try again.')
      }
    } catch (error) {
      setIsSaving(false)
      console.error('Error creating/updating transaction:', error)
      const msg = error.response?.data?.message || 'Unable to connect to the server. Please try again in a moment.'
      setApiError(msg)
    }
  }

  if (!isOpen) return null

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <div>
            <h3 className="text-lg font-bold text-text-main">
              {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {transactionToEdit ? 'Update your income or expense details.' : 'Record your income or expense.'}
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

          {/* Type Toggle Tabs */}
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

          {/* Amount Field (Prominent) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-amount" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xl font-extrabold text-text-secondary">
                ₹
              </span>
              <input
                id="modal-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSaving}
                {...register('amount', {
                  required: 'Please enter an amount.',
                  min: { value: 0.01, message: 'Amount must be greater than 0.' }
                })}
                className={`w-full h-12 pl-9 pr-4 bg-brand-surface border rounded-xl text-lg font-bold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.amount ? 'border-expense' : 'border-brand-border'
                }`}
              />
            </div>
            {errors.amount && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.amount.message}</span>
            )}
          </div>

          {/* Date & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-date" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Date
              </label>
              <input
                id="modal-date"
                type="date"
                disabled={isSaving}
                {...register('date', { required: 'Please select a date.' })}
                className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
              {errors.date && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.date.message}</span>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-category" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Category
              </label>
              <select
                id="modal-category"
                disabled={isSaving || loadingCategories}
                {...register('categoryId', { required: 'Please select a category.' })}
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
          </div>

          {/* Account Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-account" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Account
            </label>
            <select
              id="modal-account"
              disabled={isSaving || loadingAccounts}
              {...register('accountId', { required: 'Please select an account.' })}
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

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-description" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Description
            </label>
            <input
              id="modal-description"
              type="text"
              placeholder="What was this transaction for?"
              disabled={isSaving}
              {...register('description', {
                required: 'Please enter a description.',
                minLength: { value: 2, message: 'Description must be at least 2 characters.' }
              })}
              className={`w-full h-11 px-4 bg-brand-surface border rounded-xl text-sm font-medium text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                errors.description ? 'border-expense' : 'border-brand-border'
              }`}
            />
            {errors.description && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.description.message}</span>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-notes" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              id="modal-notes"
              placeholder="Add a note..."
              disabled={isSaving}
              rows={2}
              {...register('notes')}
              className="w-full p-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-medium text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-brand-border text-text-main text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.15)] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{transactionToEdit ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                transactionToEdit ? 'Update Transaction' : (type === 'expense' ? 'Save Expense' : 'Save Income')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
