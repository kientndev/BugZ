'use client';

import React from 'react';
import { ShieldCheck, Cpu, GitPullRequest, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const steps = [
    {
      title: '1. Ingestion',
      desc: 'BugZ ingests raw code snippets or clones git branches using GitHub\'s public APIs.',
      icon: GitPullRequest,
    },
    {
      title: '2. Analysis',
      desc: 'Static Analysis Engines parse the code structures, tokenizing key components.',
      icon: Cpu,
    },
    {
      title: '3. LLM Audit',
      desc: 'Gemini Pro inspects the code contextually for injection, auth bypasses, and secrets leaks.',
      icon: ShieldCheck,
    },
    {
      title: '4. Patches Synthesis',
      desc: 'Unified Git Diff engine generates standard .patch files that can be directly applied locally.',
      icon: Eye,
    },
  ];

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col justify-between py-12 px-6 lg:px-16 max-w-5xl mx-auto w-full space-y-16">
      {/* Hero Header */}
      <section className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          About BugZ
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
          Static Application Security Testing (SAST) Reinvented.
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm lg:text-base leading-relaxed">
          BugZ combines traditional code structure parsers with advanced LLM reasoning to detect, explain, and automatically repair codebase security flaws in seconds.
        </p>
      </section>

      {/* Grid of Steps */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx} 
              className="p-5 bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 rounded-xl flex flex-col space-y-4"
            >
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg w-fit">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Detail Block */}
      <section className="p-8 border border-border bg-card text-card-foreground shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Settings className="h-6 w-6 text-emerald-500" />
            <span>Why Git Patches?</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instead of simply flagging vulnerabilities and leaving developers to guess the fix, BugZ outputs standard Unified Git Diff parameters. You can download the `.patch` file directly and apply it to your local git tree instantly:
          </p>
          <pre className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 rounded-lg overflow-x-auto">
            git apply patch.diff
          </pre>
        </div>
        <div className="shrink-0">
          <Link href="/scan">
            <button className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition shadow-lg shadow-emerald-950/20">
              Try Scanner Now
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
