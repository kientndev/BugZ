'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 px-6 py-12 text-zinc-400 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-zinc-150">BugZ</h1>
              <p className="text-[10px] text-zinc-500">Autonomous Vulnerability Engine</p>
            </div>
          </Link>
          <p className="text-xs text-zinc-550 max-w-xs leading-relaxed">
            Securing codebases autonomously with advanced LLM analysis and unified diff patching.
          </p>
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-450 text-[10px] font-semibold w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini Pro Active</span>
          </div>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/scan" className="hover:text-zinc-200 transition">Scanner</Link></li>
            <li><Link href="/pricing" className="hover:text-zinc-200 transition">Pricing</Link></li>
            <li><Link href="/dashboard" className="hover:text-zinc-200 transition">Dashboard</Link></li>
            <li><span className="text-zinc-600 cursor-not-allowed">Changelog (Soon)</span></li>
          </ul>
        </div>

        {/* Col 3: Resources & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Resources & Legal</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="text-zinc-600 cursor-not-allowed">Documentation</span></li>
            <li><Link href="/privacy" className="hover:text-zinc-200 transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-zinc-200 transition">Terms of Service</Link></li>
            <li><span className="text-zinc-600 cursor-not-allowed">Security Policy</span></li>
          </ul>
        </div>

        {/* Col 4: Connect */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Connect</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="https://github.com/kientndev" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/tri-kien-founder-sentinelphish-ai/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition">LinkedIn</a></li>
            <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition">Discord</a></li>
            <li><Link href="/contact" className="hover:text-zinc-200 transition">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
        <span>&copy; {new Date().getFullYear()} BugZ Security. All rights reserved.</span>
        <span className="flex items-center space-x-1.5 font-semibold text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
          <span>Zero Code Retention Guarantee</span>
        </span>
      </div>
    </footer>
  );
}
