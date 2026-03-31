import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canUseGlow =
      window.matchMedia('(min-width: 1024px)').matches &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setEnabled(canUseGlow);
    if (!canUseGlow) return;

    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  if (!enabled || reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <motion.div
        className="absolute h-40 w-40 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/25"
        style={{ left: position.x - 80, top: position.y - 80 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
        animate={{ x: 0, y: 0 }}
      />
    </motion.div>
  );
}

