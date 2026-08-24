import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Inbox } from 'lucide-react'
import savingsGoalService from '../../services/savingsGoalService'

export default function DashboardSavingsGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await savingsGoalService.getGoals()
        if (response.success) {
          const activeList = (response.goals || []).filter((g) => g.status === 'active')
          setGoals(activeList.slice(0, 3))
        }
      } catch (err) {
        console.error('Error fetching dashboard goals:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left select-none animate-fade-in">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-text-main text-base flex items-center gap-2">
            <Target size={18} className="text-primary" />
            Savings Goals
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Your active savings targets.</p>
        </div>
        <Link
          to="/savings-goals"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
        >
          View all goals
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse pointer-events-none">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-slate-50 border border-brand-border rounded-xl p-4 h-24 flex flex-col justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-secondary flex flex-col items-center justify-center gap-1.5 border border-brand-border border-dashed rounded-xl">
          <Inbox size={20} className="text-slate-400" />
          <span>No active savings goals.</span>
          <Link to="/savings-goals" className="text-primary font-bold hover:underline">
            Create Goal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              to={`/savings-goals/${goal.id}`}
              className="bg-slate-50 hover:bg-slate-100/50 border border-brand-border hover:border-slate-200 rounded-xl p-4 flex flex-col justify-between h-24 transition duration-150 group"
            >
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-sm font-bold text-text-main group-hover:text-primary truncate transition">
                  {goal.name}
                </span>
                <span className="text-xs font-extrabold text-primary flex-shrink-0">
                  {goal.progressPercentage}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: goal.color,
                      width: `${Math.min(100, goal.progressPercentage)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                  <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                  <span>of ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
