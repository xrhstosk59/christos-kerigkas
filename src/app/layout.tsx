// src/app/layout.tsx - OPTIMIZED & WORKING
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultMetadata, generatePersonJsonLd, generateWebsiteJsonLd } from "@/lib/utils/seo";
import "./globals.css";

// ✅ OPTIMIZED FONT LOADING
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false, // Not critical
  fallback: ["monospace"],
});

// ✅ METADATA
export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL('https://christoskerigkas.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: 'index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1',
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID || ''
  },
  applicationName: "Christos Kerigkas Portfolio",
};

// ✅ VIEWPORT
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 2,
  userScalable: true,
};

// ✅ STRUCTURED DATA
const personJsonLd = generatePersonJsonLd();
const websiteJsonLd = generateWebsiteJsonLd();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* ✅ STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        
        {/* ✅ CRITICAL PRECONNECTS ONLY */}
        <link rel="preconnect" href="https://tnwbnlbmlqoxypsqdqii.supabase.co" />
        <link rel="dns-prefetch" href="https://tnwbnlbmlqoxypsqdqii.supabase.co" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        )}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen text-crisp custom-scrollbar transition-theme`}>
        {/* ✅ ACCESSIBILITY SKIP LINK */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:top-2 focus:left-2 focus:rounded focus-ring"
        >
          Skip to content
        </a>
        
        {/* ✅ THEME PROVIDER - Your custom provider */}
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
        
        {/* ✅ PERFORMANCE OPTIMIZATION SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Preload critical pages when idle
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  const preloadPages = ['/cv'];
                  preloadPages.forEach(page => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = page;
                    document.head.appendChild(link);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}