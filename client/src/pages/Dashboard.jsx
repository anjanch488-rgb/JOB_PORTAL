import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ClipboardList, FilePlus2, Heart, Search } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const isRecruiter = user?.role === 'recruiter';

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Hello, <span className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</span> — here’s
          what you can do next.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isRecruiter ? (
          <>
            <DashboardCard
              to="/post-job"
              icon={FilePlus2}
              title="Post a job"
              description="Create a new listing with salary, location, and required skills."
              delay={0}
            />
            <DashboardCard
              to="/jobs"
              icon={Briefcase}
              title="Browse listings"
              description="View all jobs on the platform and manage yours from detail pages."
              delay={0.05}
            />
            <DashboardCard
              to="/applications"
              icon={ClipboardList}
              title="Applications"
              description="Review applicants and update status to accepted or rejected."
              delay={0.1}
            />
          </>
        ) : (
          <>
            <DashboardCard
              to="/jobs"
              icon={Search}
              title="Find jobs"
              description="Search by keywords, location, role, and skills with pagination."
              delay={0}
            />
            <DashboardCard
              to="/applications"
              icon={ClipboardList}
              title="My applications"
              description="Track pending, accepted, and rejected applications."
              delay={0.05}
            />
            <DashboardCard
              to="/jobs?saved=1"
              icon={Heart}
              title="Saved jobs"
              description="Open the jobs list and filter to your bookmarked roles."
              delay={0.1}
            />
            <DashboardCard
              to="/profile"
              icon={Briefcase}
              title="Profile & resume"
              description="Update skills, bio, and resume link (or upload via Cloudinary)."
              delay={0.15}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

function DashboardCard({ to, icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        to={to}
        className="glass block h-full rounded-2xl p-6 transition hover:shadow-xl hover:shadow-sky-500/10"
      >
        <Icon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
        <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </Link>
    </motion.div>
  );
}
