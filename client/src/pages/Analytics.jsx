import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import analyticsService from '../services/analyticsService'
import budgetService from '../services/budgetService'
import netWorthService from '../services/netWorthService'
import savingsGoalService from '../services/savingsGoalService'
import NetWorthChart from '../components/net-worth/NetWorthChart'

// Custom Subcomponents
import AnalyticsHeader from '../components/analytics/AnalyticsHeader'
import AnalyticsSummary from '../components/analytics/AnalyticsSummary'
import IncomeExpenseChart from '../components/analytics/IncomeExpenseChart'
import ExpenseCategoryChart from '../components/analytics/ExpenseCategoryChart'
import CategoryRanking from '../components/analytics/CategoryRanking'
import DailySpendingChart from '../components/analytics/DailySpendingChart'
import AccountDistribution from '../components/analytics/AccountDistribution'
import TopExpenses from '../components/analytics/TopExpenses'
import FinancialInsights from '../components/analytics/FinancialInsights'
import AnalyticsSkeleton from '../components/analytics/AnalyticsSkeleton'

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API datasets
  const [overview, setOverview] = useState({})
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [accountData, setAccountData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [topExpenses, setTopExpenses] = useState([])
  const [insights, setInsights] = useState([])
  const [budgetSummary, setBudgetSummary] = useState(null)
  const [netWorthHistory, setNetWorthHistory] = useState([])
  const [goalsSummary, setGoalsSummary] = useState(null)

  // Parse state parameters from URL search parameter context
  const period = searchParams.get('period') || 'this_month'
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  // Sync date selection presets
  const handlePeriodChange = useCallback((newFilter) => {
    const params = {}
    Object.keys(newFilter).forEach((key) => {
      const val = newFilter[key]
      if (val !== undefined && val !== null && val !== '') {
        params[key] = String(val)
      }
    })
    setSearchParams(params)
  }, [setSearchParams])

  // Primary parallel API loading engine
  const fetchAnalyticsDataset = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = {}
      if (startDate) queryParams.startDate = startDate
      if (endDate) queryParams.endDate = endDate

      // Run parallel endpoints fetching via Promise.all
      const [
        resOverview,
        resMonthly,
        resCategories,
        resAccounts,
        resDaily,
        resTopExpenses,
        resInsights,
        resBudgetSummary
      ] = await Promise.all([
        analyticsService.getOverview(queryParams),
        analyticsService.getMonthlyAnalytics({
          startDate: queryParams.startDate,
          endDate: queryParams.endDate
        }),
        analyticsService.getCategoryAnalytics(queryParams),
        analyticsService.getAccountAnalytics(queryParams),
        analyticsService.getDailyAnalytics(queryParams),
        analyticsService.getTopExpenses({ ...queryParams, limit: 10 }),
        analyticsService.getInsights(queryParams),
        budgetService.getBudgetSummary(),
        netWorthService.getNetWorthHistory(),
        savingsGoalService.getGoalSummary()
      ])

      // Set state matching successful query operations
      if (resOverview.success) setOverview(resOverview.overview)
      if (resMonthly.success) setMonthlyData(resMonthly.data)
      if (resCategories.success) setCategoryData(resCategories.categories)
      if (resAccounts.success) setAccountData(resAccounts.accounts)
      if (resDaily.success) setDailyData(resDaily.data)
      if (resTopExpenses.success) setTopExpenses(resTopExpenses.expenses)
      if (resInsights.success) setInsights(resInsights.insights)
      if (resBudgetSummary.success) setBudgetSummary(resBudgetSummary.summary)
      if (resNetWorthHistory.success) setNetWorthHistory(resNetWorthHistory.history || [])
      if (resGoalsSummary.success) setGoalsSummary(resGoalsSummary.summary || null)

    } catch (err) {
      console.error('Error fetching dynamic analytics datasets:', err)
      setError('Unable to load analytics details. Please check server connections.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchAnalyticsDataset()
  }, [fetchAnalyticsDataset])

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Date Header Filter Controls */}
      <AnalyticsHeader
        period={period}
        startDate={startDate}
        endDate={endDate}
        onChange={handlePeriodChange}
      />

      {loading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load analytics</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchAnalyticsDataset}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary metrics row */}
          <AnalyticsSummary overview={overview} />

          {/* Core Income Expense area trends vs Categories Pie Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <IncomeExpenseChart data={monthlyData} />
            </div>
            <div className="lg:col-span-4">
              <ExpenseCategoryChart data={categoryData} />
            </div>
          </div>

          {/* Ranked categories spend progress indicators vs Daily spending bar trends */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <CategoryRanking data={categoryData} />
            </div>
            <div className="lg:col-span-8">
              <DailySpendingChart data={dailyData} />
            </div>
          </div>

          {/* Horizontal asset account distribution vs Top spending vs Insights list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AccountDistribution data={accountData} />
            <TopExpenses expenses={topExpenses} />
            <FinancialInsights insights={insights} />
          </div>

          {/* Budget Performance Overview */}
          {budgetSummary && budgetSummary.totalBudget > 0 && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
              <div className="select-none">
                <h3 className="font-bold text-text-main text-base">Budget Performance</h3>
                <p className="text-xs text-text-secondary mt-0.5">Overall monthly budget utilization comparison.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Total Budget Limit</span>
                  <p className="text-lg font-black text-text-main mt-1">₹{budgetSummary.totalBudget.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Actual Spent</span>
                  <p className="text-lg font-black text-text-main mt-1">₹{budgetSummary.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Remaining</span>
                  <p className={`text-lg font-black mt-1 ${budgetSummary.totalRemaining < 0 ? 'text-expense font-black' : 'text-text-main'}`}>
                    {budgetSummary.totalRemaining < 0 ? '-' : ''}₹{Math.abs(budgetSummary.totalRemaining).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              {/* Progress track bar */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Usage Rate</span>
                  <span>{budgetSummary.overallPercentageUsed}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      budgetSummary.overallPercentageUsed >= 100
                        ? 'bg-expense'
                        : budgetSummary.overallPercentageUsed >= 80
                        ? 'bg-warning'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, budgetSummary.overallPercentageUsed)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Net Worth Trend Row */}
          {netWorthHistory.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              <NetWorthChart data={netWorthHistory} />
            </div>
          )}

          {/* Savings Goals Summary Panel */}
          {goalsSummary && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
              <div className="select-none">
                <h3 className="font-bold text-text-main text-base">Savings Goals Performance</h3>
                <p className="text-xs text-text-secondary mt-0.5">Overall savings goals tracking and target allocations.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Active Goals</span>
                  <p className="text-lg font-black text-text-main mt-1">{goalsSummary.activeGoals} active</p>
                </div>
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Total Goal Target</span>
                  <p className="text-lg font-black text-text-main mt-1">₹{goalsSummary.totalTargetAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Total Saved</span>
                  <p className="text-lg font-black text-income mt-1">₹{goalsSummary.totalSavedAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              {/* Overall Progress Progress Track */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Overall Goals Progress</span>
                  <span>{goalsSummary.overallProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, goalsSummary.overallProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
