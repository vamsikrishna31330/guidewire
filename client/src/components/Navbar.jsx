import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiShieldCheck, HiMenu, HiX } from 'react-icons/hi'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, worker, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/buy-policy', label: 'Buy Policy' },
    { to: '/claims', label: 'Claims' },
  ] : []

  if (worker?.isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin' })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-gs-bg/80 backdrop-blur-xl border-b border-gs-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
            <HiShieldCheck className="w-8 h-8 text-gs-teal group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold gs-gradient-text">GigShield</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.to) 
                    ? 'bg-gs-teal/10 text-gs-teal' 
                    : 'text-gs-text-muted hover:text-gs-text hover:bg-gs-card'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {user && <NotificationBell />}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gs-text-muted">
                  {worker?.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gs-text-muted hover:text-gs-danger transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="gs-btn-secondary text-sm !py-2 !px-4">Login</Link>
                <Link to="/register" className="gs-btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gs-text-muted hover:text-gs-text"
            >
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gs-card border-t border-gs-border animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(link.to) ? 'bg-gs-teal/10 text-gs-teal' : 'text-gs-text-muted hover:text-gs-text'}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false) }}
                className="w-full text-left px-4 py-3 text-sm text-gs-danger"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gs-text-muted">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gs-teal">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
