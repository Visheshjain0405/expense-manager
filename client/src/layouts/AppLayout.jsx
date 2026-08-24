import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  BarChart3,
  PiggyBank,
  CreditCard,
  FolderOpen,
  CalendarDays,
  Coins,
  Settings as SettingsIcon,
  Bell,
  Search,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Target,
  FileText,
  LogOut
} from 'lucide-react'

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: Receipt },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Budgets', path: '/budgets', icon: PiggyBank },
  { label: 'Accounts', path: '/accounts', icon: CreditCard },
  { label: 'Categories', path: '/categories', icon: FolderOpen },
  { label: 'Recurring', path: '/recurring', icon: CalendarDays },
  { label: 'Net Worth', path: '/net-worth', icon: Coins },
  { label: 'Savings Goals', path: '/savings-goals', icon: Target },
  { label: 'Reports', path: '/reports', icon: FileText },
]

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get current route name
  const currentRouteLabel =
    navItems.find((item) => item.path === location.pathname)?.label || 
    (location.pathname === '/settings' ? 'Settings' : 'Overview')

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-surface border-r border-brand-border select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-brand-border flex-shrink-0">
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <Wallet size={24} />
        </div>
        <span className="font-bold text-lg text-text-main tracking-tight">
          Expense Manager
        </span>
      </div>

      {/* Navigation list */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-primary'
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-main'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Settings & Bottom Panel */}
      <div className="p-4 border-t border-brand-border space-y-1 flex-shrink-0">
        <Link
          to="/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
            location.pathname === '/settings'
              ? 'bg-blue-50 text-primary'
              : 'text-text-secondary hover:bg-slate-50 hover:text-text-main'
          }`}
        >
          <SettingsIcon size={18} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-expense hover:bg-rose-50 transition-all duration-200 select-none cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-20">
        {sidebarContent}
      </aside>

      {/* Viewport Frame */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 text-text-secondary hover:text-text-main transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-text-main capitalize">
              {currentRouteLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 bg-brand-bg border border-brand-border rounded-lg text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>

            {/* Notification Badge */}
            <button className="p-2 text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg border border-transparent hover:border-brand-border transition-all duration-200 relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-expense rounded-full"></span>
            </button>

            {/* User Profile Info & Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 pl-2 border-l border-brand-border hover:opacity-90 select-none cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-primary border border-brand-border uppercase">
                  {user?.name ? user.name.slice(0, 2) : 'VJ'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-text-main leading-tight">
                    {user?.name || 'Vishesh Jain'}
                  </p>
                  <p className="text-[10px] text-text-secondary">Visheshj865@gmail.com</p>
                </div>
                <ChevronDown size={14} className="text-text-secondary hidden sm:block" />
              </button>

              {/* Profile dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1 z-20 animate-fade-in text-left">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                      className="w-full px-4 py-2.5 text-sm text-text-main hover:bg-slate-50 flex items-center gap-2 select-none cursor-pointer"
                    >
                      <UserIcon size={14} className="text-text-secondary" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                      className="w-full px-4 py-2.5 text-sm text-text-main hover:bg-slate-50 flex items-center gap-2 select-none cursor-pointer"
                    >
                      <SettingsIcon size={14} className="text-text-secondary" />
                      Settings
                    </button>
                    <hr className="border-brand-border my-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout() }}
                      className="w-full px-4 py-2.5 text-sm text-expense hover:bg-rose-50 flex items-center gap-2 select-none cursor-pointer"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Area */}
            <div className="relative w-64 max-w-xs h-full bg-brand-surface shadow-2xl flex flex-col z-40 animate-slide-in-left">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex-1 h-full">
                {sidebarContent}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Nested Route Rendering */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
