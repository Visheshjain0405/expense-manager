import React, { useState, useEffect } from 'react'
import { Search, Calendar, RefreshCw } from 'lucide-react'
import categoryService from '../../services/categoryService'
import accountService from '../../services/accountService'

export default function TransactionFilters({ filters, onChange, onClear }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [categoriesList, setCategoriesList] = useState([])
  const [accountsList, setAccountsList] = useState([])

  // Implement debouncing logic on Search Term input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.search || '') !== searchTerm) {
        onChange({ search: searchTerm, page: 1 })
      }
    }, 450)
    return () => clearTimeout(timer)
  }, [searchTerm, onChange, filters.search])

  // Sync external search updates (e.g. from Clear Filters)
  useEffect(() => {
    setSearchTerm(filters.search || '')
  }, [filters.search])

  // Fetch categories and accounts dynamically
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const catRes = await categoryService.getCategories()
        if (catRes.success) {
          setCategoriesList(catRes.categories || [])
        }

        const accRes = await accountService.getAccounts()
        if (accRes.success) {
          setAccountsList(accRes.accounts || [])
        }
      } catch (err) {
        console.error('Error fetching filters dataset:', err)
      }
    }
    loadFiltersData()
  }, [])

  const handleThisMonthPreset = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth + 1, 0)
    
    onChange({
      startDate: firstDay.toISOString().substring(0, 10),
      endDate: lastDay.toISOString().substring(0, 10),
      page: 1
    })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left space-y-6 select-none">
      {/* Top Search & Preset bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative lg:col-span-8">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-secondary">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search transactions by description, notes, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-brand-bg border border-brand-border rounded-xl text-sm text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>

        {/* Date presets & Clear Buttons */}
        <div className="flex gap-3 lg:col-span-4 justify-end">
          <button
            onClick={handleThisMonthPreset}
            className="flex items-center gap-1.5 px-4 h-11 bg-slate-50 hover:bg-slate-100 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            <Calendar size={14} className="text-text-secondary" />
            This Month
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-4 h-11 bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-expense rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Extended Filters Drawer layout grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Type Tabs Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Type
          </span>
          <div className="flex bg-slate-50 border border-brand-border p-1 rounded-xl">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => onChange({ type: t === 'all' ? '' : t, page: 1 })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                  (filters.type || '') === (t === 'all' ? '' : t)
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-main'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Category Dropdown Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Category
          </span>
          <select
            value={filters.category || ''}
            onChange={(e) => onChange({ category: e.target.value, page: 1 })}
            className="h-11 px-3 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          >
            <option value="">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Account Dropdown Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Account
          </span>
          <select
            value={filters.accountId || ''}
            onChange={(e) => onChange({ accountId: e.target.value, page: 1 })}
            className="h-11 px-3 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          >
            <option value="">All Accounts</option>
            {accountsList.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Start Date */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Start Date
          </span>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value, page: 1 })}
            className="h-11 px-4 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>

        {/* 5. End Date */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            End Date
          </span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onChange({ endDate: e.target.value, page: 1 })}
            className="h-11 px-4 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>
    </div>
  )
}
