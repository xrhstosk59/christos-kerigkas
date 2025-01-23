// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/themeprovider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap", // Βελτίωση απόδοσης φόρτωσης γραμματοσειράς
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    default: "Christos Kerigkas | Full Stack Developer",
    template: "%s | Christos Kerigkas"
  },
  description: "Full Stack Developer specializing in Next.js, React, and TypeScript. Building modern web applications and cryptocurrency trading solutions.",
  keywords: ["Full Stack Developer", "Web Development", "Next.js", "React", "TypeScript", "Cryptocurrency Trading", "Real Estate Platform"],
  authors: [{ name: "Christos Kerigkas" }],
  openGraph: {
    title: "Christos Kerigkas | Full Stack Developer",
    description: "Full Stack Developer specializing in Next.js, React, and TypeScript",
    url: 'https://your-domain.com',
    siteName: 'Christos Kerigkas Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}