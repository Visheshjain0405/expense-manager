import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Scale, Percent, Inbox, Award } from 'lucide-react'
import reportService from '../services/reportService'

// Custom Subcomponents
import ReportFilters from '../components/reports/ReportFilters'
import ExportMenu from '../components/reports/ExportMenu'
import ReportSkeleton from '../components/reports/ReportSkeleton'

// Reuse charts components from analytics
import IncomeExpenseChart from '../components/analytics/IncomeExpenseChart'
import ExpenseCategoryChart from '../components/analytics/ExpenseCategoryChart'
import SummaryCard from '../components/dashboard/SummaryCard'

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Toast status states
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  // URL search params sync values
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)

  const period = searchParams.get('period') || 'this_month'
  const startDate = searchParams.get('startDate') || defaultStart
  const endDate = searchParams.get('endDate') || defaultEnd

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

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reportService.getReportSummary({ startDate, endDate })
      if (response.success) {
        setData(response)
      } else {
        setError('Unable to compile reports details.')
      }
    } catch (err) {
      console.error('Error compiling reports:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  // Toast auto-dismisses
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

  const formatPercentage = (val) => {
    return val > 0 ? `+${val}%` : `${val}%`
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
            Reports
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Review and export your financial activity.
          </p>
        </div>
        
        {data && (
          <ExportMenu
            startDate={startDate}
            endDate={endDate}
            summaryData={data}
            onSuccess={(msg) => setToastMessage(msg)}
            onFailure={(msg) => setToastError(msg)}
          />
        )}
      </div>

      {/* Filters selectors */}
      <ReportFilters
        period={period}
        startDate={startDate}
        endDate={endDate}
        onChange={handlePeriodChange}
      />

      {loading ? (
        <ReportSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to compile report</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchReportData}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : !data ? (
        <div className="text-center text-xs text-text-secondary">No report data found.</div>
      ) : (
        <div className="space-y-10 animate-fade-in">
          
          {/* Section 1: Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
            <SummaryCard
              title="Total Income"
              value={`₹${(data.summary?.income || 0).toLocaleString('en-IN')}`}
              change=""
              subText="Received during period"
              icon={TrendingUp}
              colorProfile="income"
            />
            <SummaryCard
              title="Total Expenses"
              value={`₹${(data.summary?.expenses || 0).toLocaleString('en-IN')}`}
              change=""
              subText="Spent during period"
              icon={TrendingDown}
              colorProfile="expense"
            />
            <SummaryCard
              title="Net Savings"
              value={`₹${(data.summary?.savings || 0).toLocaleString('en-IN')}`}
              change=""
              subText="Net savings balance"
              icon={Scale}
              colorProfile="balance"
            />
            <SummaryCard
              title="Savings Rate"
              value={`${data.summary?.savingsRate || 0}%`}
              change=""
              subText="Percentage of income saved"
              icon={Percent}
              colorProfile="savingsRate"
            />
          </div>

          {/* Section 2: Trends & Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <IncomeExpenseChart data={data.monthlyTrend} />
            </div>
            <div className="lg:col-span-4">
              <ExpenseCategoryChart data={data.expensesByCategory} />
            </div>
          </div>

          {/* Section 3: Detailed Category Breakdown Table */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
            <div className="select-none">
              <h3 className="font-bold text-text-main text-base">Category Activity</h3>
              <p className="text-xs text-text-secondary mt-0.5">Details of categorized incomes and expenses.</p>
            </div>

            <div className="overflow-x-auto select-none">
              <table className="w-full text-xs font-semibold text-text-secondary">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] text-text-secondary uppercase tracking-wider text-left">
                    <th className="pb-3.5 font-bold">Category</th>
                    <th className="pb-3.5 font-bold">Type</th>
                    <th className="pb-3.5 font-bold text-right">Amount</th>
                    <th className="pb-3.5 font-bold text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.incomeByCategory.map((c) => (
                    <tr key={`inc-${c.id}`} className="hover:bg-slate-50/20">
                      <td className="py-3 text-text-main font-bold">{c.name}</td>
                      <td className="py-3 text-income font-extrabold uppercase">Income</td>
                      <td className="py-3 text-right text-text-main">₹{c.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">{c.percentage}%</td>
                    </tr>
                  ))}
                  {data.expensesByCategory.map((c) => (
                    <tr key={`exp-${c.id}`} className="hover:bg-slate-50/20">
                      <td className="py-3 text-text-main font-bold">{c.name}</td>
                      <td className="py-3 text-expense font-extrabold uppercase">Expense</td>
                      <td className="py-3 text-right text-text-main">₹{c.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">{c.percentage}%</td>
                    </tr>
                  ))}
                  {data.incomeByCategory.length === 0 && data.expensesByCategory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-secondary font-medium">
                        No category activity logged during this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Account Activity Details Table */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
            <div className="select-none">
              <h3 className="font-bold text-text-main text-base">Account Activity</h3>
              <p className="text-xs text-text-secondary mt-0.5">Overview of balance fluctuations per account asset.</p>
            </div>

            <div className="overflow-x-auto select-none">
              <table className="w-full text-xs font-semibold text-text-secondary">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] text-text-secondary uppercase tracking-wider text-left">
                    <th className="pb-3.5 font-bold">Account</th>
                    <th className="pb-3.5 font-bold text-right">Income Activity</th>
                    <th className="pb-3.5 font-bold text-right">Expense Activity</th>
                    <th className="pb-3.5 font-bold text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.accountSummary.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/20">
                      <td className="py-3 text-text-main font-bold">{acc.name}</td>
                      <td className="py-3 text-right text-income font-extrabold">+₹{acc.income.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-expense font-extrabold">-₹{acc.expense.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-text-main">₹{acc.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {data.accountSummary.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-secondary font-medium">
                        No accounts activity registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Budget Performance details */}
          {data.budgetPerformance.length > 0 && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
              <div className="select-none">
                <h3 className="font-bold text-text-main text-base">Budget Performance</h3>
                <p className="text-xs text-text-secondary mt-0.5">Category budgets spent versus planned limit bounds.</p>
              </div>

              <div className="overflow-x-auto select-none">
                <table className="w-full text-xs font-semibold text-text-secondary">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] text-text-secondary uppercase tracking-wider text-left">
                      <th className="pb-3.5 font-bold">Category</th>
                      <th className="pb-3.5 font-bold text-right">Limit</th>
                      <th className="pb-3.5 font-bold text-right">Spent</th>
                      <th className="pb-3.5 font-bold text-right">Remaining</th>
                      <th className="pb-3.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.budgetPerformance.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/20">
                        <td className="py-3 text-text-main font-bold">{b.category}</td>
                        <td className="py-3 text-right text-text-main">₹{b.limit.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-expense">₹{b.spent.toLocaleString('en-IN')}</td>
                        <td className={`py-3 text-right font-bold ${b.remaining < 0 ? 'text-expense font-black' : 'text-text-main'}`}>
                          {b.remaining < 0 ? '-' : ''}₹{Math.abs(b.remaining).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                            b.status === 'Exceeded' 
                              ? 'bg-rose-50 text-expense border border-rose-100' 
                              : b.status === 'Warning' 
                              ? 'bg-amber-50 text-warning border border-amber-100'
                              : 'bg-emerald-50 text-income border border-emerald-100'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 6: Savings Goals Table & Net Worth summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Savings Goals */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4 min-h-[300px]">
              <div className="select-none">
                <h3 className="font-bold text-text-main text-base">Savings Goals</h3>
                <p className="text-xs text-text-secondary mt-0.5">Allocation tracking completion scores.</p>
              </div>

              <div className="space-y-4">
                {data.savingsGoals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-secondary select-none flex flex-col items-center justify-center gap-1.5 h-full">
                    <Inbox size={20} className="text-slate-400" />
                    <span>No active goals defined.</span>
                  </div>
                ) : (
                  data.savingsGoals.map((g) => (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs font-bold select-none">
                        <span className="text-text-main">{g.name}</span>
                        <span className="text-text-secondary">
                          ₹{g.currentAmount.toLocaleString('en-IN')} <span className="font-normal text-[10px]">of ₹{g.targetAmount.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden select-none">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Net Worth */}
            {data.netWorth && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4 min-h-[300px]">
                <div className="select-none">
                  <h3 className="font-bold text-text-main text-base">Net Worth Position</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Summary of overall current net worth assets.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 select-none">
                  <div className="p-4 bg-slate-50 border border-brand-border rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary uppercase">Total Assets</span>
                    <span className="text-base font-extrabold text-text-main">₹{data.netWorth.totalAssets.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-brand-border rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary uppercase">Total Liabilities</span>
                    <span className="text-base font-extrabold text-expense font-black">₹{data.netWorth.totalLiabilities.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-brand-border rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary uppercase">Calculated Net Worth</span>
                    <span className={`text-lg font-black ${data.netWorth.netWorth < 0 ? 'text-expense font-black' : 'text-text-main'}`}>
                      {data.netWorth.netWorth < 0 ? '-' : ''}₹{Math.abs(data.netWorth.netWorth).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Top Expenses list details */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-4">
            <div className="select-none">
              <h3 className="font-bold text-text-main text-base">Top Spending Items</h3>
              <p className="text-xs text-text-secondary mt-0.5">Top 10 highest logged expense transactions.</p>
            </div>

            <div className="overflow-x-auto select-none">
              <table className="w-full text-xs font-semibold text-text-secondary">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] text-text-secondary uppercase tracking-wider text-left">
                    <th className="pb-3.5 font-bold">Description</th>
                    <th className="pb-3.5 font-bold">Category</th>
                    <th className="pb-3.5 font-bold">Account</th>
                    <th className="pb-3.5 font-bold">Date</th>
                    <th className="pb-3.5 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.topExpenses.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/20">
                      <td className="py-3 text-text-main font-bold">{tx.description}</td>
                      <td className="py-3">{tx.category}</td>
                      <td className="py-3">{tx.account}</td>
                      <td className="py-3">{formatDate(tx.date)}</td>
                      <td className="py-3 text-right text-expense font-extrabold">₹{tx.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {data.topExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-text-secondary font-medium">
                        No expense records logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
