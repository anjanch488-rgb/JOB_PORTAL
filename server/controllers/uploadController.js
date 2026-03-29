import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../utils/cloudinary.js';

/**
 * POST multipart/form-data field "file" — returns secure URL when Cloudinary is configured.
 */
export const uploadResume = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          'Resume upload is disabled. Set CLOUDINARY_* in .env or paste a resume link in your profile.',
      });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'No file uploaded (field name: file)' });
    }
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'job-portal/resumes',
      resource_type: 'raw',
    });
    return res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Upload failed' });
  }
};
