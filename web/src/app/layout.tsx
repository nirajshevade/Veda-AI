import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { PWAProvider } from "@/components/PWAProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#FF5A36",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Extraction & Answer Mapping",
  description: "Automated examination question extraction, student handwriting transcription, answer mapping and grading.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VedaAI",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full min-h-[100dvh]">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VedaAI" />
      </head>
      <body className="h-full min-h-[100dvh] bg-[#EBEBEB] text-gray-900 flex flex-col md:flex-row overflow-hidden antialiased select-none">
        {/* Floating Left Sidebar Card (Desktop) */}
        <Sidebar />

        {/* Floating Right Main Workspace Card (Mobile Responsive) */}
        <div className="flex-1 flex flex-col h-full min-h-0 md:h-[calc(100vh-24px)] md:my-3 md:mr-3 md:ml-0 bg-white rounded-none md:rounded-[28px] shadow-sm overflow-hidden border-0 md:border md:border-gray-100">
          {children}
        </div>

        {/* PWA Service Worker & Install Manager */}
        <PWAProvider />
      </body>
    </html>
  );
}
