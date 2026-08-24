import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import netWorthService from '../../services/netWorthService'

const assetCategories = [
  { value: 'cash', label: 'Cash / Currency' },
  { value: 'property', label: 'Real Estate / Property' },
  { value: 'vehicle', label: 'Vehicle / Automobile' },
  { value: 'gold', label: 'Gold / Precious Metals' },
  { value: 'investment', label: 'Mutual Funds & Stocks' },
  { value: 'fixed_deposit', label: 'Fixed Deposits' },
  { value: 'provident_fund', label: 'Provident Funds (EPF/PPF)' },
  { value: 'other_asset', label: 'Other Asset' }
]

const liabilityCategories = [
  { value: 'credit_card', label: 'Credit Card Outstanding' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'home_loan', label: 'Home Loan / Mortgage' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'vehicle_loan', label: 'Vehicle Loan' },
  { value: 'other_liability', label: 'Other Liability' }
]

export default function NetWorthItemModal({ isOpen, onClose, onSuccess, itemToEdit = null }) {
  const [type, setType] = useState('asset')
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      category: 'gold',
      value: '',
      valuationDate: new Date().toISOString().substring(0, 10),
      notes: ''
    }
  })

  // Whenever modal opens or itemToEdit changes, update form
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setType(itemToEdit.type)
        reset({
          name: itemToEdit.name,
          category: itemToEdit.category,
          value: itemToEdit.value,
          valuationDate: new Date(itemToEdit.valuationDate).toISOString().substring(0, 10),
          notes: itemToEdit.notes || ''
        })
      } else {
        setType('asset')
        reset({
          name: '',
          category: 'gold',
          value: '',
          valuationDate: new Date().toISOString().substring(0, 10),
          notes: ''
        })
      }
    }
  }, [isOpen, itemToEdit, reset])

  // Reset category options on type change
  useEffect(() => {
    if (!itemToEdit) {
      setValue('category', type === 'asset' ? 'gold' : 'personal_loan')
    }
  }, [type, setValue, itemToEdit])

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      name: data.name,
      type,
      category: data.category,
      value: parseFloat(data.value),
      valuationDate: data.valuationDate,
      notes: data.notes
    }

    try {
      let response
      if (itemToEdit) {
        response = await netWorthService.updateNetWorthItem(itemToEdit.id, payload)
      } else {
        response = await netWorthService.createNetWorthItem(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          itemToEdit
            ? 'Financial item updated successfully.'
            : 'Financial item created successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save item.')
      }
    } catch (err) {
      setIsSaving(false)
      console.error('Error saving net worth item:', err)
      const msg = err.response?.data?.message || 'Unable to connect to the server.'
      setApiError(msg)
    }
  }

  const activeCategories = type === 'asset' ? assetCategories : liabilityCategories

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
              {itemToEdit ? 'Edit Financial Item' : 'Add Financial Item'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Record assets like gold/property, or liabilities like loans.
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

          {/* Toggle Type (Disabled when editing to maintain classification integrity) */}
          <div className="flex bg-slate-50 border border-brand-border p-1 rounded-xl select-none">
            <button
              type="button"
              disabled={!!itemToEdit}
              onClick={() => setType('asset')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-65 cursor-pointer ${
                type === 'asset'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Asset
            </button>
            <button
              type="button"
              disabled={!!itemToEdit}
              onClick={() => setType('liability')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-65 cursor-pointer ${
                type === 'liability'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Liability
            </button>
          </div>

          {/* Item Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nw-name" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Item Name
            </label>
            <input
              id="nw-name"
              type="text"
              placeholder="e.g. Gold Coins, Personal Loan"
              disabled={isSaving}
              {...register('name', { 
                required: 'Please enter a name.',
                minLength: { value: 2, message: 'Name must be at least 2 characters.' }
              })}
              className={`w-full h-11 px-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                errors.name ? 'border-expense' : 'border-brand-border'
              }`}
            />
            {errors.name && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.name.message}</span>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nw-cat" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Category
            </label>
            <select
              id="nw-cat"
              disabled={isSaving}
              {...register('category', { required: 'Please select a category.' })}
              className="w-full h-11 px-3 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            >
              {activeCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Valuation Value */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nw-val" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Current Value
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sm font-bold text-text-secondary">
                ₹
              </span>
              <input
                id="nw-val"
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSaving}
                {...register('value', {
                  required: 'Please enter valuation value.',
                  min: { value: 0, message: 'Value must be positive or 0.' }
                })}
                className={`w-full h-11 pl-8 pr-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                  errors.value ? 'border-expense' : 'border-brand-border'
                }`}
              />
            </div>
            {errors.value && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.value.message}</span>
            )}
          </div>

          {/* Valuation Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nw-date" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Valuation Date
            </label>
            <input
              id="nw-date"
              type="date"
              disabled={isSaving}
              {...register('valuationDate', { required: 'Please enter valuation date.' })}
              className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Notes Optional details */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nw-notes" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              id="nw-notes"
              placeholder="Valuation receipts, certificate numbers..."
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
                  <span>{itemToEdit ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                itemToEdit ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
