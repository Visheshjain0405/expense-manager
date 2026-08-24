import React, { useState } from 'react'
import { ChevronDown, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import reportService from '../../services/reportService'

export default function ExportMenu({ startDate, endDate, summaryData = {}, onSuccess, onFailure }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const getPeriodLabel = () => {
    return `${startDate}-to-${endDate}`
  }

  // 1. CSV Transaction Exporter
  const handleExportCSV = async () => {
    setDropdownOpen(false)
    setIsExporting(true)
    try {
      const res = await reportService.exportTransactions({ startDate, endDate })
      if (res.success && res.transactions) {
        let csvContent = 'Date,Type,Description,Category,Account,Amount,Notes\n'
        res.transactions.forEach((t) => {
          const desc = t.description.replace(/"/g, '""')
          const cat = t.category.replace(/"/g, '""')
          const acc = t.account.replace(/"/g, '""')
          const notes = (t.notes || '').replace(/"/g, '""')
          csvContent += `"${t.date}","${t.type}","${desc}","${cat}","${acc}",${t.amount},"${notes}"\n`
        })

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `financial-report-${getPeriodLabel()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        onSuccess('Report CSV generated successfully.')
      } else {
        onFailure('Unable to generate CSV report.')
      }
    } catch (err) {
      console.error(err)
      onFailure('Unable to generate CSV report.')
    } finally {
      setIsExporting(false)
    }
  }

  // 2. Excel Exporter (Using separate sheets: Summary, Transactions, Categories, Accounts, Budgets, Goals, Net Worth)
  const handleExportExcel = async () => {
    setDropdownOpen(false)
    setIsExporting(true)
    try {
      const res = await reportService.exportTransactions({ startDate, endDate })
      if (!res.success) {
        onFailure('Unable to generate Excel report.')
        setIsExporting(false)
        return
      }

      const wb = XLSX.utils.book_new()

      // Sheet 1: Summary Sheet
      const summaryRows = [
        ['PERSONAL FINANCIAL REPORT'],
        [],
        ['Report Period:', `${startDate} to ${endDate}`],
        [],
        ['Financial Metric', 'Value'],
        ['Total Income', `₹${(summaryData.summary?.income || 0).toLocaleString('en-IN')}`],
        ['Total Expenses', `₹${(summaryData.summary?.expenses || 0).toLocaleString('en-IN')}`],
        ['Net Savings', `₹${(summaryData.summary?.savings || 0).toLocaleString('en-IN')}`],
        ['Savings Rate', `${summaryData.summary?.savingsRate || 0}%`],
        [],
        ['Net Worth Overview'],
        ['Total Assets', `₹${(summaryData.netWorth?.totalAssets || 0).toLocaleString('en-IN')}`],
        ['Total Liabilities', `₹${(summaryData.netWorth?.totalLiabilities || 0).toLocaleString('en-IN')}`],
        ['Net Worth', `₹${(summaryData.netWorth?.netWorth || 0).toLocaleString('en-IN')}`],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

      // Sheet 2: Transactions
      const txRows = [
        ['Date', 'Type', 'Description', 'Category', 'Account', 'Amount', 'Notes'],
        ...res.transactions.map((t) => [t.date, t.type, t.description, t.category, t.account, t.amount, t.notes])
      ]
      const wsTx = XLSX.utils.aoa_to_sheet(txRows)
      XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions')

      // Sheet 3: Category Breakdowns
      const catRows = [
        ['Category Type', 'Category Name', 'Amount', 'Percentage'],
        ...(summaryData.incomeByCategory || []).map((c) => ['Income', c.name, c.amount, `${c.percentage}%`]),
        ...(summaryData.expensesByCategory || []).map((c) => ['Expense', c.name, c.amount, `${c.percentage}%`])
      ]
      const wsCat = XLSX.utils.aoa_to_sheet(catRows)
      XLSX.utils.book_append_sheet(wb, wsCat, 'Categories')

      // Sheet 4: Account Activity
      const accRows = [
        ['Account Name', 'Income during period', 'Expense during period', 'Current Balance'],
        ...(summaryData.accountSummary || []).map((a) => [a.name, a.income, a.expense, a.balance])
      ]
      const wsAcc = XLSX.utils.aoa_to_sheet(accRows)
      XLSX.utils.book_append_sheet(wb, wsAcc, 'Accounts')

      // Sheet 5: Budgets
      const budgetRows = [
        ['Category', 'Limit', 'Spent', 'Remaining', 'Status'],
        ...(summaryData.budgetPerformance || []).map((b) => [b.category, b.limit, b.spent, b.remaining, b.status])
      ]
      const wsBudget = XLSX.utils.aoa_to_sheet(budgetRows)
      XLSX.utils.book_append_sheet(wb, wsBudget, 'Budgets')

      // Sheet 6: Savings Goals
      const goalRows = [
        ['Goal Name', 'Target Amount', 'Current Saved', 'Remaining', 'Progress', 'Status'],
        ...(summaryData.savingsGoals || []).map((g) => [g.name, g.targetAmount, g.currentAmount, g.remainingAmount, `${g.progressPercentage}%`, g.status])
      ]
      const wsGoals = XLSX.utils.aoa_to_sheet(goalRows)
      XLSX.utils.book_append_sheet(wb, wsGoals, 'Savings Goals')

      XLSX.writeFile(wb, `financial-report-${getPeriodLabel()}.xlsx`)
      onSuccess('Report Excel generated successfully.')
    } catch (err) {
      console.error(err)
      onFailure('Unable to generate Excel report.')
    } finally {
      setIsExporting(false)
    }
  }

  // 3. PDF Exporter
  const handleExportPDF = () => {
    setDropdownOpen(false)
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Document Styling presets
      doc.setFont('Helvetica', 'normal')

      // Title & Header details
      doc.setFontSize(22)
      doc.setTextColor(15, 23, 42)
      doc.text('PERSONAL FINANCIAL REPORT', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 28)
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 34)

      // Section 1: Financial Summary Cards table layout
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42)
      doc.text('Financial Summary', 14, 46)

      const summaryTableData = [
        ['Income', `INR ${summaryData.summary?.income.toLocaleString('en-IN')}`],
        ['Expenses', `INR ${summaryData.summary?.expenses.toLocaleString('en-IN')}`],
        ['Savings', `INR ${summaryData.summary?.savings.toLocaleString('en-IN')}`],
        ['Savings Rate', `${summaryData.summary?.savingsRate}%`]
      ]
      doc.autoTable({
        startY: 52,
        head: [['Metric', 'Value']],
        body: summaryTableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      })

      // Section 2: Expense Breakdown
      const lastY = doc.previousAutoTable.finalY + 12
      doc.text('Expense Breakdown', 14, lastY)

      const expenseBody = (summaryData.expensesByCategory || []).map((c) => [
        c.name,
        `INR ${c.amount.toLocaleString('en-IN')}`,
        `${c.percentage}%`
      ])

      doc.autoTable({
        startY: lastY + 6,
        head: [['Category', 'Amount', 'Percentage']],
        body: expenseBody,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] }
      })

      // New Page for Account activity & Budgets
      doc.addPage()
      
      // Page numbers footer helper
      doc.setFontSize(14)
      doc.text('Account Activity', 14, 20)

      const accountBody = (summaryData.accountSummary || []).map((a) => [
        a.name,
        `INR ${a.income.toLocaleString('en-IN')}`,
        `INR ${a.expense.toLocaleString('en-IN')}`,
        `INR ${a.balance.toLocaleString('en-IN')}`
      ])

      doc.autoTable({
        startY: 26,
        head: [['Account', 'Income during period', 'Expense during period', 'Current Balance']],
        body: accountBody,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
      })

      // Budgets Performance
      const budgetY = doc.previousAutoTable.finalY + 12
      doc.text('Budget Performance', 14, budgetY)

      const budgetBody = (summaryData.budgetPerformance || []).map((b) => [
        b.category,
        `INR ${b.limit.toLocaleString('en-IN')}`,
        `INR ${b.spent.toLocaleString('en-IN')}`,
        `INR ${b.remaining.toLocaleString('en-IN')}`,
        b.status
      ])

      doc.autoTable({
        startY: budgetY + 6,
        head: [['Category', 'Limit', 'Spent', 'Remaining', 'Status']],
        body: budgetBody,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      })

      // New Page for Savings Goals and Net Worth
      doc.addPage()
      doc.text('Savings Goals', 14, 20)

      const goalBody = (summaryData.savingsGoals || []).map((g) => [
        g.name,
        `INR ${g.targetAmount.toLocaleString('en-IN')}`,
        `INR ${g.currentAmount.toLocaleString('en-IN')}`,
        `INR ${g.remainingAmount.toLocaleString('en-IN')}`,
        `${g.progressPercentage}%`,
        g.status
      ])

      doc.autoTable({
        startY: 26,
        head: [['Goal Name', 'Target Amount', 'Current Saved', 'Remaining', 'Progress', 'Status']],
        body: goalBody,
        theme: 'striped',
        headStyles: { fillColor: [20, 184, 166] }
      })

      // Net Worth Summary
      const nwY = doc.previousAutoTable.finalY + 12
      doc.text('Net Worth Overview', 14, nwY)

      const nwBody = [
        ['Total Assets', `INR ${(summaryData.netWorth?.totalAssets || 0).toLocaleString('en-IN')}`],
        ['Total Liabilities', `INR ${(summaryData.netWorth?.totalLiabilities || 0).toLocaleString('en-IN')}`],
        ['Net Worth', `INR ${(summaryData.netWorth?.netWorth || 0).toLocaleString('en-IN')}`]
      ]

      doc.autoTable({
        startY: nwY + 6,
        head: [['Classification', 'Amount']],
        body: nwBody,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
      })

      // Page numbers printing
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, 100, 285, { align: 'center' })
      }

      doc.save(`financial-report-${getPeriodLabel()}.pdf`)
      onSuccess('Report PDF generated successfully.')
    } catch (err) {
      console.error(err)
      onFailure('Unable to generate PDF report.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative text-left select-none">
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        disabled={isExporting}
        className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer disabled:opacity-55"
      >
        {isExporting ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>Export</span>
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in">
            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-2.5 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
            >
              <FileText size={14} className="text-text-secondary" />
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full px-4 py-2.5 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
            >
              <FileSpreadsheet size={14} className="text-text-secondary" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2.5 text-xs font-semibold text-text-main hover:bg-slate-50 flex items-center gap-2 cursor-pointer select-none"
            >
              <Table size={14} className="text-text-secondary" />
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
