'use client';

import React from 'react';

export default function CyberBg() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Dark Ambient Grid */}
      <svg className="absolute inset-0 h-full w-full stroke-slate-400/10 dark:stroke-slate-800/25 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]" aria-hidden="true">
        <defs>
          <pattern
            id="cyber-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            x="50%"
            y="-1"
          >
            <path d="M.5 60V.5H60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid)" />
      </svg>

      {/* Cyber Beams / Glowing Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 dark:from-cyan-500/5 dark:via-blue-500/5 dark:to-indigo-500/5 blur-[100px] rounded-full" />
      <div className="absolute top-[10%] left-[15%] w-[350px] h-[350px] bg-cyan-400/5 dark:bg-cyan-500/3 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/3 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
    </div>
  );
}
