import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  me,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('role').isIn(['job_seeker', 'recruiter']),
  body('companyName').optional().trim().isLength({ max: 200 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);

export default router;
