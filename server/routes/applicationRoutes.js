import { Router } from 'express';
import { body } from 'express-validator';
import {
  applyToJob,
  listApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

const applyValidation = [
  body('coverLetter').trim().notEmpty().isLength({ min: 20, max: 5000 }),
  body('resumeUrl').optional().trim().isLength({ max: 2048 }),
];

const statusValidation = [
  body('status').isIn(['pending', 'accepted', 'rejected']).withMessage('Invalid status'),
];

router.post('/apply/:jobId', protect, requireRole('job_seeker'), applyValidation, applyToJob);
router.get('/applications', protect, listApplications);
router.put('/applications/:id/status', protect, requireRole('recruiter'), statusValidation, updateApplicationStatus);

export default router;
