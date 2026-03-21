import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
    {/* Content cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <SkeletonCard />
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-fadeIn">
    <div className="p-4 border-b">
      <Skeleton className="h-5 w-1/4" />
    </div>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/5 ml-auto" />
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonDashboard, SkeletonTable };
export default Skeleton;
