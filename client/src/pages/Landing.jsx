import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Sparkles, Users } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl glass-strong px-6 py-16 shadow-xl shadow-sky-500/10 sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl dark:bg-indigo-500/20" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-sky-500/15" />

        <div className="relative max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm dark:bg-slate-800/90 dark:text-sky-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Hire faster. Apply smarter.
          </motion.div>
          <motion.h1
            className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            Your next role — or your next hire — starts here.
          </motion.h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            A full-featured job portal with role-based dashboards, applications, bookmarks, and a polished
            glassmorphism UI that works beautifully on mobile and desktop.
          </p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-6 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                >
                  Browse jobs
                </Link>
              </>
            )}
          </motion.div>
          {isAuthenticated && user && (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Signed in as <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> (
              {user.role === 'recruiter' ? 'Recruiter' : 'Job seeker'})
            </p>
          )}
        </div>

        <motion.div
          className="relative mt-16 grid gap-6 sm:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <motion.div
            className="glass card-tilt rounded-2xl p-6"
            whileHover={{ scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <Users className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">For job seekers</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Profile, search & filters, one-click apply with cover letter, track status, and save listings.
            </p>
          </motion.div>
          <motion.div
            className="glass card-tilt rounded-2xl p-6"
            whileHover={{ scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">For recruiters</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Post and manage jobs, review applicants, and accept or reject with clear status tracking.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}
