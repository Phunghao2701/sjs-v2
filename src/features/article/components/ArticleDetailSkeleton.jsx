/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleDetailSkeleton.jsx
 */
import { Skeleton } from '../../../shared/ui/skeleton';
import { Card } from '../../../shared/ui/card';

export default function ArticleDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Main Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Header Card Skeleton */}
        <Card className="p-6 space-y-4">
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <Skeleton className="h-9 w-11/12 rounded mb-2" />
          <Skeleton className="h-9 w-3/4 rounded mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4.5 w-48 rounded" />
          </div>
        </Card>

        {/* Abstract Card Skeleton */}
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-44 rounded mb-2" />
          <Skeleton className="h-24 w-full rounded" />
        </Card>

        {/* Keywords Card Skeleton */}
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-52 rounded mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-7 w-28 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        </Card>

        {/* Authors Card Skeleton */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded mb-2" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Sidebar Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Actions Card Skeleton */}
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-36 rounded mb-2" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </Card>

        {/* Statistics Card Skeleton */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-44 rounded mb-2" />
          <Skeleton className="h-16 w-full rounded mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}
