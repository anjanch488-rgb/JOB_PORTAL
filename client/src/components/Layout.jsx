import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import CursorGlow from './CursorGlow.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="aurora-bg" aria-hidden="true" />
      <CursorGlow />
      <Navbar />
      <motion.main
        className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
