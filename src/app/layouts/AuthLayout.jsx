/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: app\layouts\AuthLayout.jsx
 */
import { motion, useReducedMotion } from 'framer-motion';

export default function AuthLayout({ banner, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full min-h-screen">
        {/* Left Column: Banner (Hidden on Mobile) */}
        <div className="hidden md:block h-full min-h-screen sticky top-0 border-r border-border">
          {banner}
        </div>

        {/* Right Column: Auth Forms */}
        <div className="flex items-center justify-center py-8 px-4 sm:px-6 md:px-10 min-h-screen overflow-y-auto bg-surface">
          <motion.div 
            className="w-full max-w-[440px]"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
