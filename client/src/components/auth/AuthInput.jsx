import React from 'react'

export default function AuthInput({
  label,
  id,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  register,
  validationRules = {},
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label htmlFor={id} className="text-sm font-semibold text-text-main">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-secondary">
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...(register ? register(id, validationRules) : {})}
          className={`w-full h-11 sm:h-12 pl-10 pr-4 bg-brand-surface border rounded-xl text-sm text-text-main placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ${
            error ? 'border-expense' : 'border-brand-border'
          }`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-expense font-medium mt-0.5">
          {error.message}
        </span>
      )}
    </div>
  )
}
