import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Modern Tailwind CSS Flex & Grid layout components
 * replacing Bootstrap Container, Row, Col with modern CSS Grid & Flexbox.
 */

export function Container({ fluid = false, className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8',
        !fluid && 'max-w-7xl mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const spanMap = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

const smSpanMap = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12',
};

const mdSpanMap = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const lgSpanMap = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const xlSpanMap = {
  1: 'xl:col-span-1',
  2: 'xl:col-span-2',
  3: 'xl:col-span-3',
  4: 'xl:col-span-4',
  5: 'xl:col-span-5',
  6: 'xl:col-span-6',
  7: 'xl:col-span-7',
  8: 'xl:col-span-8',
  9: 'xl:col-span-9',
  10: 'xl:col-span-10',
  11: 'xl:col-span-11',
  12: 'xl:col-span-12',
};

export function Row({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-4 sm:gap-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Col({
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className = '',
  children,
  ...props
}) {
  const classes = cn(
    typeof xs === 'number' ? spanMap[xs] : (xs ? 'col-span-12' : 'col-span-12'),
    sm && smSpanMap[sm],
    md && mdSpanMap[md],
    lg && lgSpanMap[lg],
    xl && xlSpanMap[xl],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export default { Container, Row, Col };
