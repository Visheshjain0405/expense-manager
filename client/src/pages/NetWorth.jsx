import React, { useState, useEffect, useCallback } from 'react'
import { PlusCircle, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react'
import netWorthService from '../services/netWorthService'
import accountService from '../services/accountService'

// Custom Subcomponents
import NetWorthSummary from '../components/net-worth/NetWorthSummary'
import NetWorthChart from '../components/net-worth/NetWorthChart'
import AssetsBreakdown from '../components/net-worth/AssetsBreakdown'
import LiabilitiesBreakdown from '../components/net-worth/LiabilitiesBreakdown'
import NetWorthItemCard from '../components/net-worth/NetWorthItemCard'
import NetWorthSkeleton from '../components/net-worth/NetWorthSkeleton'

// Modals
import NetWorthItemModal from '../components/net-worth/NetWorthItemModal'
import DeleteNetWorthItemModal from '../components/net-worth/DeleteNetWorthItemModal'

export default function NetWorth() {
  const [overview, setOverview] = useState({})
  const [history, setHistory] = useState([])
  const [items, setItems] = useState([])
  const [accounts, setAccounts] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // References state
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [toastError, setToastError] = useState(null)

  const fetchNetWorthData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, historyRes, itemsRes, accountsRes] = await Promise.all([
        netWorthService.getNetWorthOverview(),
        netWorthService.getNetWorthHistory(),
        netWorthService.getNetWorthItems(),
        accountService.getAccounts()
      ])

      if (overviewRes.success && historyRes.success && itemsRes.success && accountsRes.success) {
        setOverview(overviewRes.overview || {})
        setHistory(historyRes.history || [])
        setItems(itemsRes.items || [])
        setAccounts(accountsRes.accounts || [])
      } else {
        setError('Unable to load net worth details.')
      }
    } catch (err) {
      console.error('Error fetching net worth data:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNetWorthData()
  }, [fetchNetWorthData])

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
    fetchNetWorthData()
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleDeletePrompt = (item) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return
    setIsDeleting(true)
    try {
      const response = await netWorthService.deleteNetWorthItem(selectedItem.id)
      if (response.success) {
        setIsDeleting(false)
        setIsDeleteOpen(false)
        handleSuccess('Financial item deleted successfully.')
        setSelectedItem(null)
      } else {
        setIsDeleting(false)
        setToastError(response.message || 'Unable to delete item.')
        setIsDeleteOpen(false)
      }
    } catch (err) {
      setIsDeleting(false)
      console.error('Error deleting net worth item:', err)
      const msg = err.response?.data?.message || 'Unable to delete item. Check connection.'
      setToastError(msg)
      setIsDeleteOpen(false)
    }
  }

  const handleOpenAddModal = () => {
    setSelectedItem(null)
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
            Net Worth
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Track what you own, what you owe, and how your financial position changes over time.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Add Financial Item
        </button>
      </div>

      {loading ? (
        <NetWorthSkeleton />
      ) : error ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <AlertCircle className="mx-auto text-expense mb-3" size={32} />
          <h3 className="text-sm font-bold text-text-main">Unable to load net worth details</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
          <button
            onClick={fetchNetWorthData}
            className="mt-6 px-4 py-2 bg-white hover:bg-slate-50 border border-brand-border text-xs font-bold text-text-main rounded-xl transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary metrics display */}
          <NetWorthSummary overview={overview} />

          {/* Main Visual charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <NetWorthChart data={history} />
            </div>
            
            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <AssetsBreakdown accounts={accounts} items={items} />
              <LiabilitiesBreakdown accounts={accounts} items={items} />
            </div>
          </div>

          {/* Manually tracked items lists */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline select-none">
              <div>
                <h3 className="text-lg font-bold text-text-main tracking-tight">Other Assets & Liabilities</h3>
                <p className="text-xs text-text-secondary mt-0.5">Manually tracked portfolio assets, investments, and loan structures.</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] select-none">
                <div className="p-4 bg-slate-50 border border-brand-border rounded-full text-text-secondary mb-6 inline-block">
                  <Inbox size={32} />
                </div>
                <h3 className="text-base font-bold text-text-main mb-1.5">No additional assets or liabilities</h3>
                <p className="text-xs text-text-secondary max-w-sm mb-6 mx-auto leading-relaxed">
                  Your net worth is calculated from your accounts. Add assets like gold, property, investments, or liabilities like loans to get a more complete picture.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer"
                >
                  <PlusCircle size={16} />
                  Add Financial Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <NetWorthItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDeletePrompt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal configurations */}
      <NetWorthItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        itemToEdit={selectedItem}
      />

      <DeleteNetWorthItemModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedItem(null) }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
