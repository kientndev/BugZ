'use client';

import React, { useState } from 'react';
import { Mail, Clock, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setSuccess('Thank you! Your message has been sent successfully. We will get back to you shortly.');
      setName('');
      setEmail('');
      setMessage('');
      setType('General');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      {/* Left Column: Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            Get in Touch
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Let\'s secure your system.
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Have questions about enterprise custom rules, NDA agreements, or need help with a custom SAST deployment? Our security engineers are ready to assist.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-3 text-zinc-300">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Direct Support Email</p>
              <a href="mailto:support@bugz-ai.com" className="text-sm font-semibold hover:text-emerald-400 transition">
                support@bugz-ai.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-zinc-300">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Response SLA</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">Average Response Time</span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  Under 2 Hours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NDA notice */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-start space-x-3">
          <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-200">Mutual NDA Commitment</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Need an NDA signed before an enterprise audit or sharing repo configurations? Simply mention it in your message or email us directly.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <h3 className="text-lg font-bold text-zinc-150">Send Inquiry</h3>
        
        {success && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-lg text-xs flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-lg text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Full Name *</label>
            <input
              type="text"
              required
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-250 focus:outline-none focus:border-zinc-700 text-xs transition"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Work Email *</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-250 focus:outline-none focus:border-zinc-700 text-xs transition"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Inquiry Type *</label>
            <select
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-250 focus:outline-none focus:border-zinc-700 text-xs transition"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="General">General Inquiry</option>
              <option value="Enterprise Sales">Enterprise Sales</option>
              <option value="Security Inquiry">Security Inquiry</option>
              <option value="Bug Report">Bug Report</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Message *</label>
            <textarea
              required
              rows={4}
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-250 focus:outline-none focus:border-zinc-700 text-xs transition resize-none leading-relaxed"
              placeholder="Tell us about your security needs or request details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition flex items-center justify-center space-x-2 disabled:bg-zinc-800 disabled:text-zinc-650"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <span>Submit Message</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
