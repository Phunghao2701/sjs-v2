import './LoadingSkeleton.css';
import { Skeleton, SkeletonStatus } from '../../../../shared/ui/skeleton';

const LoadingSkeleton = ({ height = '300px', width = '100%', borderRadius = '8px', message }) => {
  return (
    <SkeletonStatus label={message || 'Loading analytics'} className="skeleton-container" style={{ height, width, borderRadius }}>
      <Skeleton className="skeleton-pulse h-full w-full" />
      {message && <p className="skeleton-message">{message}</p>}
    </SkeletonStatus>
  );
};

export default LoadingSkeleton;
