import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { uploadResume } from '../controllers/uploadController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/resume', protect, requireRole('job_seeker'), upload.single('file'), uploadResume);

export default router;
