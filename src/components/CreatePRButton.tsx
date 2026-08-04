'use client';

import React, { useState } from 'react';
import { GitPullRequest, Loader2, Check, AlertCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { trackEvent } from '../lib/telemetry';

interface CreatePRButtonProps {
  repoUrl: string;
  vulnerabilityTitle: string;
  severity: string;
  patchContent: string;
  targetFilePath: string;
  fixedCodeContent: string;
  disabled?: boolean;
}

export default function CreatePRButton({
  repoUrl,
  vulnerabilityTitle,
  severity,
  patchContent,
  targetFilePath,
  fixedCodeContent,
  disabled
}: CreatePRButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progressText, setProgressText] = useState('Forking & Branching...');
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [prNumber, setPrNumber] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreatePR = async () => {
    if (!repoUrl) {
      setStatus('error');
      setErrorMessage('No repository source detected. PRs can only be created for scanned GitHub repositories.');
      return;
    }

    setStatus('loading');
    setProgressText('Forking & Branching...');
    setErrorMessage(null);

    // Simulate progress updates
    const timers = [
      setTimeout(() => setProgressText('Committing secure fixes...'), 1800),
      setTimeout(() => setProgressText('Opening Pull Request...'), 3500)
    ];

    try {
      const res = await fetch('/api/github/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          vulnerabilityTitle,
          severity,
          patchContent,
          targetFilePath,
          fixedCodeContent
        }),
      });

      timers.forEach(clearTimeout);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit Pull Request.');
      }

      setPrUrl(data.prUrl);
      setPrNumber(data.prNumber);
      setStatus('success');
      
      // GA4 Telemetry event
      trackEvent('pr_created', { repo_name: repoUrl });
    } catch (err: any) {
      timers.forEach(clearTimeout);
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to create PR. Ensure you have authorized GitHub connection.');
    }
  };

  if (status === 'success' && prUrl) {
    return (
      <a
        href={prUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition animate-fade-in"
      >
        <Check className="h-3.5 w-3.5" />
        <span>PR #{prNumber} Created!</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-1 relative">
      <button
        onClick={handleCreatePR}
        disabled={disabled || status === 'loading'}
        className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
          status === 'loading'
            ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-wait'
            : status === 'error'
              ? 'bg-red-950/40 border border-red-900/30 text-red-405 hover:bg-red-900/10'
              : 'bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-zinc-150'
        }`}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-450" />
            <span>{progressText}</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span>Retry PR</span>
          </>
        ) : (
          <>
            <GitPullRequest className="h-3.5 w-3.5 text-emerald-500" />
            <span>Create Fix PR</span>
          </>
        )}
      </button>

      {status === 'error' && errorMessage && (
        <div className="absolute right-0 top-8 z-10 p-2.5 bg-zinc-950 border border-red-900/40 text-[10px] text-red-400 rounded-lg max-w-xs shadow-xl leading-normal animate-slide-up">
          <div className="flex items-start space-x-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
