import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import * as applicationService from '../services/applicationService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Applications() {
  return (
    <ProtectedRoute>
      <ApplicationsInner />
    </ProtectedRoute>
  );
}

function ApplicationsInner() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await applicationService.fetchApplications();
      setItems(data.applications || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(appId, status) {
    try {
      await applicationService.updateApplicationStatus(appId, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  }

  const isRecruiter = user?.role === 'recruiter';

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {isRecruiter ? 'Applicants for your job posts.' : 'Roles you have applied to.'}
      </p>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-6 h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-10 text-center text-slate-500 dark:text-slate-400">No applications yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((app, index) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link
                    to={`/jobs/${app.job?._id || app.job}`}
                    className="text-lg font-semibold text-sky-700 hover:underline dark:text-sky-300"
                  >
                    {app.job?.title || 'Job'}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {app.job?.company} · {app.job?.location}
                  </p>
                  {isRecruiter && (
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      <strong>Applicant:</strong> {app.applicant?.name} ({app.applicant?.email})
                    </p>
                  )}
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    Status:{' '}
                    <span
                      className={
                        app.status === 'accepted'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : app.status === 'rejected'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {app.status}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {app.coverLetter}
                  </p>
                </div>
                {isRecruiter && app.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(app._id, 'accepted')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(app._id, 'rejected')}
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
