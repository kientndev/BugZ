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
import { useMutation, useConvexAuth } from 'convex/react';
import { trackEvent } from '../../lib/analytics';
import { api } from '../../../convex/_generated/api';
import GithubRepoPicker from '../../components/GithubRepoPicker';
import CreatePRButton from '../../components/CreatePRButton';
import TerminalAuditStream from '../../components/TerminalAuditStream';
import DownloadPDFButton from '../../components/DownloadPDFButton';
import UsageCounter from '../../components/UsageCounter';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface AuditFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  name: string;
  explanation: string;
  vulnerableCode: string;
  secureCode: string;
  gitDiff?: string;
  filePath?: string;
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
  const checkAndIncrementUsage = useMutation(api.scans.checkAndIncrementUsage);

  const [activeStep, setActiveStep] = useState<number>(-1);
  const [activeLeftTab, setActiveLeftTab] = useState<'snippet' | 'github'>('snippet');
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

  const handleAudit = async (overrideCode?: string) => {
    const codeToUse = overrideCode !== undefined ? overrideCode : code;
    if (!codeToUse.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setActiveStep(0);

    // Enforce daily limits for free tier
    if (isSignedIn) {
      try {
        await checkAndIncrementUsage({ userId: user?.id });
      } catch (err: any) {
        setError(err.message || 'Daily limit reached. Upgrade to Pro for unlimited scans!');
        setLoading(false);
        return;
      }
    }

    const isGithubUrl = codeToUse.trim().toLowerCase().startsWith('http') && codeToUse.toLowerCase().includes('github.com');
    
    // GA4 Telemetry event
    trackEvent('scan_executed', { repo_name: isGithubUrl ? codeToUse : 'manual_snippet' });

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
        body: JSON.stringify({ codeSnippet: codeToUse }),
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
            input: codeToUse,
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

  const handleSelectRepoToScan = (repoFullName: string) => {
    const targetUrl = `https://github.com/${repoFullName}`;
    setCode(targetUrl);
    handleAudit(targetUrl);
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
      {/* Left Panel: Input & Tabs */}
      <section className="flex flex-col space-y-4 bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
          <div className="flex space-x-1 bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-xs font-semibold text-zinc-450">
            <button
              onClick={() => setActiveLeftTab('snippet')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                activeLeftTab === 'snippet' 
                  ? 'bg-zinc-850 text-zinc-200 border border-zinc-800' 
                  : 'hover:text-zinc-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Manual Input</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('github')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                activeLeftTab === 'github' 
                  ? 'bg-zinc-850 text-zinc-200 border border-zinc-800' 
                  : 'hover:text-zinc-200'
              }`}
            >
              <GithubIcon className="h-3.5 w-3.5 text-emerald-450" />
              <span>GitHub Import</span>
            </button>
          </div>
          <UsageCounter />
        </div>

        {activeLeftTab === 'snippet' ? (
          /* Tab 1: Snippet / Manual Code Input */
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-emerald-500" />
                <h2 className="text-xs font-semibold text-zinc-200">Source Code Input</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => loadSample('sqlInjection')}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-805 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-250 transition"
                >
                  SQL Injection
                </button>
                <button 
                  onClick={() => loadSample('hardcodedSecret')}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-805 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-250 transition"
                >
                  Hardcoded Secret
                </button>
                <button 
                  onClick={() => loadSample('xssVulnerable')}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-805 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-250 transition"
                >
                  XSS Vuln
                </button>
              </div>
            </div>

            <div className="flex-1 relative border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 font-mono text-xs">
              <textarea
                className="w-full h-full min-h-[350px] lg:min-h-[450px] p-4 bg-transparent text-zinc-300 focus:outline-none resize-none leading-relaxed placeholder-zinc-700"
                placeholder="// Paste your source code, PR snippet, or GitHub URL (https://github.com/username/repo) here to run the audit..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAudit()}
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
          </div>
        ) : (
          /* Tab 2: GitHub Repository Picker */
          <div className="flex-1 overflow-y-auto">
            <GithubRepoPicker 
              onSelectRepo={handleSelectRepoToScan} 
              disabled={loading}
            />
          </div>
        )}
      </section>

      {/* Right Panel: Results / Loader */}
      <section className="flex flex-col space-y-4 bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm overflow-y-auto max-h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-foreground">Security Audit Results</h2>
          </div>
          {results && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-muted-foreground">
                {results.length} vulnerability found
              </span>
              <DownloadPDFButton results={results} targetName={isGithubUrl ? code : 'Snippet Audit'} />
            </div>
          )}
        </div>

        {/* Unauthenticated History Banner */}
        {!isSignedIn && results && (
          <div className="bg-muted border border-border rounded-lg p-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Sign in to save your audit history.</span>
            <SignInButton mode="modal">
              <button className="text-emerald-500 hover:text-emerald-400 font-semibold transition">
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
              Select a repository or paste a snippet in the left panel to execute a security audit and fetch vulnerabilities.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <TerminalAuditStream />
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl min-h-[320px] shadow-lg shadow-emerald-950/10 space-y-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 mb-2">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h3 className="text-emerald-400 font-bold text-sm">Shield Active - No Vulnerabilities Detected</h3>
            <p className="text-zinc-450 text-xs max-w-xs leading-relaxed">
              BugZ autonomous scan completed successfully. Your repository codebase matches all secure signature patterns. No security threat vulnerabilities detected.
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
                  className="border border-border rounded-xl p-5 bg-card text-card-foreground shadow-sm space-y-4 transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border ${styles.badge}`}>
                        {finding.severity}
                      </span>
                      <h3 className="text-md font-bold text-foreground mt-1.5">{finding.name}</h3>
                    </div>
                    
                    {/* View Mode Toggle & Patch Tools */}
                    {finding.gitDiff && (
                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <button
                          onClick={() => setViewModes(prev => ({ ...prev, [idx]: currentMode === 'side-by-side' ? 'diff' : 'side-by-side' }))}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-zinc-805 hover:bg-zinc-700 text-xs text-zinc-300 transition"
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
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-805 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                          title="Copy Git Patch"
                        >
                          {copiedPatchIndex === idx ? (
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-zinc-450" />
                              <span>Copy Patch</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => downloadPatch(finding.gitDiff!, `${finding.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.patch`)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-805 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                          title="Download .patch File"
                        >
                          <Download className="h-3.5 w-3.5 text-zinc-450" />
                          <span>.patch</span>
                        </button>

                        {/* GitHub PR Integration */}
                        {isGithubUrl && (
                          <CreatePRButton
                            repoUrl={code}
                            vulnerabilityTitle={finding.name}
                            severity={finding.severity}
                            patchContent={finding.gitDiff}
                            targetFilePath={finding.filePath || 'index.js'}
                            fixedCodeContent={finding.secureCode}
                            disabled={loading}
                          />
                        )}
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
                              lineStyle = 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-1.5';
                            } else if (line.startsWith('-') && !line.startsWith('---')) {
                              lineStyle = 'bg-red-950/40 text-red-300 border-l-2 border-red-500 px-1.5';
                            } else if (line.startsWith('@@')) {
                              lineStyle = 'text-cyan-400/80 font-bold bg-cyan-950/15 px-1.5';
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
                            className="text-zinc-550 hover:text-zinc-350 transition"
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
