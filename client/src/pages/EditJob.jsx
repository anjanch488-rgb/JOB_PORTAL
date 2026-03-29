import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { fetchJob, updateJob } from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';

function EditJobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchJob(id);
        const job = data.job;
        const postedId = job.postedBy?._id || job.postedBy;
        if (user && postedId && String(postedId) !== String(user.id || user._id)) {
          toast.error('Not your listing');
          navigate('/jobs');
          return;
        }
        if (!cancelled) {
          setTitle(job.title);
          setDescription(job.description);
          setCompany(job.company);
          setSalary(job.salary);
          setLocation(job.location);
          setSkills((job.skillsRequired || []).join(', '));
        }
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    const skillsRequired = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setSubmitting(true);
    try {
      await updateJob(id, {
        title,
        description,
        company,
        salary,
        location,
        skillsRequired,
      });
      toast.success('Job updated');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="glass animate-pulse rounded-3xl p-10 max-w-2xl mx-auto h-96" />
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit job</h1>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
            <input
              required
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills (comma-separated)</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>
    </Layout>
  );
}

export default function EditJob() {
  return (
    <ProtectedRoute roles={['recruiter']}>
      <EditJobForm />
    </ProtectedRoute>
  );
}
