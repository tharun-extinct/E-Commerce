import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ArrowLeft, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/auth-context'

export const AdminShell = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    void logout().then(() => navigate('/login'))
  }

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      {/* Admin-only navbar */}
      <nav className="navbar-fg sticky top-0 z-40">
        <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="text-xl">🥬</span>
              <span className="hidden sm:inline">Fresh Greens</span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
              <Shield className="h-3 w-3" />
              ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-white/70 sm:inline">
                {user.displayName || user.email}
              </span>
            )}
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Site</span>
            </button>
            <button
              type="button"
              className="btn-fg flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  )
}
