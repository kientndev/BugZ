import React from 'react';

export default function ScanLoading() {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden max-w-7xl mx-auto w-full animate-pulse">
      {/* Left Panel Skeleton */}
      <section className="flex flex-col space-y-4 bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm min-h-[450px]">
        <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
          <div className="h-6 w-48 bg-zinc-800/60 rounded" />
        </div>
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 h-full min-h-[300px]">
          <div className="h-4 w-40 bg-zinc-800/40 rounded mb-4" />
          <div className="h-3 w-5/6 bg-zinc-800/30 rounded mb-2.5" />
          <div className="h-3 w-4/5 bg-zinc-800/30 rounded mb-2.5" />
        </div>
        <div className="h-11 w-full bg-zinc-800/60 rounded" />
      </section>

      {/* Right Panel Skeleton */}
      <section className="flex flex-col space-y-4 bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm min-h-[450px]">
        <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
          <div className="h-6 w-32 bg-zinc-800/60 rounded" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-lg min-h-[300px] space-y-3">
          <div className="h-12 w-12 rounded-full bg-zinc-800/60" />
          <div className="h-5 w-28 bg-zinc-800/50 rounded" />
          <div className="h-3.5 w-48 bg-zinc-800/35 rounded" />
        </div>
      </section>
    </div>
  );
}
