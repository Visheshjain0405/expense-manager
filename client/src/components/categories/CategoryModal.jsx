import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import * as Icons from 'lucide-react'
import categoryService from '../../services/categoryService'

const allowedIcons = [
  'FolderOpen',
  'Utensils',
  'Car',
  'ShoppingBag',
  'Briefcase',
  'Laptop',
  'Home',
  'Zap',
  'Wifi',
  'Phone',
  'Tv',
  'Heart',
  'BookOpen',
  'Users',
  'CreditCard',
  'Shield',
  'TrendingUp',
  'Coins',
  'Tag',
  'Undo',
  'Store',
  'Dumbbell',
  'PlayCircle'
]

const colorPalette = [
  { label: 'Blue', hex: '#3B82F6', bg: 'bg-blue-500' },
  { label: 'Green', hex: '#10B981', bg: 'bg-emerald-500' },
  { label: 'Amber', hex: '#F59E0B', bg: 'bg-amber-500' },
  { label: 'Red', hex: '#EF4444', bg: 'bg-red-500' },
  { label: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500' },
  { label: 'Slate', hex: '#64748B', bg: 'bg-slate-500' }
]

export default function CategoryModal({ isOpen, onClose, onSuccess, categoryToEdit = null }) {
  const [type, setType] = useState('expense')
  const [selectedIcon, setSelectedIcon] = useState('FolderOpen')
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: ''
    }
  })

  // Prefill when editing
  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setType(categoryToEdit.type)
        setSelectedIcon(categoryToEdit.icon || 'FolderOpen')
        setSelectedColor(categoryToEdit.color || '#3B82F6')
        reset({
          name: categoryToEdit.name
        })
      } else {
        setType('expense')
        setSelectedIcon('FolderOpen')
        setSelectedColor('#3B82F6')
        reset({
          name: ''
        })
      }
    }
  }, [isOpen, categoryToEdit, reset])

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsSaving(true)
    setApiError(null)

    const payload = {
      name: data.name,
      type,
      icon: selectedIcon,
      color: selectedColor
    }

    try {
      let response
      if (categoryToEdit) {
        response = await categoryService.updateCategory(categoryToEdit.id, payload)
      } else {
        response = await categoryService.createCategory(payload)
      }

      if (response.success) {
        setIsSaving(false)
        reset()
        onSuccess(
          categoryToEdit
            ? 'Category updated successfully.'
            : 'Category created successfully.'
        )
        onClose()
      } else {
        setIsSaving(false)
        setApiError(response.message || 'Unable to save category.')
      }
    } catch (err) {
      setIsSaving(false)
      console.error('Error saving category:', err)
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
              {categoryToEdit ? 'Edit Category' : 'Add Category'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage your spending and earnings category tags.
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

          {/* Category Type Tab selectors */}
          <div className="flex bg-slate-50 border border-brand-border p-1 rounded-xl select-none">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Income
            </button>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-name" className="text-xs font-bold text-text-main uppercase tracking-wider">
              Category Name
            </label>
            <input
              id="cat-name"
              type="text"
              placeholder="e.g. Gym, Subscriptions, Rent"
              disabled={isSaving}
              {...register('name', { required: 'Please enter a category name.' })}
              className={`w-full h-11 px-4 bg-brand-surface border rounded-xl text-sm font-semibold text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition ${
                errors.name ? 'border-expense' : 'border-brand-border'
              }`}
            />
            {errors.name && (
              <span className="text-xs text-expense font-semibold mt-0.5">{errors.name.message}</span>
            )}
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-1.5 select-none">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">
              Color Accent
            </span>
            <div className="flex gap-3 pt-1">
              {colorPalette.map((color) => {
                const isActive = selectedColor === color.hex
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                      isActive 
                        ? 'ring-2 ring-primary border-white scale-110' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.label}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="flex flex-col gap-1.5 select-none">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">
              Icon Selector
            </span>
            <div className="grid grid-cols-6 gap-2 bg-slate-50/50 border border-brand-border p-3.5 rounded-xl max-h-[160px] overflow-y-auto">
              {allowedIcons.map((iconName) => {
                const IconComponent = Icons[iconName] || Icons.FolderOpen
                const isActive = selectedIcon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2.5 rounded-lg border flex items-center justify-center cursor-pointer transition ${
                      isActive
                        ? 'bg-white border-primary text-primary shadow-xs scale-105'
                        : 'bg-brand-surface border-brand-border text-text-secondary hover:text-text-main hover:bg-slate-50'
                    }`}
                    aria-label={`Select icon ${iconName}`}
                  >
                    <IconComponent size={16} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-brand-border select-none">
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
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.15)] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{categoryToEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                categoryToEdit ? 'Update Category' : 'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
