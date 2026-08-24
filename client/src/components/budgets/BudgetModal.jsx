import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import categoryService from '../../services/categoryService'
import budgetService from '../../services/budgetService'

export default function BudgetModal({ isOpen, onClose, onSuccess, budgetToEdit = null }) {
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Dynamic expense categories list loaded from Category API
  const [categoriesList, setCategoriesList] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      categoryId: '',
      amount: '',
      monthStr: new Date().toISOString().substring(0, 7), // default to YYYY-MM
      alertThreshold: 80
    }
  })

  // Whenever modal opens or budgetToEdit changes, update form
  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        // Find YYYY-MM month string
        const d = new Date(budgetToEdit.startDate)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        reset({
          categoryId: budgetToEdit.category?.id || budgetToEdit.category || '',
          amount: budgetToEdit.amount,
          monthStr: `${year}-${month}`,
          alertThreshold: budgetToEdit.alertThreshold
        })
      } else {
        reset({
          categoryId: '',
          amount: '',
          monthStr: new Date().toISOString().substring(0, 7),
          alertThreshold: 80
        })
      }
    }
  }, [isOpen, budgetToEdit, reset])

  // Fetch expense categories list dynamically
  useEffect(() => {
    const fetchBudgetCategories = async () => {
      if (isOpen) {
        setLoadingCategories(true)
        try {
          const response = await categoryService.getCategories({ type: 'expense' })
          if (response.success) {
            setCategoriesList(response.categories || [])
          }
        } catch (error) {
          console.error('Error fetching budget categories list:', error)
        } finally {
          setLoadingCategories(false)
        }
      }
    }

    fetchBudgetCategories()
  }, [isOpen])

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    // Calculate dates from month string
    const [year, month] = data.monthStr.split('-').map(Number)
    const startDateObj = new Date(year, month - 1, 1)
    const endDateObj = new Date(year, month, 0)
    
    // Shift boundaries to UTC/Local standard ISO strings
    const startDate = startDateObj.toISOString().substring(0, 10)
    const endDate = endDateObj.toISOString().substring(0, 10)

    const payload = {
      categoryId: data.categoryId,
      amount: parseFloat(data.amount),
      period: 'monthly',
      startDate,
      endDate,
      alertThreshold: parseInt(data.alertThreshold)
    }

    try {
      let response
      if (budgetToEdit) {
        response = await budgetService.updateBudget(budgetToEdit.id, payload)
      } else {
        response = await budgetService.createBudget(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          budgetToEdit
            ? 'Budget updated successfully.'
            : 'Budget created successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save budget. Please try again.')
      }
    } catch (error) {
      setIsSaving(false)
      console.error('Error saving budget:', error)
      const msg = error.response?.data?.message || 'Unable to connect to the server. Please try again in a moment.'
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
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-zoom-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <div>
            <h3 className="text-base font-bold text-text-main">
              {budgetToEdit ? 'Edit Budget' : 'Create Budget'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Set monthly spending caps for your categories.
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

          {/* Category Dropdown (Disabled when editing) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget-category" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Expense Category
            </label>
            <select
              id="budget-category"
              disabled={isSaving || loadingCategories || !!budgetToEdit}
              {...register('categoryId', { required: 'Please select a category.' })}
              className={`w-full h-11 px-3 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
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
            {budgetToEdit && (
              <span className="text-[10px] text-text-secondary font-medium">
                Category cannot be modified. Please delete and recreate if needed.
              </span>
            )}
            {errors.categoryId && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.categoryId.message}</span>
            )}
          </div>

          {/* Budget Limit Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget-amount" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Budget Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sm font-bold text-text-secondary">
                ₹
              </span>
              <input
                id="budget-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSaving}
                {...register('amount', {
                  required: 'Please enter a budget amount.',
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

          {/* Date Month Picker */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget-month" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Budget Month
            </label>
            <input
              id="budget-month"
              type="month"
              disabled={isSaving}
              {...register('monthStr', { required: 'Please select a budget month.' })}
              className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            {errors.monthStr && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.monthStr.message}</span>
            )}
          </div>

          {/* Alert Threshold Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline select-none">
              <label htmlFor="budget-threshold" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Alert Threshold
              </label>
              <span className="text-xs font-bold text-text-secondary">
                {errors.alertThreshold ? '80' : register('alertThreshold').value || '80'}%
              </span>
            </div>
            <input
              id="budget-threshold"
              type="range"
              min="1"
              max="100"
              disabled={isSaving}
              {...register('alertThreshold', { required: true })}
              className="w-full accent-primary h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-text-secondary leading-relaxed font-medium">
              We'll flag this budget as Warning once spending crosses this threshold.
            </span>
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
                  <span>{budgetToEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                budgetToEdit ? 'Update Budget' : 'Create Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
