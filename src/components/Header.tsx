import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Home, Code2, Plus, User, LogIn, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const baseNavLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/snippets', label: 'Snippets', icon: Code2 },
    { to: '/snippets/new', label: 'New Snippet', icon: Plus },
  ]

  const moderationLink = user?.isPrivileged
    ? { to: '/moderation', label: 'Moderate', icon: Shield }
    : null

  const navLinks = moderationLink
    ? [...baseNavLinks, moderationLink]
    : baseNavLinks

  const authLink = isAuthenticated
    ? { to: '/auth/me', label: user?.username || 'Profile', icon: User }
    : { to: '/auth/login', label: 'Login', icon: LogIn }

  return (
    <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold bg-linear-to-r transition-all text-blue-600 dark:text-white"
          >
            <span>Snippyst</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isNew = to === '/snippets/new'
              if (isNew && !isAuthenticated) {
                return (
                  <Link
                    key={to}
                    to="/auth/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 dark:text-gray-300 opacity-75 cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
                    title="Log in to create a new snippet"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                )
              }

              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
            <Link
              to={authLink.to}
              className="flex items-center space-x-2 px-4 py-2 ml-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <authLink.icon className="w-4 h-4" />
              <span>{authLink.label}</span>
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isNew = to === '/snippets/new'
              if (isNew && !isAuthenticated) {
                return (
                  <>
                    <Link
                      key={to}
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-500 dark:text-gray-300 opacity-75 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
                      title="Log in to create a new snippet"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                    <hr className="border-gray-300 dark:border-gray-700" />
                  </>
                )
              }

              return (
                <>
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                  <hr className="border-gray-300 dark:border-gray-700" />
                </>
              )
            })}
            <Link
              to={authLink.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <authLink.icon className="w-5 h-5" />
              <span>{authLink.label}</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
