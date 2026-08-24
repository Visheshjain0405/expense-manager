import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import categoryService from '../services/categoryService'

// Custom Subcomponents
import CategorySummary from '../components/categories/CategorySummary'
import CategoryGrid from '../components/categories/CategoryGrid'
import CategorySkeleton from '../components/categories/CategorySkeleton'

// Modals
import CategoryModal from '../components/categories/CategoryModal'
import DeleteCategoryModal from '../components/categories/DeleteCategoryModal'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all', 'expense', 'income'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals toggle states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (activeTab !== 'all') {
        params.type = activeTab
      }
      const response = await categoryService.getCategories(params)
      if (response.success) {
        setCategories(response.categories || [])
      } else {
        setError(response.message || 'Unable to retrieve categories.')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Unable to connect to the server. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Toast auto-dismiss triggers
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
    fetchCategories()
  }

  const handleEdit = (cat) => {
    setSelectedCategory(cat)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (cat) => {
    setSelectedCategory(cat)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return
    setIsDeleting(true)
    try {
      const response = await categoryService.deleteCategory(selectedCategory.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Category deleted successfully.')
        setSelectedCategory(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete category.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting category:', err)
      const msg = err.response?.data?.message || 'Unable to delete category. Check connection.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  const handleOpenAddModal = () => {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast Alert Success notification popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toast Alert Failure notification popup */}
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
            Categories
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your income and expense categories.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Add Category
        </button>
      </div>

      {/* Metric Cards Summaries */}
      {!loading && !error && <CategorySummary categories={categories} />}

      {/* Tabs selectors */}
      <div className="flex bg-slate-50 border border-brand-border p-1.5 rounded-xl max-w-sm select-none">
        {['all', 'expense', 'income'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'expense' ? 'Expenses' : 'Income'}
          </button>
        ))}
      </div>

      {/* Loadings / Grids / Empty state maps */}
      {loading ? (
        <CategorySkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load categories</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No categories yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            Create a category to organize your income and expenses.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Category
          </button>
        </div>
      ) : (
        <CategoryGrid
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Modal Controllers */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        categoryToEdit={selectedCategory}
      />

      <DeleteCategoryModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedCategory(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
