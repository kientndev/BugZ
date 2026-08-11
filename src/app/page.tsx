'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, GitFork, FileCode, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import InteractiveDiffPreview from '../components/InteractiveDiffPreview';
import ShinyText from '../components/ShinyText';
import CyberBg from '../components/CyberBg';
import SpotlightCard from '../components/SpotlightCard';

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
    <div className="flex-1 bg-background text-foreground flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-200 relative">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 px-6 text-center space-y-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* React Bits Ambient Background */}
        <CyberBg />

        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5">
            <Zap className="h-3 w-3 fill-current animate-pulse" />
            <span>V1.0 MVP RELEASE</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/25 px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5 relative">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping absolute left-3.5" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 absolute left-3.5" />
            <span className="pl-3.5">ENGINE: ONLINE</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] relative z-10">
          <ShinyText text="Secure Your Code Before Hackers Find The Flaws" speed={6} />
        </h1>

        <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed relative z-10">
          BugZ scans your repositories instantly using advanced AI reasoning. It identifies security vulnerabilities and synthesizes secure, one-click patch files you can apply immediately.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto relative z-10">
          <Link href="/scan" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer">
              <span>Launch BugZ Scanner</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/about" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-muted hover:bg-muted/95 border border-border hover:border-blue-500/30 text-sm font-semibold text-foreground transition hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] cursor-pointer">
              Learn How It Works
            </button>
          </Link>
        </div>
      </section>

      {/* Interactive Diff Preview Section */}
      <section className="py-8 bg-background">
        <InteractiveDiffPreview />
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-[#090d16]/50 rounded-xl border border-slate-900/60 shadow-[0_0_15px_rgba(34,211,238,0.02)]">
            <div className="text-3xl font-extrabold text-cyan-400">12.4M+</div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">Code Lines Audited</div>
          </div>
          <div className="p-6 bg-[#090d16]/50 rounded-xl border border-slate-900/60 shadow-[0_0_15px_rgba(34,211,238,0.02)]">
            <div className="text-3xl font-extrabold text-emerald-400">42,850+</div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">Vulnerabilities Patched</div>
          </div>
          <div className="p-6 bg-[#090d16]/50 rounded-xl border border-slate-900/60 shadow-[0_0_15px_rgba(34,211,238,0.02)]">
            <div className="text-3xl font-extrabold text-purple-400">&lt; 3.0s</div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">Average Scan Speed</div>
          </div>
        </div>
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
                <SpotlightCard key={idx}>
                  <div className="flex flex-col space-y-4">
                    <div className={`p-3 rounded-lg border w-fit ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sub-CTA Section */}
      <section className="my-16 max-w-4xl mx-auto px-6 w-full relative z-10">
        <div className="bg-[#020617] border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.08)] rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <Lock className="h-10 w-10 text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Zero-Configuration SAST</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            No environment setups. No custom parser configs. Just paste your codebase entries or GitHub repositories and get clean patches instantly.
          </p>
          <div className="pt-4">
            <Link href="/scan">
              <button className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-all shadow-lg shadow-cyan-950/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer">
                Run Free Audit
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-xs text-muted-foreground px-6 relative z-10 bg-background/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-wider text-foreground">🛡️ BUGZ AI</span>
            <span className="text-zinc-650">|</span>
            <span>&copy; {new Date().getFullYear()} BugZ Security Inc. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/about" className="hover:text-foreground transition">About</Link>
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
