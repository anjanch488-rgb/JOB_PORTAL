import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import User from '../models/User.js';

const buildJobFilter = (query) => {
  const { search, location, role, skills } = query;
  const and = [];

  if (search && String(search).trim()) {
    const q = String(search).trim();
    and.push({
      $or: [
        { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { company: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { description: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ],
    });
  }
  if (location && String(location).trim()) {
    const loc = String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    and.push({ location: new RegExp(loc, 'i') });
  }
  if (role && String(role).trim()) {
    const r = String(role).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    and.push({ title: new RegExp(r, 'i') });
  }
  if (skills && String(skills).trim()) {
    const list = String(skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) {
      const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      and.push({
        $and: list.map((s) => ({
          skillsRequired: new RegExp(`^${esc(s)}$`, 'i'),
        })),
      });
    }
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0];
  return { $and: and };
};

export const listJobs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const filter = buildJobFilter(req.query);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.json({
      jobs: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list jobs' });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json({ job });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load job' });
  }
};

export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { title, description, company, salary, location, skillsRequired } = req.body;
    const companyFinal =
      req.user.role === 'recruiter' && req.user.companyName
        ? req.user.companyName
        : company;

    if (!companyFinal || !String(companyFinal).trim()) {
      return res.status(400).json({
        message: 'Company is required — add company name to your profile or include it in the request.',
      });
    }

    const job = await Job.create({
      title,
      description,
      company: companyFinal,
      salary,
      location,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
      postedBy: req.user._id,
    });
    const populated = await Job.findById(job._id).populate('postedBy', 'name email companyName');
    return res.status(201).json({ job: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create job' });
  }
};

export const updateJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const { title, description, company, salary, location, skillsRequired } = req.body;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (company !== undefined) job.company = company;
    if (salary !== undefined) job.salary = salary;
    if (location !== undefined) job.location = location;
    if (skillsRequired !== undefined) job.skillsRequired = skillsRequired;

    await job.save();
    const populated = await Job.findById(job._id).populate('postedBy', 'name email companyName');
    return res.json({ job: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update job' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }
    await Job.deleteOne({ _id: job._id });
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete job' });
  }
};

/** Toggle save job (bookmark) for job seekers */
export const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user._id);
    const idStr = job._id.toString();
    const idx = user.savedJobs.map((id) => id.toString()).indexOf(idStr);
    if (idx === -1) {
      user.savedJobs.push(job._id);
    }
    await user.save();
    return res.json({ saved: true, savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to save job' });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user._id);
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== job._id.toString());
    await user.save();
    return res.json({ saved: false, savedJobs: user.savedJobs });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to remove save' });
  }
};

export const listSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'name email companyName' },
    });
    return res.json({ jobs: user.savedJobs || [] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load saved jobs' });
  }
};
