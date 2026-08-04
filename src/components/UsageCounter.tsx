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
      <div className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400">
        <span>⚡ 0 / 5 Free Scans</span>
      </div>
    );
  }

  if (usage === undefined) {
    return (
      <div className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-550 animate-pulse">
        <span>⚡ Loading scans...</span>
      </div>
    );
  }

  const { scansToday = 0 } = usage;

  if (scansToday >= 5) {
    return (
      <Link 
        href="/pricing"
        className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-[10px] font-bold text-red-400 transition"
      >
        <span>⚠️ Daily Limit Reached (5/5)</span>
        <span className="text-[9px] underline text-red-500 hover:text-red-400">Upgrade</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
      <span className="text-emerald-400 font-bold">⚡ {scansToday} / 5</span>
      <span className="text-zinc-500">Free Scans Used Today</span>
    </div>
  );
}
