import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/80 dark:bg-slate-800 text-brand-600 dark:text-sky-400 shadow-sm'
      : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/80'
  }`;

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 dark:border-slate-800/80 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Briefcase className="h-5 w-5" />
          </motion.span>
          <span>JobPortal</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/applications" className={linkClass}>
                Applications
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                <UserRound className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {isAuthenticated && (
        <div className="flex border-t border-white/20 px-2 py-2 md:hidden dark:border-slate-800/50">
          <NavLink to="/dashboard" className={linkClass} end>
            <LayoutDashboard className="mx-auto mb-0.5 h-4 w-4" />
            <span className="block text-center text-xs">Home</span>
          </NavLink>
          <NavLink to="/jobs" className={linkClass}>
            <Briefcase className="mx-auto mb-0.5 h-4 w-4" />
            <span className="block text-center text-xs">Jobs</span>
          </NavLink>
          <NavLink to="/applications" className={linkClass}>
            <ClipboardList className="mx-auto mb-0.5 h-4 w-4" />
            <span className="block text-center text-xs">Apps</span>
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            <UserRound className="mx-auto mb-0.5 h-4 w-4" />
            <span className="block text-center text-xs">Profile</span>
          </NavLink>
        </div>
      )}
    </header>
  );
}
