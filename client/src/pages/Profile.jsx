import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { uploadResume } from '../services/uploadService.js';

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [skills, setSkills] = useState((user?.profile?.skills || []).join(', '));
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resumeUrl || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setBio(user.profile?.bio || '');
    setSkills((user.profile?.skills || []).join(', '));
    setResumeUrl(user.profile?.resumeUrl || '');
    setCompanyName(user.companyName || '');
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const skillArr = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await updateProfile({
        bio,
        skills: skillArr,
        resumeUrl,
        companyName: user?.role === 'recruiter' ? companyName : undefined,
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadResume(file);
      setResumeUrl(data.url);
      await updateProfile({
        bio,
        skills: skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        resumeUrl: data.url,
      });
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload unavailable — paste a URL instead');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Update how employers see you.</p>

      <form onSubmit={handleSave} className="glass-strong mt-8 max-w-2xl space-y-4 rounded-3xl p-6 sm:p-8">
        {user?.role === 'recruiter' && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills (comma-separated)</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resume URL</label>
          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
            placeholder="https://…"
          />
        </div>
        {user?.role === 'job_seeker' && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Or upload (requires Cloudinary on server)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onFile}
              disabled={uploading}
              className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploading && <p className="mt-1 text-xs text-slate-500">Uploading…</p>}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </Layout>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
}
