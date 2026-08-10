'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '../../convex/_generated/api';
import Link from 'next/link';

export default function UsageCounter() {
  const { user, isSignedIn } = useUser();
  
  // Fetch usage from Convex
  const usage = useQuery(
    api.scans.getUserUsage,
    isSignedIn ? { userId: user?.id } : 'skip'
  );

  if (!isSignedIn) {
    return (
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-[10px] font-semibold text-zinc-400">
        <span className="font-semibold text-white">⚡ 0 / 5</span>
        <span>Free Scans Used Today</span>
      </div>
    );
  }

  if (usage === undefined) {
    return (
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-[10px] font-semibold text-zinc-550 animate-pulse">
        <span>⚡ Loading scans...</span>
      </div>
    );
  }

  const { scansToday = 0 } = usage;

  if (scansToday >= 5) {
    return (
      <Link 
        href="/pricing"
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-red-950/20 hover:bg-red-950/40 px-3 py-1.5 border border-red-900/40 text-[10px] font-bold text-red-400 transition"
      >
        <span>⚠️ Daily Limit Reached (5/5)</span>
        <span className="text-[9px] underline text-red-500 hover:text-red-400">Upgrade</span>
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-[10px] font-semibold text-zinc-300">
      <span className="text-emerald-400 font-bold">⚡ {scansToday} / 5</span>
      <span className="text-zinc-500">Free Scans Used Today</span>
    </div>
  );
}
