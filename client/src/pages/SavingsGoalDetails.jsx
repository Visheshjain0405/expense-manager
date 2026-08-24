import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import savingsGoalService from '../services/savingsGoalService'

// Custom Subcomponents
import GoalProgress from '../components/savings-goals/GoalProgress'
import GoalProjection from '../components/savings-goals/GoalProjection'
import ContributionHistory from '../components/savings-goals/ContributionHistory'
import GoalSkeleton from '../components/savings-goals/GoalSkeleton'

// Modals
import ContributionModal from '../components/savings-goals/ContributionModal'

export default function SavingsGoalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [goal, setGoal] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isContribOpen, setIsContribOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)
  const [isActionSaving, setIsActionSaving] = useState(false)

  const fetchGoalDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [goalRes, contribsRes] = await Promise.all([
        savingsGoalService.getGoalById(id),
        savingsGoalService.getContributions(id)
      ])

      if (goalRes.success && contribsRes.success) {
        setGoal(goalRes.goal || null)
        setContributions(contribsRes.contributions || [])
      } else {
        setError('Savings goal details not found.')
      }
    } catch (err) {
      console.error('Error fetching goal details:', err)
      setError('Unable to retrieve savings goal. Connection error.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGoalDetails()
  }, [fetchGoalDetails])

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
    fetchGoalDetails()
  }

  const handleDeleteContribution = async (contributionId) => {
    try {
      const response = await savingsGoalService.deleteContribution(id, contributionId)
      if (response.success) {
        handleSuccess('Contribution removed successfully.')
      }
    } catch (err) {
      console.error('Error deleting contribution:', err)
      setToastError('Unable to delete contribution.')
    }
  }

  const handleReopen = async () => {
    setIsActionSaving(true)
    try {
      const response = await savingsGoalService.reopenGoal(id)
      if (response.success) {
        handleSuccess('Savings goal reopened.')
      }
    } catch (err) {
      console.error('Error reopening goal:', err)
      setToastError('Unable to reopen goal.')
    } finally {
      setIsActionSaving(false)
    }
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

      {/* Header back options navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div className="flex items-center gap-4">
          <Link
            to="/savings-goals"
            className="p-2 border border-brand-border hover:border-slate-350 hover:bg-slate-50 text-text-secondary hover:text-text-main rounded-xl transition cursor-pointer"
            aria-label="Back to savings goals"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Goal Details
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Overview details, forecast estimations and logs history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {goal?.status === 'completed' && (
            <button
              onClick={handleReopen}
              disabled={isActionSaving}
              className="px-5 py-2.5 bg-white border border-brand-border text-text-main hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Reopen Goal
            </button>
          )}
          {goal?.status === 'active' && (
            <button
              onClick={() => setIsContribOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
            >
              <PlusCircle size={16} />
              Add Money
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <GoalSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load details</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchGoalDetails}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Progress Overview vs Forecast projections side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GoalProgress goal={goal} />
            <GoalProjection goal={goal} />
          </div>

          {/* Contributions logs history */}
          <ContributionHistory
            contributions={contributions}
            onDelete={handleDeleteContribution}
          />
        </div>
      )}

      {/* Contribution Modal popup */}
      <ContributionModal
        isOpen={isContribOpen}
        onClose={() => setIsContribOpen(false)}
        onSuccess={handleSuccess}
        goal={goal}
      />
    </div>
  )
}
