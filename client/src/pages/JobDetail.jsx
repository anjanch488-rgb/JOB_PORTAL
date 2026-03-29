import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Banknote, Building2, MapPin, Trash2, Pencil, Bookmark } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { fetchJob, deleteJob, saveJob, unsaveJob } from '../services/jobService.js';
import * as applicationService from '../services/applicationService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loadUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchJob(id);
        if (!cancelled) {
          setJob(data.job);
          if (user?.profile?.resumeUrl) setResumeUrl(user.profile.resumeUrl);
        }
      } catch {
        if (!cancelled) toast.error('Job not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user?.profile?.resumeUrl]);

  const postedId = job?.postedBy?._id || job?.postedBy;
  const owner =
    user && postedId && String(postedId) === String(user.id || user._id);
  const saved =
    user?.role === 'job_seeker' &&
    (user.savedJobs || []).some((jid) => String(jid) === String(job?._id));

  async function handleApply(e) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to apply');
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply');
      return;
    }
    setSubmitting(true);
    try {
      await applicationService.applyToJob(id, {
        coverLetter,
        resumeUrl: resumeUrl || undefined,
      });
      toast.success('Application submitted!');
      setCoverLetter('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not apply');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this job listing?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  async function toggleSave() {
    if (!user || user.role !== 'job_seeker') {
      toast.error('Sign in as a job seeker to save jobs');
      return;
    }
    try {
      if (saved) {
        await unsaveJob(id);
        toast.success('Removed from saved');
      } else {
        await saveJob(id);
        toast.success('Saved to your list');
      }
      await loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update save');
    }
  }

  if (loading || !job) {
    return (
      <Layout>
        <div className="glass animate-pulse rounded-3xl p-10">
          <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-6 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-4 w-4" />
                {job.salary}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.skillsRequired || []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-800 dark:text-sky-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.role === 'job_seeker' && (
              <button
                type="button"
                onClick={toggleSave}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save job'}
              </button>
            )}
            {owner && (
              <>
                <Link
                  to={`/jobs/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium dark:border-slate-600 dark:bg-slate-800/80"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert mt-8 max-w-none">
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{job.description}</p>
        </div>

        {user?.role === 'job_seeker' && (
          <form onSubmit={handleApply} className="mt-10 border-t border-slate-200/80 pt-8 dark:border-slate-700/80">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Apply</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cover letter
                </label>
                <textarea
                  required
                  minLength={20}
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="Why are you a great fit?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Resume URL (optional — defaults to profile)
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="https://…"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </div>
          </form>
        )}
      </motion.article>
    </Layout>
  );
}
