import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-zinc-800/60 rounded" />
          <div className="h-4 w-64 bg-zinc-800/40 rounded" />
        </div>
        <div className="h-8 w-24 bg-zinc-800/50 rounded" />
      </div>

      {/* Grid Loader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="p-5 border border-zinc-850 rounded-xl bg-zinc-900/10 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-zinc-800/60 rounded" />
                <div className="h-3.5 w-24 bg-zinc-800/40 rounded" />
              </div>
              <div className="h-5 w-16 bg-zinc-800/50 rounded" />
            </div>
            <div className="h-10 w-full bg-zinc-800/30 rounded" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-28 bg-zinc-800/40 rounded" />
              <div className="h-4 w-12 bg-zinc-800/55 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
