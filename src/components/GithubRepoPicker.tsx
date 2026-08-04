'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, RefreshCw, Lock, Globe, Code, ArrowRight, AlertTriangle } from 'lucide-react';

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

interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string;
  updatedAt: string;
  cloneUrl: string;
}

interface GithubRepoPickerProps {
  onSelectRepo: (repoUrl: string) => void;
  disabled?: boolean;
}

export default function GithubRepoPicker({ onSelectRepo, disabled }: GithubRepoPickerProps) {
  const { isSignedIn, user } = useUser();
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  const githubAccount = user?.externalAccounts.find((account) => account.provider === 'github');

  const fetchRepos = async () => {
    if (!isSignedIn || !githubAccount) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'GITHUB_NOT_CONNECTED') {
          setError('GITHUB_NOT_CONNECTED');
        } else {
          throw new Error(data.error || 'Failed to retrieve repositories');
        }
      } else {
        setRepos(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred fetching repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && githubAccount) {
      fetchRepos();
    }
  }, [isSignedIn, githubAccount]);

  const connectGithub = async () => {
    if (!user) return;
    try {
      const res = await user.createExternalAccount({
        strategy: 'oauth_github',
        redirectUrl: window.location.href,
      });
      if (res.verification?.externalVerificationRedirectURL) {
        window.location.href = res.verification.externalVerificationRedirectURL.toString();
      }
    } catch (err: any) {
      console.error('Clerk GitHub OAuth trigger error:', err);
    }
  };

  // Language Dot Color Helper
  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'typescript': return 'bg-blue-500';
      case 'javascript': return 'bg-yellow-500';
      case 'python': return 'bg-sky-650';
      case 'go': return 'bg-cyan-550';
      case 'rust': return 'bg-orange-600';
      case 'html': return 'bg-red-500';
      case 'css': return 'bg-indigo-500';
      default: return 'bg-zinc-550';
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-zinc-800 rounded-xl bg-zinc-900/10 text-center min-h-[300px]">
        <GithubIcon className="h-12 w-12 text-zinc-700 mb-3" />
        <h3 className="text-zinc-450 font-semibold">Sign In Required</h3>
        <p className="text-zinc-550 text-xs max-w-xs mt-1 mb-4 leading-relaxed">
          Please log into your account to scan and view connected GitHub repositories.
        </p>
      </div>
    );
  }

  if (!githubAccount || error === 'GITHUB_NOT_CONNECTED') {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-zinc-800 rounded-xl bg-zinc-900/10 text-center min-h-[350px] space-y-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-emerald-500">
          <GithubIcon className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-sm font-bold text-zinc-200">Connect GitHub to Import Repositories</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Grant read access to import and list your public and private repositories for instant security auditing.
          </p>
        </div>
        <button
          onClick={connectGithub}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition flex items-center space-x-2"
        >
          <span>Connect GitHub Account</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch = repo.fullName.toLowerCase().includes(search.toLowerCase());
    if (visibilityFilter === 'all') return matchesSearch;
    if (visibilityFilter === 'private') return matchesSearch && repo.isPrivate;
    if (visibilityFilter === 'public') return matchesSearch && !repo.isPrivate;
    return matchesSearch;
  });

  return (
    <div className="space-y-4 flex flex-col h-full min-h-[400px]">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-550" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-zinc-700 text-xs transition"
            placeholder="Filter repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px] font-semibold text-zinc-400">
            {(['all', 'public', 'private'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setVisibilityFilter(filter)}
                className={`px-3 py-1 rounded transition uppercase ${
                  visibilityFilter === filter 
                    ? 'bg-zinc-850 text-zinc-200 border border-zinc-800' 
                    : 'hover:text-zinc-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={fetchRepos}
            disabled={loading}
            className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-450 rounded-lg transition"
            title="Refresh repository list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && error !== 'GITHUB_NOT_CONNECTED' && (
        <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg text-xs flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-zinc-850 bg-zinc-900/10 rounded-xl space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                <div className="h-4 w-12 bg-zinc-800 rounded"></div>
              </div>
              <div className="h-3 w-48 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-805 rounded-xl min-h-[250px]">
          <Code className="h-10 w-10 text-zinc-700 mb-2" />
          <p className="text-zinc-550 text-xs">No repositories found matching filters.</p>
        </div>
      ) : (
        /* Repository List Container */
        <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[450px] flex-1 pr-1">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="p-4 border border-zinc-850 hover:border-zinc-750 bg-zinc-900/10 hover:bg-zinc-900/20 rounded-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{repo.fullName}</h4>
                  <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    repo.isPrivate 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' 
                      : 'bg-zinc-850 text-zinc-400 border-zinc-800'
                  }`}>
                    {repo.isPrivate ? (
                      <>
                        <Lock className="h-2 w-2" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-2 w-2" />
                        <span>Public</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-zinc-500">
                  <span className="flex items-center space-x-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${getLanguageColor(repo.language)}`}></span>
                    <span>{repo.language}</span>
                  </span>
                  <span>•</span>
                  <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectRepo(repo.fullName)}
                disabled={disabled}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 hover:text-zinc-100 transition flex items-center justify-center space-x-1 border border-zinc-700"
              >
                <span>Scan Repository</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
