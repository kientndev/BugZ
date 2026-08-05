'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, GitFork, FileCode, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import InteractiveDiffPreview from '../components/InteractiveDiffPreview';

export default function LandingPage() {
  const features = [
    {
      title: 'Instant Git Ingestion',
      desc: 'Point BugZ at any public repository or file. We crawl directories, prioritize entry points, and analyze structural context.',
      icon: GitFork,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      title: 'Unified Git Diff Exporter',
      desc: 'Export vulnerabilities as standard Unified Git patches. Run "git apply" to patch codebase flaws in one command.',
      icon: FileCode,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      title: 'AI Vulnerability Radar',
      desc: 'Gemini Pro audits code contextually. Detect hardcoded API secrets, SQL injections, broken access controls, and path bypasses.',
      icon: Shield,
      color: 'text-red-400 border-red-500/20 bg-red-500/5',
    },
  ];

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 px-6 text-center space-y-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5">
          <Zap className="h-3 w-3 fill-current animate-pulse" />
          <span>V1.0 MVP RELEASE</span>
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-foreground via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-650">
          Secure Your Code Before Hackers Find The Flaws
        </h1>

        <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed">
          BugZ scans your repositories instantly using advanced AI reasoning. It identifies security vulnerabilities and synthesizes secure, one-click patch files you can apply immediately.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/scan" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/30">
              <span>Launch BugZ Scanner</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/about" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-muted hover:bg-muted/95 border border-border text-sm font-semibold text-foreground transition">
              Learn How It Works
            </button>
          </Link>
        </div>
      </section>

      {/* Interactive Diff Preview Section */}
      <section className="py-8 bg-background">
        <InteractiveDiffPreview />
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 border-t border-border bg-muted/40 w-full px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center space-x-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <span>Engineered For Modern Security</span>
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              An autonomous security assistant built to automate static application security testing (SAST) workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 bg-card border border-border rounded-xl hover:border-zinc-450 dark:hover:border-zinc-700 transition flex flex-col space-y-4 hover:shadow-sm"
                >
                  <div className={`p-3 rounded-lg border w-fit ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-foreground">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sub-CTA Section */}
      <section className="py-16 border-t border-border text-center px-6 max-w-4xl mx-auto w-full space-y-6">
        <Lock className="h-10 w-10 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Zero-Configuration SAST</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          No environment setups. No custom parser configs. Just paste your codebase entries or GitHub repositories and get clean patches instantly.
        </p>
        <div className="pt-2">
          <Link href="/scan">
            <button className="px-6 py-2.5 rounded-lg bg-muted border border-border hover:bg-muted/90 text-xs font-semibold text-foreground transition">
              Run Free Audit
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} BugZ Security Inc. All rights reserved.</span>
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">GitHub</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
