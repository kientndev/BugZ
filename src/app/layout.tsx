import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "../components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navbar />
            <div className="flex-1 flex flex-col">
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
