import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const formatUser = (user) => ({
  id: user._id?.toString?.() ?? String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  profile: user.profile,
  savedJobs: user.savedJobs || [],
});

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { name, email, password, role, companyName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role,
      companyName: role === 'recruiter' ? (companyName || '').trim() : '',
    });
    const token = signToken(user._id);
    const populated = await User.findById(user._id);
    return res.status(201).json({
      token,
      user: formatUser(populated),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    const safe = await User.findById(user._id);
    return res.json({
      token,
      user: formatUser(safe),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/** Current user (JWT required) */
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { skills, bio, resumeUrl, companyName } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (Array.isArray(skills)) {
      user.profile.skills = skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 50);
    }
    if (typeof bio === 'string') user.profile.bio = bio.slice(0, 2000);
    if (typeof resumeUrl === 'string') user.profile.resumeUrl = resumeUrl.slice(0, 2048);
    if (user.role === 'recruiter' && typeof companyName === 'string') {
      user.companyName = companyName.trim().slice(0, 200);
    }

    await user.save();
    return res.json({ user: formatUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update profile' });
  }
};
