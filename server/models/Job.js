import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    salary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    skillsRequired: [{ type: String, trim: true }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text', location: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model('Job', jobSchema);
