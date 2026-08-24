import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError(null)

    const result = await login(data.email, data.password)
    
    if (result.success) {
      setIsLoading(false)
      navigate('/dashboard')
    } else {
      setIsLoading(false)
      // Custom formatting based on API error response
      if (result.message.toLowerCase().includes('connect') || result.message.toLowerCase().includes('network')) {
        setApiError('Unable to connect to the server. Please try again in a moment.')
      } else if (result.message.toLowerCase().includes('invalid')) {
        setApiError('Invalid email or password. Please check your credentials and try again.')
      } else {
        setApiError(result.message)
      }
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-left">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary">
          Sign in to continue to your financial dashboard.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-expense rounded-xl text-sm font-medium flex items-start gap-2.5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <AuthInput
          label="Email address"
          id="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email}
          register={register}
          validationRules={{
            required: 'Please enter your email address.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address.'
            }
          }}
          disabled={isLoading}
        />

        {/* Password Field */}
        <PasswordInput
          label="Password"
          id="password"
          error={errors.password}
          register={register}
          validationRules={{
            required: 'Please enter your password.',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters.'
            }
          }}
          disabled={isLoading}
        />

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-sm select-none">
          <label className="flex items-center gap-2 cursor-pointer text-text-secondary font-medium">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              disabled={isLoading}
              className="w-4.5 h-4.5 rounded border-brand-border text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none transition"
            />
            Remember me
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => e.preventDefault()}
            className="text-primary hover:text-primary-hover font-semibold transition"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 sm:h-12 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition duration-150 select-none shadow-[0_4px_12px_rgba(37,99,235,0.15)] cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}
