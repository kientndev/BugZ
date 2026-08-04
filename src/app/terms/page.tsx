'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12 font-sans">
      <div className="space-y-4 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last updated: August 4, 2026</p>
      </div>

      <section className="space-y-6 text-sm text-zinc-400 leading-relaxed">
        <p>
          Welcome to BugZ. By accessing our platform, utilizing our code scanning features, or importing git branch indices, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>1. Services Offered</span>
          </h2>
          <p>
            BugZ provides Static Application Security Testing (SAST) utilities powered by artificial intelligence models. The vulnerability audits, secure recommendations, and Unified Git diff outputs (.patch files) are generated on an &quot;as-is&quot; basis for software debugging and risk mitigation.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>2. Intellectual Property Rights</span>
          </h2>
          <p>
            You retain absolute ownership of all rights, titles, and interests in the source code snippets and git files you upload or link to BugZ. BugZ claims no ownership, license, or distribution rights over your code inputs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>3. Responsible Security & Use</span>
          </h2>
          <p>
            You agree not to run scans on proprietary codebases or third-party repositories without explicit authorization. BugZ is designed strictly for authorized security auditing, educational research, and debugging workflows. Any unauthorized scanning of third-party architectures is strictly prohibited.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-250 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>4. Disclaimer of Warranties</span>
          </h2>
          <p>
            While our AI model scans are highly advanced, they do not guarantee 100% security coverage or find every hidden flaw. BugZ does not replace manual professional penetration tests or expert threat modeling. We accept no liability for any security breaches or code failures resulting from the application of generated patch files. Always audit patch changes prior to production deployment.
          </p>
        </div>
      </section>
    </div>
  );
}
