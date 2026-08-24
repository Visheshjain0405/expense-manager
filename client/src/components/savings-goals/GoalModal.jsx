import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import * as Icons from 'lucide-react'
import savingsGoalService from '../../services/savingsGoalService'

const iconOptions = ['Shield', 'Target', 'Heart', 'Trophy', 'Gift', 'Plane', 'Car', 'Laptop', 'Home', 'ShoppingBag']
const colorOptions = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']

export default function GoalModal({ isOpen, onClose, onSuccess, goalToEdit = null }) {
  const [selectedIcon, setSelectedIcon] = useState('Shield')
  const [selectedColor, setSelectedColor] = useState('#2563EB')
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      deadline: ''
    }
  })

  // Whenever modal opens or goalToEdit changes, update form values
  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setSelectedIcon(goalToEdit.icon || 'Shield')
        setSelectedColor(goalToEdit.color || '#2563EB')
        reset({
          name: goalToEdit.name,
          description: goalToEdit.description || '',
          targetAmount: goalToEdit.targetAmount,
          deadline: goalToEdit.deadline ? new Date(goalToEdit.deadline).toISOString().substring(0, 10) : ''
        })
      } else {
        setSelectedIcon('Shield')
        setSelectedColor('#2563EB')
        reset({
          name: '',
          description: '',
          targetAmount: '',
          deadline: ''
        })
      }
    }
  }, [isOpen, goalToEdit, reset])

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      name: data.name,
      description: data.description,
      targetAmount: parseFloat(data.targetAmount),
      deadline: data.deadline || undefined,
      icon: selectedIcon,
      color: selectedColor
    }

    try {
      let response
      if (goalToEdit) {
        response = await savingsGoalService.updateGoal(goalToEdit.id, payload)
      } else {
        response = await savingsGoalService.createGoal(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          goalToEdit
            ? 'Savings goal updated successfully.'
            : 'Savings goal created successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save savings goal.')
      }
    } catch (err) {
      setIsSaving(false)
      console.error('Error saving goal:', err)
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
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-zoom-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <div>
            <h3 className="text-base font-bold text-text-main">
              {goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Set target target deadlines to build emergency funds or plan purchase budgets.
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

          {/* Goal Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sg-name" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Goal Name
            </label>
            <input
              id="sg-name"
              type="text"
              placeholder="e.g. Emergency Fund, New MacBook"
              disabled={isSaving}
              {...register('name', { 
                required: 'Please enter a goal name.',
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

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sg-desc" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Description (Optional)
            </label>
            <input
              id="sg-desc"
              type="text"
              placeholder="e.g. 6 months of expenses, target budget for March 2027"
              disabled={isSaving}
              {...register('description')}
              className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Target Amount & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Amount */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sg-target" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sm font-bold text-text-secondary">
                  ₹
                </span>
                <input
                  id="sg-target"
                  type="number"
                  placeholder="0.00"
                  disabled={isSaving}
                  {...register('targetAmount', {
                    required: 'Please enter target amount.',
                    min: { value: 0.01, message: 'Target must be greater than 0.' }
                  })}
                  className={`w-full h-11 pl-8 pr-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                    errors.targetAmount ? 'border-expense' : 'border-brand-border'
                  }`}
                />
              </div>
              {errors.targetAmount && (
                <span className="text-xs text-expense font-semibold mt-0.5">{errors.targetAmount.message}</span>
              )}
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sg-deadline" className="text-xs font-bold text-text-main uppercase tracking-wider">
                Deadline (Optional)
              </label>
              <input
                id="sg-deadline"
                type="date"
                disabled={isSaving}
                {...register('deadline')}
                className="w-full h-11 px-4 bg-brand-surface border border-brand-border rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider select-none">Select Icon</span>
            <div className="grid grid-cols-5 gap-3">
              {iconOptions.map((ic) => {
                const DynamicIcon = Icons[ic] || Icons.Shield
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition cursor-pointer select-none ${
                      selectedIcon === ic
                        ? 'border-primary text-primary bg-blue-50/50'
                        : 'border-brand-border text-text-secondary hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <DynamicIcon size={18} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider select-none">Select Color</span>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition cursor-pointer select-none"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && (
                    <span className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
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
                  <span>Saving...</span>
                </>
              ) : (
                goalToEdit ? 'Update Goal' : 'Create Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
