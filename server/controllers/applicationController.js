import { validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export const applyToJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = await User.findById(req.user._id);
    const resume =
      typeof resumeUrl === 'string' && resumeUrl.trim()
        ? resumeUrl.trim().slice(0, 2048)
        : applicant.profile?.resumeUrl || '';

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter,
      resumeUrl: resume,
    });

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email profile');

    return res.status(201).json({ application: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to submit application' });
  }
};

/** Seeker: own applications. Recruiter: applications for jobs they posted. */
export const listApplications = async (req, res) => {
  try {
    if (req.user.role === 'job_seeker') {
      const items = await Application.find({ applicant: req.user._id })
        .populate('job', 'title company location salary postedBy')
        .sort({ createdAt: -1 })
        .lean();
      return res.json({ applications: items });
    }

    const jobs = await Job.find({ postedBy: req.user._id }).select('_id').lean();
    const jobIds = jobs.map((j) => j._id);
    const items = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location')
      .populate('applicant', 'name email profile')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ applications: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list applications' });
  }
};

/** Recruiter: update application status for their job only */
export const updateApplicationStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findById(application.job._id || application.job);
    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only manage applications for your jobs' });
    }

    application.status = status;
    await application.save();

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email profile');

    return res.json({ application: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update status' });
  }
};

/** Recruiter: applicants for a single job */
export const listApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'name email profile')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ job, applications });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load applicants' });
  }
};
