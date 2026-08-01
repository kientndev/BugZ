'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  RefreshCw, 
  Copy, 
  Info,
  Download,
  Split,
  Eye
} from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface AuditFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  name: string;
  explanation: string;
  vulnerableCode: string;
  secureCode: string;
  gitDiff?: string;
}

const SAMPLES = {
  sqlInjection: `// Vulnerable SQL query
const userId = req.query.id;
const query = "SELECT * FROM users WHERE id = '" + userId + "'";
db.query(query, (err, result) => {
  if (err) throw err;
  res.send(result);
});`,
  hardcodedSecret: `// Firebase configuration with hardcoded secret API key
const firebaseConfig = {
  apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
  authDomain: "sentinel-audit-demo.firebaseapp.com",
  projectId: "sentinel-audit-demo",
  storageBucket: "sentinel-audit-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};`,
  xssVulnerable: `// Express route vulnerable to XSS
app.get('/welcome', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(\`<h1>Welcome, \${name}!</h1>\`);
});`
};

const PROGRESS_STEPS = [
  { id: 1, name: 'Repository Ingestion', desc: 'Parsing input, detecting GitHub URL, and fetching source files.' },
  { id: 2, name: 'AST & Code Analysis', desc: 'Tokenizing source code structures and preparing payload contexts.' },
  { id: 3, name: 'Gemini Pro Audit Engine', desc: 'Performing security scan for SQLi, XSS, secrets, and auth issues.' },
  { id: 4, name: 'Patch & Diff Synthesis', desc: 'Formulating unified Git diff patches and secure code patches.' },
  { id: 5, name: 'Finalizing Report', desc: 'Compiling vulnerability severity metrics and registering database records.' },
];

export default function ScanPage() {
  const { isSignedIn, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const saveScanMutation = useMutation(api.scans.saveScan);

  const [activeStep, setActiveStep] = useState<number>(-1);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AuditFinding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPatchIndex, setCopiedPatchIndex] = useState<number | null>(null);
  const [viewModes, setViewModes] = useState<{ [key: number]: 'side-by-side' | 'diff' }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem('bugz_load_scan');
    if (saved) {
      try {
        const scan = JSON.parse(saved);
        setCode(scan.input);
        setResults(scan.results);
        localStorage.removeItem('bugz_load_scan');
      } catch (e) {
        console.error('Failed to restore scan from localstorage:', e);
      }
    }
  }, []);

  const downloadPatch = (patchText: string, filename: string) => {
    const blob = new Blob([patchText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyPatchToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPatchIndex(index);
    setTimeout(() => setCopiedPatchIndex(null), 2000);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAudit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveStep(0);

    const isGithubUrl = code.trim().toLowerCase().startsWith('http') && code.toLowerCase().includes('github.com');
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let step = 0;
    const progressInterval = setInterval(() => {
      if (step < 2) {
        step++;
        setActiveStep(step);
      } else {
        clearInterval(progressInterval);
      }
    }, 1500);

    try {
      const responsePromise = fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet: code }),
      });

      const [response] = await Promise.all([
        responsePromise,
        delay(3200)
      ]);

      clearInterval(progressInterval);
      setActiveStep(2);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete audit');
      }

      setActiveStep(3);
      await delay(1200);

      setActiveStep(4);
      await delay(1000);

      setResults(data);

      // Auto-save logic
      if (isSignedIn) {
        try {
          await saveScanMutation({
            userId: user?.id,
            input: code,
            inputType: isGithubUrl ? 'GITHUB' : 'RAW_CODE',
            results: data,
          });
        } catch (dbErr) {
          console.warn('BugZ Database Sync Warning: Failed to auto-save scan results:', dbErr);
        }
      } else {
        console.log('Unauthenticated scan completed. Sign in to persist scan history.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during the audit.');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setActiveStep(-1);
    }
  };

  const loadSample = (sampleKey: keyof typeof SAMPLES) => {
    setCode(SAMPLES[sampleKey]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/40 border-red-800 text-red-400',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/40 border-orange-800 text-orange-400',
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/40 border-amber-800 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      default:
        return {
          bg: 'bg-zinc-900 border-zinc-700 text-zinc-400',
          badge: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        };
    }
  };

  const isGithubUrl = code.trim().toLowerCase().startsWith('http') && code.toLowerCase().includes('github.com');

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Left Panel: Input */}
      <section className="flex flex-col space-y-4 bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-zinc-200">Source Code Input</h2>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => loadSample('sqlInjection')}
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
            >
              SQL Injection
            </button>
            <button 
              onClick={() => loadSample('hardcodedSecret')}
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
            >
              Hardcoded Secret
            </button>
            <button 
              onClick={() => loadSample('xssVulnerable')}
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
            >
              XSS Vuln
            </button>
          </div>
        </div>

        <div className="flex-1 relative border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 font-mono text-sm">
          <textarea
            className="w-full h-full min-h-[350px] lg:min-h-[500px] p-4 bg-transparent text-zinc-300 focus:outline-none resize-none leading-relaxed placeholder-zinc-700"
            placeholder="// Paste your source code, PR snippet, or GitHub URL (https://github.com/username/repo) here to run the audit..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAudit}
            disabled={loading || !code.trim()}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 font-medium text-white transition-all shadow-lg shadow-emerald-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isGithubUrl ? 'Fetching repository from GitHub...' : 'Auditing with Gemini...'}</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>Run Security Audit</span>
              </>
            )}
          </button>
          <button
            onClick={() => { setCode(''); setResults(null); setError(null); }}
            className="px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition"
            title="Clear all"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Right Panel: Results / Loader */}
      <section className="flex flex-col space-y-4 bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-200">Security Audit Results</h2>
          </div>
          {results && (
            <span className="text-xs text-zinc-500">
              {results.length} vulnerability found
            </span>
          )}
        </div>

        {/* Unauthenticated History Banner */}
        {!isSignedIn && results && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs text-zinc-400">
            <span>Sign in to save your audit history.</span>
            <SignInButton mode="modal">
              <button className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                Sign In
              </button>
            </SignInButton>
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-lg min-h-[300px]">
            <ShieldCheck className="h-12 w-12 text-zinc-700 mb-3" />
            <h3 className="text-zinc-400 font-medium">No Active Scan</h3>
            <p className="text-zinc-650 text-sm max-w-sm mt-1">
              Paste your codebase snippet or GitHub URL in the left panel and trigger the security audit to inspect for security risks.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && activeStep >= 0 && (
          <div className="flex-1 flex flex-col justify-center p-4 space-y-5 min-h-[350px]">
            <div className="space-y-1.5 text-center border-b border-zinc-800 pb-3">
              <h3 className="text-zinc-200 font-bold text-md flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                <span>BugZ AI Execution Engine</span>
              </h3>
              <p className="text-[10px] text-zinc-550">Autonomous analysis & patch pipeline</p>
            </div>

            <div className="space-y-3.5">
              {PROGRESS_STEPS.map((step, idx) => {
                const isCompleted = activeStep > idx;
                const isActive = activeStep === idx;
                const isPending = activeStep < idx;

                return (
                  <div 
                    key={step.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                      isActive 
                        ? 'bg-emerald-950/10 border-emerald-800/30 text-zinc-100' 
                        : isCompleted 
                          ? 'bg-zinc-900/10 border-zinc-850 text-zinc-400 opacity-60' 
                          : 'bg-transparent border-transparent text-zinc-650 opacity-40'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <div className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                          ✓
                        </div>
                      ) : isActive ? (
                        <div className="relative flex h-4 w-4 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-zinc-800 flex items-center justify-center text-[9px] font-semibold text-zinc-500">
                          {step.id}
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-semibold ${isActive ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {step.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-red-900/30 bg-red-950/10 rounded-lg min-h-[300px]">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-red-400 font-medium">Analysis Failed</h3>
            <p className="text-red-500/80 text-sm max-w-md mt-1 font-mono text-left bg-zinc-950/80 p-3 rounded border border-red-900/30 overflow-auto">
              {error}
            </p>
          </div>
        )}

        {/* Clean State (No Vulns Found) */}
        {results && results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-emerald-950/20 bg-emerald-950/5 rounded-lg min-h-[300px]">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-emerald-400 font-medium">Scan Clean</h3>
            <p className="text-zinc-500 text-sm max-w-sm mt-1">
              Gemini Pro completed the scan and found no security flaws matching the standard vulnerability profiles.
            </p>
          </div>
        )}

        {/* Audit Results Feed */}
        {results && results.length > 0 && (
          <div className="space-y-6">
            {results.map((finding, idx) => {
              const styles = getSeverityColor(finding.severity);
              const currentMode = viewModes[idx] || 'side-by-side';
              
              return (
                <div 
                  key={idx} 
                  className="border rounded-lg p-5 bg-zinc-900/50 backdrop-blur-sm space-y-4 transition-all hover:border-zinc-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border ${styles.badge}`}>
                        {finding.severity}
                      </span>
                      <h3 className="text-md font-bold text-zinc-100 mt-1.5">{finding.name}</h3>
                    </div>
                    
                    {/* View Mode Toggle & Patch Tools */}
                    {finding.gitDiff && (
                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <button
                          onClick={() => setViewModes(prev => ({ ...prev, [idx]: currentMode === 'side-by-side' ? 'diff' : 'side-by-side' }))}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                          title="Toggle Diff View"
                        >
                          {currentMode === 'side-by-side' ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-emerald-400" />
                              <span>View Git Diff</span>
                            </>
                          ) : (
                            <>
                              <Split className="h-3.5 w-3.5 text-emerald-400" />
                              <span>View Side-by-Side</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => copyPatchToClipboard(finding.gitDiff!, idx)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                          title="Copy Git Patch"
                        >
                          {copiedPatchIndex === idx ? (
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-zinc-400" />
                              <span>Copy Patch</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => downloadPatch(finding.gitDiff!, `${finding.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.patch`)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                          title="Download .patch File"
                        >
                          <Download className="h-3.5 w-3.5 text-zinc-400" />
                          <span>.patch</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-zinc-450 flex items-start space-x-2 bg-zinc-950/40 p-3 rounded border border-zinc-800">
                    <Info className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                    <p>{finding.explanation}</p>
                  </div>

                  {/* Code Visualizers */}
                  {currentMode === 'diff' && finding.gitDiff ? (
                    /* Unified Diff View */
                    <div className="border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden flex flex-col">
                      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400">Unified Git Diff</span>
                      </div>
                      <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code className="block">
                          {finding.gitDiff.split('\n').map((line, lineIdx) => {
                            let lineStyle = 'text-zinc-450';
                            if (line.startsWith('+') && !line.startsWith('+++')) {
                              lineStyle = 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-1';
                            } else if (line.startsWith('-') && !line.startsWith('---')) {
                              lineStyle = 'bg-red-950/40 text-red-300 border-l-2 border-red-500 px-1';
                            } else if (line.startsWith('@@')) {
                              lineStyle = 'text-cyan-400/80 font-bold bg-cyan-950/15 px-1';
                            } else if (line.startsWith('---') || line.startsWith('+++')) {
                              lineStyle = 'text-zinc-500 font-bold';
                            }
                            return (
                              <div key={lineIdx} className={lineStyle}>
                                {line}
                              </div>
                            );
                          })}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    /* Side-by-Side Snippets */
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* Vulnerable Code */}
                      <div className="border border-red-950 bg-red-950/10 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-red-950/30 border-b border-red-950 px-3 py-1.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-red-400">Vulnerable Snippet</span>
                        </div>
                        <pre className="p-3 text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          <code>{finding.vulnerableCode}</code>
                        </pre>
                      </div>

                      {/* Secure Code */}
                      <div className="border border-emerald-950 bg-emerald-950/10 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-emerald-950/30 border-b border-emerald-950 px-3 py-1.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-400">Patched Secure Code</span>
                          <button
                            onClick={() => copyToClipboard(finding.secureCode, idx)}
                            className="text-zinc-550 hover:text-zinc-300 transition"
                            title="Copy secure code"
                          >
                            {copiedIndex === idx ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          <code>{finding.secureCode}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
