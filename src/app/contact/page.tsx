'use client';

import React, { useState } from 'react';
import { Mail, Clock, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitContactMutation = useMutation(api.waitlist.submitContactMessage);

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
      await submitContactMutation({
        name,
        email,
        inquiryType: type,
        message,
      });

      setSuccess('Message sent! Kien and the BugZ team will respond within 24 hours.');
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
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start bg-background text-foreground">
      {/* Left Column: Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            Get in Touch
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Let's secure your system.
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Have questions about enterprise custom rules, NDA agreements, or need help with a custom SAST deployment? Our security engineers are ready to assist.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-3 text-foreground">
            <div className="p-2 bg-muted border border-border rounded-lg text-emerald-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Direct Support Email</p>
              <a href="mailto:support@bugz-ai.com" className="text-sm font-semibold hover:text-emerald-400 transition">
                support@bugz-ai.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-foreground">
            <div className="p-2 bg-muted border border-border rounded-lg text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Response SLA</p>
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
        <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-start space-x-3">
          <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">Mutual NDA Commitment</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Need an NDA signed before an enterprise audit or sharing repo configurations? Simply mention it in your message or email us directly.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="bg-card text-card-foreground border border-border shadow-sm rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-foreground">Send Inquiry</h3>
        
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
            <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
            <input
              type="text"
              required
              className="w-full px-3.5 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground text-xs transition"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Work Email *</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground text-xs transition"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Inquiry Type *</label>
            <select
              className="w-full px-3.5 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground text-xs transition"
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
            <label className="text-xs font-semibold text-muted-foreground">Message *</label>
            <textarea
              required
              rows={4}
              className="w-full px-3.5 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground text-xs transition resize-none leading-relaxed"
              placeholder="Tell us about your security needs or request details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition flex items-center justify-center space-x-2 disabled:bg-zinc-850 disabled:text-zinc-650"
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
