import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--bg-surface)] rounded-md ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,92,0,0.08)] to-transparent animate-shimmer" />
    </div>
  );
};

export const TrackRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse shadow-sm">
      {/* Index */}
      <Skeleton className="w-5 h-5 rounded" />
      {/* Cover Image */}
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      {/* Title & Artist */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-3 w-28 rounded" />
      </div>
      {/* Album / Genre */}
      <div className="hidden md:block w-36">
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      {/* Bass tag */}
      <Skeleton className="hidden sm:block w-16 h-5 rounded-full" />
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-10 h-4 rounded" />
      </div>
    </div>
  );
};

export const PlaylistCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm">
      {/* Cover Art */}
      <Skeleton className="w-full aspect-square rounded-2xl" />
      {/* Title */}
      <Skeleton className="h-4 w-3/4 rounded" />
      {/* Description */}
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  );
};

export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-72 rounded-3xl p-8 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-end space-y-4 shadow-sm">
      <Skeleton className="w-32 h-6 rounded-full" />
      <Skeleton className="w-2/3 h-10 rounded-xl" />
      <Skeleton className="w-1/2 h-4 rounded" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="w-36 h-10 rounded-full" />
        <Skeleton className="w-32 h-10 rounded-full" />
      </div>
    </div>
  );
};
