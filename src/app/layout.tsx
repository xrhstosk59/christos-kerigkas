// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/themeprovider";
import { Analytics } from "@/components/analytics";
import { seoConfig } from "@/lib/seo";
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
  ...seoConfig.default,
  metadataBase: new URL('https://christoskerigkas.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' }
    ]
  },
  other: {
    'google-site-verification': 'YOUR-VERIFICATION-CODE'
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
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}