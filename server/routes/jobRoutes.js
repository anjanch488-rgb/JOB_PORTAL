import { Router } from 'express';
import { body } from 'express-validator';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  listSavedJobs,
} from '../controllers/jobController.js';
import { listApplicantsForJob } from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

const jobBody = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 10000 }),
  body('company').optional().trim().isLength({ max: 200 }),
  body('salary').trim().notEmpty().isLength({ max: 120 }),
  body('location').trim().notEmpty().isLength({ max: 200 }),
  body('skillsRequired').optional().isArray(),
];

/** Partial updates: at least one field */
const jobUpdateBody = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty().isLength({ max: 10000 }),
  body('company').optional().trim().isLength({ max: 200 }),
  body('salary').optional().trim().notEmpty().isLength({ max: 120 }),
  body('location').optional().trim().notEmpty().isLength({ max: 200 }),
  body('skillsRequired').optional().isArray(),
];

router.get('/', listJobs);
router.get('/saved', protect, requireRole('job_seeker'), listSavedJobs);
router.get('/:id/applicants', protect, requireRole('recruiter'), listApplicantsForJob);
router.post('/', protect, requireRole('recruiter'), jobBody, createJob);
router.get('/:id', getJob);
router.put('/:id', protect, requireRole('recruiter'), jobUpdateBody, updateJob);
router.delete('/:id', protect, requireRole('recruiter'), deleteJob);
router.post('/:id/save', protect, requireRole('job_seeker'), saveJob);
router.delete('/:id/save', protect, requireRole('job_seeker'), unsaveJob);

export default router;
