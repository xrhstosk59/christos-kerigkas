// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Analytics } from "@/components/layout/analytics";
import PageTransition from "@/components/common/page-transition";
import ScrollProgress from "@/components/common/scroll-progress";
import { AuthProvider } from "@/components/providers/auth-provider";
import { defaultMetadata } from "@/lib/utils/seo";
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
    google: 'YOUR-VERIFICATION-CODE'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <ScrollProgress />
            <PageTransition>
              {children}
            </PageTransition>
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}