import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Percent,
  Wallet,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import * as Icons from 'lucide-react'
import accountService from '../services/accountService'
import analyticsService from '../services/analyticsService'
import netWorthService from '../services/netWorthService'

// Modular Components
import DashboardHeader from '../components/dashboard/DashboardHeader'
import SummaryCard from '../components/dashboard/SummaryCard'
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart'
import ExpenseBreakdown from '../components/dashboard/ExpenseBreakdown'
import DailySpendingChart from '../components/dashboard/DailySpendingChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import UpcomingPayments from '../components/dashboard/UpcomingPayments'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import DashboardSavingsGoals from '../components/dashboard/DashboardSavingsGoals'

// Modals
import AddTransactionModal from '../components/transactions/AddTransactionModal'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toastMessage, setToastMessage] = useState(null)

  // Dynamic accounts and metrics
  const [accounts, setAccounts] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [overview, setOverview] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    savingsRate: 0,
    incomeChangePercent: 0,
    expenseChangePercent: 0
  })
  const [netWorthOverview, setNetWorthOverview] = useState(null)

  // Fetch accounts and live analytics overview
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accRes, overviewRes, netWorthRes] = await Promise.all([
          accountService.getAccounts(),
          analyticsService.getOverview(),
          netWorthService.getNetWorthOverview()
        ])

        if (accRes.success) {
          setAccounts(accRes.accounts || [])
          const total = accRes.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
          setTotalBalance(total)
        }

        if (overviewRes.success) {
          setOverview(overviewRes.overview || {})
        }

        if (netWorthRes.success) {
          setNetWorthOverview(netWorthRes.overview || null)
        }
      } catch (err) {
        console.error('Error fetching dashboard datasets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [refreshTrigger])

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleTransactionSaved = (message) => {
    setToastMessage(message)
    setRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const formatPercentageChange = (val) => {
    if (val === 0) return ''
    return val > 0 ? `+${val}%` : `${val}%`
  }

  return (
    <div className="space-y-8 animate-fade-in text-left relative">
      {/* Success Toast Alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-slide-in-up">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Greeting & Actions */}
      <DashboardHeader onOpenModal={() => setIsModalOpen(true)} />

      {/* Banners Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-fade-in text-left">
        {/* Net Worth Banner */}
        {netWorthOverview && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Net Worth Overview</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <h3 className={`text-xl font-extrabold tracking-tight ${netWorthOverview.netWorth < 0 ? 'text-expense font-black' : 'text-text-main'}`}>
                  {netWorthOverview.netWorth < 0 ? '-' : ''}₹{Math.abs(netWorthOverview.netWorth).toLocaleString('en-IN')}
                </h3>
                {netWorthOverview.changePercentage !== 0 && (
                  <span className={`text-xs font-bold ${netWorthOverview.changePercentage > 0 ? 'text-income' : 'text-expense'}`}>
                    {netWorthOverview.changePercentage > 0 ? '↑' : '↓'} {Math.abs(netWorthOverview.changePercentage)}% this month
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/net-worth"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
            >
              View Net Worth
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Reports Banner */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Reports & Export</span>
            <p className="text-sm font-bold text-text-main mt-1">Generate CSV, Excel, or PDF statements.</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition flex-shrink-0"
          >
            View financial reports
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Four Summary Metrics Cards (Bound to live database analytics APIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Income"
          value={`₹${overview.totalIncome.toLocaleString('en-IN')}`}
          change={formatPercentageChange(overview.incomeChangePercent)}
          subText="vs previous period"
          icon={TrendingUp}
          colorProfile="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={`₹${overview.totalExpenses.toLocaleString('en-IN')}`}
          change={formatPercentageChange(overview.expenseChangePercent)}
          subText="vs previous period"
          icon={TrendingDown}
          colorProfile="expense"
        />
        <SummaryCard
          title="Total Balance"
          value={`₹${totalBalance.toLocaleString('en-IN')}`}
          change=""
          subText="Dynamic balance across all accounts"
          icon={Scale}
          colorProfile="balance"
        />
        <SummaryCard
          title="Savings Rate"
          value={`${overview.savingsRate}%`}
          change=""
          subText="Proportion of savings from income"
          icon={Percent}
          colorProfile="savingsRate"
        />
      </div>

      {/* 3. Main Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-4">
          <ExpenseBreakdown />
        </div>
      </div>

      {/* 4. Secondary Row: Daily Spending + Insights + Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DailySpendingChart />
        <UpcomingPayments />
        <BudgetOverview />
      </div>

      {/* 5. Bottom Row: Recent Transaction logs & Accounts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Transactions List (Left Span) */}
        <div className="lg:col-span-8">
          <RecentTransactions 
            refreshTrigger={refreshTrigger} 
            onOpenModal={() => setIsModalOpen(true)}
          />
        </div>

        {/* Dynamic Accounts Overview widget (Right Span) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <h3 className="font-bold text-text-main text-base flex items-center gap-2 select-none">
                <Wallet size={18} className="text-primary" />
                Accounts Overview
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 select-none">
                Your current account assets.
              </p>
            </div>

            <div className="space-y-4 my-auto py-4">
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-secondary">
                  No accounts found.
                </div>
              ) : (
                accounts.slice(0, 4).map((acc) => {
                  const IconComponent = Icons[acc.icon] || Icons.Landmark
                  const isNegative = acc.currentBalance < 0
                  return (
                    <Link
                      key={acc.id}
                      to={`/accounts/${acc.id}`}
                      className="flex justify-between items-center py-2 px-2.5 border border-transparent hover:border-brand-border hover:bg-slate-50/50 rounded-xl transition text-sm font-semibold group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="p-1.5 rounded-lg border flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${acc.color}15`, 
                            borderColor: `${acc.color}30`, 
                            color: acc.color 
                          }}
                        >
                          <IconComponent size={14} />
                        </div>
                        <span className="text-text-main truncate group-hover/item:text-primary transition">{acc.name}</span>
                      </div>
                      <span className={isNegative ? 'text-expense font-bold' : 'text-text-main font-bold'}>
                        {isNegative ? '-' : ''}₹{Math.abs(acc.currentBalance).toLocaleString('en-IN')}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>

            <Link
              to="/accounts"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 justify-center transition border-t border-brand-border pt-3.5 select-none"
            >
              Manage Accounts
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Savings Goals Preview */}
      <DashboardSavingsGoals />

      {/* Reusable Form Modal Context */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionSaved}
      />
    </div>
  )
}
