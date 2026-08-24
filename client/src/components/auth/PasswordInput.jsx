import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({
  label = 'Password',
  id = 'password',
  placeholder = '••••••••',
  error,
  register,
  validationRules = {},
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  const toggleVisibility = (e) => {
    e.preventDefault()
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label htmlFor={id} className="text-sm font-semibold text-text-main">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-secondary">
          <Lock size={18} />
        </span>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          {...(register ? register(id, validationRules) : {})}
          className={`w-full h-11 sm:h-12 pl-10 pr-12 bg-brand-surface border rounded-xl text-sm text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ${
            error ? 'border-expense' : 'border-brand-border'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-3 px-1.5 flex items-center text-text-secondary hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span className="text-xs text-expense font-medium mt-0.5">
          {error.message}
        </span>
      )}
    </div>
  )
}
