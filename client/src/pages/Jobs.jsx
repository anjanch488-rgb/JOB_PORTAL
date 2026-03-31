import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import JobCard from '../components/JobCard.jsx';
import JobListSkeleton from '../components/JobListSkeleton.jsx';
import { fetchJobs, fetchSavedJobs } from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const role = searchParams.get('role') || '';
  const skills = searchParams.get('skills') || '';
  const savedOnly = searchParams.get('saved') === '1';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (savedOnly) {
          if (!user || user.role !== 'job_seeker') {
            toast.error('Sign in as a job seeker to view saved jobs.');
            setSearchParams((prev) => {
              const n = new URLSearchParams(prev);
              n.delete('saved');
              return n;
            });
            if (!cancelled) setLoading(false);
            return;
          }
          const { data: s } = await fetchSavedJobs();
          if (!cancelled) {
            setData({ jobs: s.jobs, page: 1, totalPages: 1, total: s.jobs?.length || 0, savedMode: true });
          }
        } else {
          const { data: j } = await fetchJobs({
            page,
            limit: 10,
            search: search || undefined,
            location: location || undefined,
            role: role || undefined,
            skills: skills || undefined,
          });
          if (!cancelled) setData({ ...j, savedMode: false });
        }
      } catch (e) {
        if (!cancelled) toast.error(e.response?.data?.message || 'Failed to load jobs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, location, role, skills, savedOnly, user, setSearchParams]);

  function applyFilters(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = new URLSearchParams();
    const s = fd.get('search')?.trim();
    const loc = fd.get('location')?.trim();
    const r = fd.get('role')?.trim();
    const sk = fd.get('skills')?.trim();
    if (s) next.set('search', s);
    if (loc) next.set('location', loc);
    if (r) next.set('role', r);
    if (sk) next.set('skills', sk);
    if (savedOnly) next.set('saved', '1');
    setSearchParams(next);
    setPage(1);
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {savedOnly ? 'Saved jobs' : 'Job listings'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {savedOnly ? 'Roles you bookmarked.' : 'Search and filter open roles across companies.'}
          </p>
        </div>
        {user?.role === 'job_seeker' && (
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (savedOnly) next.delete('saved');
              else next.set('saved', '1');
              setSearchParams(next);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
          >
            {savedOnly ? 'Show all jobs' : 'Saved only'}
          </button>
        )}
      </div>

      {!savedOnly && (
        <motion.form
          onSubmit={applyFilters}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-8 grid gap-4 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Search</label>
            <input
              name="search"
              defaultValue={search}
              placeholder="Title, company…"
              className="input-modern px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Location</label>
            <input
              name="location"
              defaultValue={location}
              placeholder="City, remote…"
              className="input-modern px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Role (title)</label>
            <input
              name="role"
              defaultValue={role}
              placeholder="e.g. Engineer"
              className="input-modern px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Skills (comma)</label>
            <input
              name="skills"
              defaultValue={skills}
              placeholder="React, Node"
              className="input-modern px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="btn-shine rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md"
            >
              Apply filters
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <JobListSkeleton />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {data?.total != null ? `${data.total} job(s)` : ''}
          </p>
          <div className="space-y-4">
            {(data?.jobs || []).map((job, i) => (
              <JobCard key={job._id} job={job} index={i} />
            ))}
          </div>
          {!data?.jobs?.length && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">No jobs found.</p>
          )}
          {!savedOnly && data?.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-600"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                Page {page} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
