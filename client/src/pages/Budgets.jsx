import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import budgetService from '../services/budgetService'

// Custom Subcomponents
import BudgetSummary from '../components/budgets/BudgetSummary'
import BudgetGrid from '../components/budgets/BudgetGrid'
import BudgetInsights from '../components/budgets/BudgetInsights'
import BudgetSkeleton from '../components/budgets/BudgetSkeleton'

// Modals
import BudgetModal from '../components/budgets/BudgetModal'
import DeleteBudgetModal from '../components/budgets/DeleteBudgetModal'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchBudgetsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getBudgetSummary()
      ])

      if (budgetsRes.success && summaryRes.success) {
        setBudgets(budgetsRes.budgets || [])
        setSummary(summaryRes.summary || {})
      } else {
        setError('Unable to load budgets details.')
      }
    } catch (err) {
      console.error('Error fetching budgets data:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgetsData()
  }, [fetchBudgetsData])

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
    fetchBudgetsData()
  }

  const handleEdit = (b) => {
    setSelectedBudget(b)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (b) => {
    setSelectedBudget(b)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBudget) return
    setIsDeleting(true)
    try {
      const response = await budgetService.deleteBudget(selectedBudget.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Budget deleted successfully.')
        setSelectedBudget(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete budget.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting budget:', err)
      const msg = err.response?.data?.message || 'Unable to delete budget. Check connection.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  const handleOpenAddModal = () => {
    setSelectedBudget(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Toast Alert Success */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toast Alert Failure */}
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
            Budgets
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Plan your spending and stay on track.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Create Budget
        </button>
      </div>

      {loading ? (
        <BudgetSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load budgets</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchBudgetsData}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No budgets yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            Create your first monthly budget to start tracking your spending.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary metrics */}
          <BudgetSummary summary={summary} />

          {/* Grids and insights cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <BudgetGrid
                budgets={budgets}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
              />
            </div>
            
            <div className="lg:col-span-4">
              <BudgetInsights budgets={budgets} summary={summary} />
            </div>
          </div>
        </div>
      )}

      {/* Modals controls */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        budgetToEdit={selectedBudget}
      />

      <DeleteBudgetModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedBudget(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
