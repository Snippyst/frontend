import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg h-16">
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">Snippyst</Link>
        </h1>

        <div className="grow" />

        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/snippets" className="hover:underline">
            Snippets
          </Link>
          <Link to="/snippets/new" className="hover:underline">
            New Snippet
          </Link>
          {isAuthenticated ? (
            <Link to="/auth/me" className="hover:underline">
              {user?.username}
            </Link>
          ) : (
            <Link to="/auth/login" className="hover:underline">
              Login
            </Link>
          )}
        </nav>
      </header>
    </>
  )
}
