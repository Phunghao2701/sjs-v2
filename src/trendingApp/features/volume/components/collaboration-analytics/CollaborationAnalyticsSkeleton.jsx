import React from 'react';
import { Skeleton } from '../../../../../shared/ui/skeleton';
import { Card } from '../../../../../shared/ui/card';
import './CollaborationAnalytics.css';

const CollaborationAnalyticsSkeleton = () => {
  return (
    <div className="ca-page space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 min-h-[380px]">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-64 rounded mb-4" />
          <Skeleton className="h-64 w-full rounded" />
        </Card>
        <Card className="p-6 space-y-4 min-h-[380px]">
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-4 w-72 rounded mb-4" />
          <Skeleton className="h-64 w-full rounded" />
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-3 min-h-[260px]">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-44 w-full rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollaborationAnalyticsSkeleton;
