import React from 'react';

export default function AboutLoading() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-4 flex flex-col items-center">
        <div className="h-4 w-28 bg-emerald-500/10 border border-emerald-500/20 rounded-full" />
        <div className="h-9 w-64 bg-zinc-800/60 rounded mt-2" />
        <div className="h-5 w-80 bg-zinc-800/40 rounded" />
      </div>

      {/* Hero Skeleton banner */}
      <div className="h-48 w-full bg-zinc-900/10 border border-zinc-850 rounded-2xl p-6 space-y-4">
        <div className="h-5 w-48 bg-zinc-800/60 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-800/40 rounded" />
          <div className="h-3 w-5/6 bg-zinc-800/40 rounded" />
          <div className="h-3 w-4/5 bg-zinc-800/40 rounded" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 border border-zinc-850 bg-zinc-905/10 rounded-2xl space-y-4">
            <div className="h-5 w-32 bg-zinc-800/60 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-800/40 rounded" />
              <div className="h-3 w-5/6 bg-zinc-800/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
