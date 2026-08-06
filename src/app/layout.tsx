import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import "leaflet/dist/leaflet.css";

import { CookieConsent } from "@/components/CookieConsent";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rybio",
  description: "Aplikacja dla wędkarzy i baza łowisk.",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Script
        id="ahrefs-analytics"
        src="https://analytics.ahrefs.com/analytics.js"
        data-key="o8rGh8XI3Fbjv3Kv/V1w6g"
        strategy="beforeInteractive"
      />

      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>

        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}

        <CookieConsent />
      </body>
    </html>
  );
}