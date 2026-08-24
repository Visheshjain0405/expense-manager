import React from 'react'
import { Link } from 'react-router-dom'
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react'

export default function Settings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
      <div className="p-4 bg-blue-50 text-primary rounded-full mb-6">
        <SettingsIcon size={32} />
      </div>
      <h2 className="text-2xl font-bold text-text-main mb-2">Settings Section</h2>
      <p className="text-sm text-text-secondary mb-8 leading-relaxed">
        Coming soon! Profile management, app configurations, preferences, and data import/export utilities.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-brand-border rounded-xl text-sm font-semibold text-text-main transition select-none"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  )
}
