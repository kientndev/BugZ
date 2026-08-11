'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import WaitlistModal from '../../components/WaitlistModal';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const tiers = [
    {
      name: 'Hacker',
      price: 0,
      desc: 'Perfect for scanning local scripts and side projects.',
      features: [
        '5 scans / month limit',
        'Max repository size 10MB',
        'Public repositories only',
        'Community support channels',
      ],
      cta: 'Get Started',
      href: '/scan',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? 29 : 24,
      desc: 'For professional developers and scaling platforms.',
      features: [
        'Unlimited code scans',
        'Private repository crawler support',
        'Deep Gemini Pro 1.5 reasoning',
        '1-click Unified .patch exports',
        'Priority queue execution',
      ],
      cta: 'Upgrade to Pro',
      href: '#',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Sovereign security configurations for large teams.',
      features: [
        'Dedicated secure infrastructure',
        'Custom SAST ruleset modeling',
        'SSO / SAML authentication',
        'SLA execution guarantees',
        'Dedicated security engineer support',
      ],
      cta: 'Contact Sales',
      href: '/contact',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'How do scan limits work?',
      a: 'The Hacker plan lets you run 5 scans per calendar month for public repositories. Upgrading to Pro lifts all limits, giving you infinite raw code audits and full private repository scanning.',
    },
    {
      q: 'Do you store or train on my private code?',
      a: 'Absolutely not. BugZ operates under a Zero Code Retention Guarantee. Your source code files are parsed and analyzed purely in-memory. Once the audit completes, the payload is destroyed instantly. We never train AI models on your codebase.',
    },
    {
      q: 'What format are the fixes provided in?',
      a: 'Vulnerabilities are exported as standard Unified Git patches (.patch format). This allows you to apply fixes to your local git tree using a single terminal command: "git apply path/to/patch.diff".',
    },
    {
      q: 'Can I cancel or switch plans anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your Pro subscription at any time. If you choose yearly billing, you save 20% compared to monthly subscriptions.',
    },
  ];

  return (
    <div className="flex-1 py-12 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
          Transparent Security Pricing
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Start scanning for free, upgrade as your codebase grows.
        </p>

        {/* Toggle widget */}
        <div className="pt-4 flex items-center justify-center space-x-3">
          <span className={`text-xs font-semibold ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="w-10 h-6 rounded-full bg-muted p-1 flex items-center transition relative border border-border"
          >
            <div
              className={`w-4 h-4 rounded-full bg-cyan-500 shadow-md transform transition ${
                billingPeriod === 'yearly' ? 'translate-x-4' : ''
              }`}
            />
          </button>
          <div className="flex items-center space-x-1.5">
            <span className={`text-xs font-semibold ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-6 rounded-2xl flex flex-col justify-between border transition-all duration-300 ${
              tier.highlighted
                ? 'bg-slate-900/50 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-500/80 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] scale-105'
                : 'bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 shadow-sm hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{tier.desc}</p>
              </div>

              <div className="flex items-baseline">
                {typeof tier.price === 'number' ? (
                  <>
                    <span className="text-3xl font-extrabold text-foreground">$</span>
                    <span className="text-5xl font-black text-foreground tracking-tight">{tier.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">{tier.price}</span>
                )}
              </div>

              {/* Feature list */}
              <ul className="space-y-3.5 border-t border-border pt-5">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              {tier.name === 'Pro' ? (
                <button
                  onClick={() => setIsWaitlistOpen(true)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 transition"
                >
                  {tier.cta}
                </button>
              ) : (
                <Link href={tier.href} className="block w-full">
                  <button
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/95 border border-border text-foreground transition"
                  >
                    {tier.cta}
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="pt-8 border-t border-border max-w-3xl mx-auto w-full space-y-8">
        <h2 className="text-xl font-bold text-center text-foreground flex items-center justify-center space-x-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-foreground transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3 bg-muted/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
    </div>
  );
}
