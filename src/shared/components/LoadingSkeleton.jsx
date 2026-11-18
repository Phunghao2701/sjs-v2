
/**
 * LoadingSkeleton Component
 * Renders an animated placeholder shimmer block.
 */
import { Skeleton } from '../ui/skeleton';

export default function LoadingSkeleton({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px', 
  className = '' 
}) {
  return (
    <Skeleton
      className={`skeleton-shimmer ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        display: 'inline-block'
      }} 
    />
  );
}
