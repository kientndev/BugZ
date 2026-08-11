'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  TrendingUp, 
  Flame, 
  FileText 
} from 'lucide-react';

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const pastScans = useQuery(api.scans.getMyScans, isSignedIn ? { userId: user?.id } : {});

  // Calculate statistics
  const totalScans = pastScans ? pastScans.length : 0;
  let totalVulns = 0;
  let patchesGenerated = 0;

  if (pastScans) {
    pastScans.forEach((scan: any) => {
      totalVulns += scan.results.length;
      scan.results.forEach((r: any) => {
        if (r.gitDiff) patchesGenerated++;
      });
    });
  }

  const loadScanIntoScanner = (scan: any) => {
    localStorage.setItem('bugz_load_scan', JSON.stringify(scan));
    router.push('/scan');
  };

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-border pb-4 justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-bold font-sans bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">Audit History & Dashboard</h2>
        </div>
        {isSignedIn && (
          <span className="text-xs text-muted-foreground font-mono">
            Linked ID: {user.username || user.id}
          </span>
        )}
      </div>

      {!isSignedIn ? (
        <div className="flex flex-col items-center justify-center p-12 border border-cyan-500/20 rounded-2xl bg-slate-950/80 backdrop-blur-md text-center max-w-xl mx-auto shadow-[0_0_30px_rgba(34,211,238,0.06)]">
          <Database className="h-12 w-12 text-cyan-400 mb-3 animate-pulse" />
          <h3 className="text-foreground font-bold tracking-tight text-lg">Authentication Required</h3>
          <p className="text-muted-foreground text-xs max-w-xs mt-2 mb-6 leading-relaxed">
            Please sign in to view your scan history and persist reports.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-white transition shadow-lg shadow-cyan-950/20 cursor-pointer">
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      ) : pastScans === undefined ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 rounded-xl p-5 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Scans Run</p>
                <h3 className="text-2xl font-extrabold text-foreground">{totalScans}</h3>
              </div>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 rounded-xl p-5 flex items-center space-x-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Vulnerabilities Detected</p>
                <h3 className="text-2xl font-extrabold text-foreground">{totalVulns}</h3>
              </div>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 rounded-xl p-5 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Diff Patches Synthesized</p>
                <h3 className="text-2xl font-extrabold text-foreground">{patchesGenerated}</h3>
              </div>
            </div>
          </div>

          {/* Scans Grid */}
          {pastScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-muted/40 text-center">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-foreground font-medium">No Scans Recorded</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                Your completed codebase scans will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastScans.map((scan: any) => {
                const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
                scan.results.forEach((r: any) => {
                  const sev = r.severity.toUpperCase();
                  if (sev in severityCounts) severityCounts[sev as keyof typeof severityCounts]++;
                });

                return (
                  <div 
                    key={scan._id} 
                    className="border border-border bg-card text-card-foreground shadow-sm rounded-xl p-5 hover:border-zinc-400 dark:hover:border-zinc-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          scan.inputType === 'GITHUB' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {scan.inputType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(scan.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="bg-slate-950 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">
                        {scan.input}
                      </div>

                      <div className="flex items-center space-x-3 pt-1">
                        <span className="text-xs text-muted-foreground font-semibold">Vulnerabilities:</span>
                        {severityCounts.CRITICAL > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400">
                            {severityCounts.CRITICAL} Critical
                          </span>
                        )}
                        {severityCounts.HIGH > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-400">
                            {severityCounts.HIGH} High
                          </span>
                        )}
                        {severityCounts.MEDIUM > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/20 border border-emerald-500/30 text-[10px] font-bold text-amber-300">
                            {severityCounts.MEDIUM} Med
                          </span>
                        )}
                        {scan.results.length === 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                            Clean
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => loadScanIntoScanner(scan)}
                      className="w-full text-center py-2 text-primary hover:underline font-medium text-xs rounded-lg transition"
                    >
                      Load Report in Scanner
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
