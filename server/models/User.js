import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['job_seeker', 'recruiter'],
        message: 'Role must be job_seeker or recruiter',
      },
      required: true,
    },
    /** Recruiter: company name shown on job posts */
    companyName: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name too long'],
      default: '',
    },
    profile: {
      skills: [{ type: String, trim: true }],
      bio: { type: String, maxlength: 2000, default: '' },
      /** Public URL or Cloudinary URL after upload */
      resumeUrl: { type: String, default: '', maxlength: 2048 },
    },
    /** Job seeker: bookmarked job IDs */
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
