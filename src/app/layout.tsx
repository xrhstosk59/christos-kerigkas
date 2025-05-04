// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Analytics } from "@/components/layout/analytics";
import PageTransition from "@/components/common/page-transition";
import ScrollProgress from "@/components/common/scroll-progress";
import { AuthProvider } from "@/components/providers/auth-provider";
import ErrorBoundary from "@/components/common/error-boundary";
import { defaultMetadata, generatePersonJsonLd, generateWebsiteJsonLd } from "@/lib/utils/seo";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL('https://christoskerigkas.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' }
    ]
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
  appleWebApp: {
    title: "Christos Kerigkas",
    statusBarStyle: "black-translucent",
    capable: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Δημιουργία των JSON-LD structured data
  const personJsonLd = generatePersonJsonLd();
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Schema.org JSON-LD για Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd)
          }}
        />
        
        {/* Schema.org JSON-LD για Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd)
          }}
        />
        
        {/* Preconnect για εξωτερικές πηγές */}
        <link rel="preconnect" href="https://tnwbnlbmlqoxypsqdqii.supabase.co" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        )}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:top-2 focus:left-2 focus:rounded">
          Skip to content
        </a>
        
        <AuthProvider>
          <ThemeProvider>
            <ScrollProgress />
            <ErrorBoundary>
              <PageTransition>
                <main id="main-content">
                  {children}
                </main>
              </PageTransition>
            </ErrorBoundary>
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}