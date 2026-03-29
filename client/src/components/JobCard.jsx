import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Banknote } from 'lucide-react';

export default function JobCard({ job, index = 0 }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass rounded-2xl p-5 transition hover:shadow-xl hover:shadow-sky-500/10"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4 opacity-70" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 opacity-70" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Banknote className="h-4 w-4 opacity-70" />
              {job.salary}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.skillsRequired || []).slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <Link
          to={`/jobs/${job._id}`}
          className="shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          View
        </Link>
      </div>
    </motion.article>
  );
}
