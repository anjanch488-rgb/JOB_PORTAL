import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        companyName: role === 'recruiter' ? companyName : undefined,
      });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
              Sign in
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password (min 8)</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">I am a</span>
              <div className="mt-2 flex gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 dark:border-slate-600 dark:bg-slate-800/60">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'job_seeker'}
                    onChange={() => setRole('job_seeker')}
                  />
                  Job seeker
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 dark:border-slate-600 dark:bg-slate-800/60">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'recruiter'}
                    onChange={() => setRole('recruiter')}
                  />
                  Recruiter
                </label>
              </div>
            </div>
            {role === 'recruiter' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-modern"
                  placeholder="Shown on your job posts"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-shine w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
