'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Code, Info, LayoutDashboard } from 'lucide-react';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  const links = [
    { name: 'Home', href: '/', icon: ShieldCheck },
    { name: 'Scanner', href: '/scan', icon: Code },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              BugZ
            </h1>
            <p className="text-[10px] text-zinc-500 font-sans">Autonomous Vulnerability Engine</p>
          </div>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Gemini Active Badge */}
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Gemini Pro Active
        </div>

        {/* Auth components */}
        <div className="border-l border-zinc-850 pl-4">
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-zinc-400 hidden lg:inline">Welcome, {user.firstName || user.username}</span>
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white transition">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
