import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TransactionPagination({ pagination = {}, onPageChange }) {
  const { page = 1, limit = 20, total = 0, totalPages = 1 } = pagination

  if (total === 0) return null

  const startIdx = (page - 1) * limit + 1
  const endIdx = Math.min(page * limit, total)

  // Generate page numbers to render
  const pageNumbers = []
  const maxPageLinks = 5
  let startPage = Math.max(1, page - Math.floor(maxPageLinks / 2))
  let endPage = Math.min(totalPages, startPage + maxPageLinks - 1)

  if (endPage - startPage + 1 < maxPageLinks) {
    startPage = Math.max(1, endPage - maxPageLinks + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-t border-brand-border select-none text-left">
      {/* Count details label */}
      <span className="text-xs text-text-secondary font-medium">
        Showing <span className="font-bold text-text-main">{startIdx}</span>&ndash;
        <span className="font-bold text-text-main">{endIdx}</span> of{' '}
        <span className="font-bold text-text-main">{total}</span> transactions
      </span>

      {/* Pages nav trigger row */}
      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-brand-border hover:bg-slate-50 text-xs font-semibold text-text-main rounded-lg transition disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed select-none cursor-pointer"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition select-none cursor-pointer border ${
              page === num
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-brand-border text-text-secondary hover:text-text-main hover:bg-slate-50'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-brand-border hover:bg-slate-50 text-xs font-semibold text-text-main rounded-lg transition disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed select-none cursor-pointer"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
