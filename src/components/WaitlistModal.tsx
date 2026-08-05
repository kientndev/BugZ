'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinWaitlistMutation = useMutation(api.waitlist.joinWaitlist);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await joinWaitlistMutation({ email });
      setSuccess(true);
      trackEvent('waitlist_joined');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-md w-full p-6 relative overflow-hidden z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          /* Success View */
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-100">You're on the list!</h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                We've reserved your early-bird pricing discount. Look out for batch invites coming directly to your inbox.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* Submit Form View */
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-md font-bold text-zinc-100 leading-tight">
                Join the Pro Waitlist & Lock In Up to 50% Off
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We are rolling out Pro features in batches. Join the priority waitlist today and get an automatic 20%–50% early-bird discount when paid plans launch.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-550 mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder-zinc-700"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-medium text-xs transition flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Claiming Access...</span>
                  </>
                ) : (
                  <span>Claim Early Access Discount</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
