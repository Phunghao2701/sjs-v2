import { motion, useReducedMotion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Standard subtle animation variants for a scientific/data dashboard
export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const staggerContainer = (staggerDelay = 0.03, delayChildren = 0.01) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

// Motion-enabled Page component
export const MotionPage = forwardRef(({ className = '', children, ...props }, ref) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      exit="exit"
      variants={reduceMotion ? {} : fadeUp}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MotionPage.displayName = 'MotionPage';

// Motion-enabled Grid for stagger animations on cards
export const MotionGrid = forwardRef(({ className = '', children, staggerDelay = 0.04, ...props }, ref) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      variants={reduceMotion ? {} : staggerContainer(staggerDelay)}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MotionGrid.displayName = 'MotionGrid';

// Motion-enabled Item inside MotionGrid
export const MotionItem = forwardRef(({ className = '', children, ...props }, ref) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={reduceMotion ? {} : staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MotionItem.displayName = 'MotionItem';
