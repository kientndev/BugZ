import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "../components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'BugZ — Autonomous AI Vulnerability Engine',
  description: 'Import GitHub repos, stream real-time AST security analysis, and auto-generate 1-click Git .patch fixes with Gemini Pro 1.5.',
  openGraph: {
    title: 'BugZ — Autonomous AI Code Security',
    description: 'Scans your codebase for OWASP flaws and writes the exact .patch fix for you.',
    url: 'https://bugz-ai.vercel.app',
    siteName: 'BugZ AI',
    images: [
      {
        url: 'https://bugz-ai.vercel.app/og-image.png', // Ensure a 1200x630 dark terminal screenshot exists in /public
        width: 1200,
        height: 630,
        alt: 'BugZ AI Scanner UI',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BugZ — Autonomous AI Vulnerability Engine',
    description: 'Scans your codebase for OWASP flaws and writes the exact .patch fix for you.',
    images: ['https://bugz-ai.vercel.app/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-foreground transition-colors duration-300 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {/* Global Grid Overlay */}
            <div className="absolute inset-0 -z-50 overflow-hidden pointer-events-none select-none">
              <svg className="absolute inset-0 h-full w-full stroke-slate-500/5 dark:stroke-slate-900/10 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]" aria-hidden="true">
                <defs>
                  <pattern id="layout-grid" width="80" height="80" patternUnits="userSpaceOnUse" x="50%" y="-1">
                    <path d="M.5 80V.5H80" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#layout-grid)" />
              </svg>
            </div>
            <Navbar />
            <div className="flex-1 flex flex-col relative z-10">
              {children}
            </div>
            <Footer />
          </Providers>
        </ThemeProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
