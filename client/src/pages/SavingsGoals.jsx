import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import savingsGoalService from '../services/savingsGoalService'

// Custom Subcomponents
import GoalSummary from '../components/savings-goals/GoalSummary'
import GoalGrid from '../components/savings-goals/GoalGrid'
import GoalSkeleton from '../components/savings-goals/GoalSkeleton'

// Modals
import GoalModal from '../components/savings-goals/GoalModal'
import ContributionModal from '../components/savings-goals/ContributionModal'
import DeleteGoalModal from '../components/savings-goals/DeleteGoalModal'

export default function SavingsGoals() {
  const [goals, setGoals] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isContribOpen, setIsContribOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Selected item state
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchGoalsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [goalsRes, summaryRes] = await Promise.all([
        savingsGoalService.getGoals(),
        savingsGoalService.getGoalSummary()
      ])

      if (goalsRes.success && summaryRes.success) {
        setGoals(goalsRes.goals || [])
        setSummary(summaryRes.summary || {})
      } else {
        setError('Unable to load savings goals.')
      }
    } catch (err) {
      console.error('Error fetching savings goals data:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoalsData()
  }, [fetchGoalsData])

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
    fetchGoalsData()
  }

  const handleEdit = (goal) => {
    setSelectedGoal(goal)
    setIsModalOpen(true)
  }

  const handleAddMoney = (goal) => {
    setSelectedGoal(goal)
    setIsContribOpen(true)
  }

  const handleDeletePrompt = (goal) => {
    setSelectedGoal(goal)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedGoal) return
    setIsDeleting(true)
    try {
      const response = await savingsGoalService.deleteGoal(selectedGoal.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Savings goal and contribution history deleted.')
        setSelectedGoal(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete goal.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting goal:', err)
      const msg = err.response?.data?.message || 'Unable to delete goal.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  // Goal status controls pause/resume/reopen
  const handlePause = async (id) => {
    try {
      const response = await savingsGoalService.pauseGoal(id)
      if (response.success) {
        handleSuccess('Goal paused.')
      }
    } catch (err) {
      console.error('Error pausing goal:', err)
      setToastError('Unable to pause goal.')
    }
  }

  const handleResume = async (id) => {
    try {
      const response = await savingsGoalService.resumeGoal(id)
      if (response.success) {
        handleSuccess('Goal resumed.')
      }
    } catch (err) {
      console.error('Error resuming goal:', err)
      setToastError('Unable to resume goal.')
    }
  }

  const handleOpenAddModal = () => {
    setSelectedGoal(null)
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
            Savings Goals
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Turn your plans into measurable progress.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Create Goal
        </button>
      </div>

      {loading ? (
        <GoalSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load savings goals</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchGoalsData}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
          <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No savings goals yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mb-8 mx-auto leading-relaxed">
            Create a goal for something you want to achieve and track your progress.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
          >
            <PlusCircle size={16} />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Metric row */}
          <GoalSummary summary={summary} />

          {/* Goal cards grid list */}
          <GoalGrid
            goals={goals}
            onEdit={handleEdit}
            onDelete={handleDeletePrompt}
            onPause={handlePause}
            onResume={handleResume}
            onAddMoney={handleAddMoney}
          />
        </div>
      )}

      {/* Modals controls */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        goalToEdit={selectedGoal}
      />

      <ContributionModal
        isOpen={isContribOpen}
        onClose={() => setIsContribOpen(false)}
        onSuccess={handleSuccess}
        goal={selectedGoal}
      />

      <DeleteGoalModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedGoal(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
