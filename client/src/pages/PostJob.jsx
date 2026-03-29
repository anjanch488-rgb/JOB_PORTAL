import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { createJob } from '../services/jobService.js';

function PostJobForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const skillsRequired = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setSubmitting(true);
    try {
      const { data } = await createJob({
        title,
        description,
        company: company || undefined,
        salary,
        location,
        skillsRequired,
      });
      toast.success('Job posted!');
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Post a job</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Company defaults to your profile company name when set.
        </p>
        <form onSubmit={handleSubmit} className="glass-strong mt-8 space-y-4 rounded-3xl p-6 sm:p-8">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Company (optional if set in profile)
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salary</label>
              <input
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$100k – $120k"
                className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Skills (comma-separated)
            </label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, MongoDB"
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {submitting ? 'Publishing…' : 'Publish job'}
          </button>
        </form>
      </motion.div>
    </Layout>
  );
}

export default function PostJob() {
  return (
    <ProtectedRoute roles={['recruiter']}>
      <PostJobForm />
    </ProtectedRoute>
  );
}
