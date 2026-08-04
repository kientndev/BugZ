'use client';

import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';

import { useEffect } from 'react';
import { trackEvent } from '../lib/telemetry';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const isValidUrl = convexUrl.startsWith("http://") || convexUrl.startsWith("https://");
const convex = new ConvexReactClient(isValidUrl ? convexUrl : "https://placeholder.convex.cloud");

function ClerkTelemetryTracker() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const hasFired = sessionStorage.getItem('ga_signup_fired');
      if (!hasFired) {
        trackEvent('sign_up', { method: 'clerk' });
        sessionStorage.setItem('ga_signup_fired', 'true');
      }
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkTelemetryTracker />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
