import React from 'react';

export default function PricingLoading() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-4 flex flex-col items-center">
        <div className="h-9 w-64 bg-zinc-800/60 rounded" />
        <div className="h-5 w-96 bg-zinc-800/40 rounded" />
        <div className="h-6 w-32 bg-zinc-800/30 rounded mt-4" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-zinc-800/60 rounded" />
                <div className="h-4 w-full bg-zinc-805/40 rounded" />
              </div>
              <div className="h-10 w-28 bg-zinc-800/50 rounded" />
              <div className="space-y-3 border-t border-zinc-850 pt-5">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-zinc-800/60 shrink-0" />
                    <div className="h-3 w-40 bg-zinc-800/40 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-9 w-full bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
