/**
 * Sample data for local development.
 * Usage: set MONGODB_URI in .env, then: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config({ path: '.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI in server/.env');
  process.exit(1);
}

const sampleJobs = (recruiterId) => [
  {
    title: 'Senior Full-Stack Developer',
    description:
      'We are looking for an experienced full-stack developer with React and Node.js. You will work on our core hiring platform, collaborate with design, and ship features end-to-end.',
    company: 'TechHire Labs',
    salary: '$120k – $150k',
    location: 'Remote (US)',
    skillsRequired: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    postedBy: recruiterId,
  },
  {
    title: 'Frontend Engineer',
    description:
      'Join our product team to build accessible, animated UIs with React and Tailwind. Experience with design systems is a plus.',
    company: 'TechHire Labs',
    salary: '$95k – $120k',
    location: 'New York, NY',
    skillsRequired: ['React', 'Tailwind CSS', 'Framer Motion'],
    postedBy: recruiterId,
  },
  {
    title: 'Backend Developer (APIs)',
    description:
      'Design and maintain REST APIs, authentication, and data layers using Node.js and MongoDB.',
    company: 'CloudScale Inc',
    salary: '$100k – $130k',
    location: 'Austin, TX',
    skillsRequired: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    postedBy: recruiterId,
  },
];

async function run() {
  await mongoose.connect(uri);
  console.log('Connected');

  await Application.deleteMany({});
  await Job.deleteMany({});
  await User.deleteMany({});

  const recruiter = await User.create({
    name: 'Demo Recruiter',
    email: 'recruiter@demo.com',
    password: 'DemoPass123',
    role: 'recruiter',
    companyName: 'TechHire Labs',
  });

  const seeker = await User.create({
    name: 'Demo Seeker',
    email: 'seeker@demo.com',
    password: 'DemoPass123',
    role: 'job_seeker',
    profile: {
      skills: ['React', 'Node.js', 'MongoDB'],
      bio: 'Full-stack developer passionate about clean UI and solid APIs.',
      resumeUrl: 'https://example.com/resume.pdf',
    },
  });

  const jobs = await Job.insertMany(sampleJobs(recruiter._id));
  console.log(`Created ${jobs.length} jobs`);

  await Application.create({
    job: jobs[0]._id,
    applicant: seeker._id,
    coverLetter:
      'I am excited to apply for the Senior Full-Stack Developer role. I have 5+ years building React and Node applications and would love to contribute to your hiring platform.',
    resumeUrl: seeker.profile.resumeUrl,
    status: 'pending',
  });

  console.log('Seed complete.');
  console.log('Login: seeker@demo.com / DemoPass123');
  console.log('Login: recruiter@demo.com / DemoPass123');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
