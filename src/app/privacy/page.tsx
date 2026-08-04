'use client';

import React from 'react';
import { ShieldCheck, EyeOff, Lock, Server } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12 font-sans">
      <div className="space-y-4 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last updated: August 4, 2026</p>
      </div>

      <section className="space-y-6 text-sm text-zinc-400 leading-relaxed">
        <p>
          At BugZ, we take the security and privacy of your source code and configurations extremely seriously. This Privacy Policy details how we handle, process, and protect your data when utilizing our autonomous vulnerability scanning platform.
        </p>

        {/* Highlight pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-2">
            <EyeOff className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-200">Zero Retention</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              We process your code snippets and GitHub repository files strictly in-memory. Once the scan is complete, all analyzed buffers are completely destroyed.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-200">No Model Training</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              We do not train LLMs on your source code. Your logic, structures, and proprietary intelligence never enter any third-party fine-tuning loops.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-2">
            <Server className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-200">Strict Encryption</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              All payload transits between your browser, our servers, and Gemini AI processing nodes are protected with TLS 1.3 transport encryption.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>1. Information We Process</span>
          </h2>
          <p>
            When running a code scan, we ingest the source code snippet or crawl repository files from the public URL provided. This information is classified as <strong>Transient Scanning Data</strong>. It is transferred securely over HTTPS, compiled briefly in RAM to prepare the prompt context, and fed to the LLM audit endpoint. We store the final vulnerability result reports under your account history only if you are authenticated.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>2. Account & Analytics Data</span>
          </h2>
          <p>
            For logged-in users, we store profile credentials, usernames, and profile metadata provided by Clerk Authentication, and we reference scan history hashes in Convex Cloud. This is used solely to render your personal scan history and statistics dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>3. Changes to this Policy</span>
          </h2>
          <p>
            We may update our privacy policies to reflect platform expansions. If changes are significant, we will notify users via dashboard flags or email alerts.
          </p>
        </div>
      </section>
    </div>
  );
}
