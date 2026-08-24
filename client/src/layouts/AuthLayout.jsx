import React from 'react'
import { Wallet, CheckCircle2 } from 'lucide-react'

const features = [
  'Simple expense tracking',
  'Clear financial insights',
  'Secure personal data'
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6 lg:p-0">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 lg:min-h-[640px] bg-brand-surface lg:rounded-3xl lg:border border-brand-border overflow-hidden lg:shadow-md">
        
        {/* Left Branding Side (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-6 bg-slate-50 flex-col justify-between p-12 border-r border-brand-border text-left">
          {/* Header */}
          <div className="flex items-center gap-3 select-none">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Wallet size={24} />
            </div>
            <span className="font-bold text-lg text-text-main tracking-tight">
              Expense Manager
            </span>
          </div>

          {/* Description */}
          <div className="space-y-6 my-auto">
            <h2 className="text-4xl font-extrabold tracking-tight text-text-main leading-tight">
              Take control of your<br />personal finances.
            </h2>
            <p className="text-text-secondary leading-relaxed text-base max-w-md">
              Track your income, expenses and savings with clarity — all in one place.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3.5 pt-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-text-main font-medium text-sm">
                  <CheckCircle2 size={16} className="text-income flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer details */}
          <div className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Expense Manager. All rights reserved.
          </div>
        </div>

        {/* Right Authentication Side */}
        <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
